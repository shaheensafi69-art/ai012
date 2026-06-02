import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification } from '../../../../lib/telegram';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // استفاده از Service Key برای دور زدن محدودیت‌های RLS در بک‌اند
);

// ساختار سهمیه‌ها 
const PLAN_QUOTAS: Record<string, { images: number; videos: number }> = {
  basic: { images: 50, videos: 0 },
  creator: { images: 200, videos: 10 },
  pro: { images: 600, videos: 30 },
};

export async function POST(request: Request) {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // بررسی موفقیت‌آمیز بودن پرداخت
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // دریافت اطلاعات ثبت شده در Metadata هنگام ساخت سشن
    const userId = session.metadata?.userId;
    const planName = session.metadata?.planName?.toLowerCase();

    if (userId && planName && PLAN_QUOTAS[planName]) {
      const quota = PLAN_QUOTAS[planName];

      // ۱. دریافت اطلاعات کامل کاربر از دیتابیس برای نمایش در تلگرام
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone_number')
        .eq('id', userId)
        .single();

      // ۲. آپدیت سهمیه‌ها و نام پلن در دیتابیس سوپابیس
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          plan_name: session.metadata?.planName, // ذخیره با حروف بزرگ مثل Creator
          images_total: quota.images,
          images_used: 0, // ریست کردن مصرف قبلی
          videos_total: quota.videos,
          videos_used: 0
        })
        .eq('id', userId);

      if (dbError) {
        console.error("Database Update Error:", dbError);
      }

      // آماده‌سازی اطلاعات برای پیام تلگرام (اگر در دیتابیس نبود، از اطلاعات استرایپ استفاده می‌کند)
      const fullName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : (session.customer_details?.name || 'Unknown');
      const email = userProfile?.email || session.customer_details?.email || 'Unknown';
      const phone = userProfile?.phone_number || session.customer_details?.phone || 'Unknown';
      const amount = (session.amount_total! / 100).toFixed(2);
      const currency = session.currency?.toUpperCase();

      // ۳. ارسال پیام به ربات تلگرام با ترتیب درخواستی شما
      const telegramMessage = `
💰 <b>Safi Neural Studio - Payment Received!</b>
────────────────
👤 <b>Name:</b> ${fullName || 'N/A'}
📧 <b>Email:</b> ${email}
📞 <b>Phone:</b> ${phone}
────────────────
📦 <b>Plan:</b> ${session.metadata?.planName}
💵 <b>Amount Paid:</b> $${amount} ${currency}
💳 <b>Gateway:</b> Stripe (Automatic)
────────────────
🚀 <i>Quotas updated successfully in the system.</i>
      `;

      await sendTelegramNotification(telegramMessage);
    }
  }

  return NextResponse.json({ received: true });
}