import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTelegramNotification } from '../../../../lib/telegram';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLAN_QUOTAS: Record<string, { images: number; videos: number }> = {
  basic: { images: 50, videos: 0 },
  creator: { images: 200, videos: 10 },
  pro: { images: 600, videos: 30 },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // رویداد پرداخت موفق در پی‌پال ویب‌هوک
    if (body.event_type === 'PAYMENT.SALE.COMPLETED' || body.event_type === 'CHECKOUT.ORDER.APPROVED') {
      
      // توجه: ساختار دریافتی بستگی به نحوه‌ی ارسال custom_id از بخش فرانت‌اَند دارد
      const customData = body.resource.custom_id || body.resource.purchase_units?.[0]?.custom_id;
      
      if (customData) {
        const [userId, planName] = customData.split(':'); // مثال ساختار: user_123:creator
        const quota = PLAN_QUOTAS[planName?.toLowerCase()];

        if (userId && quota) {
          // ۱. آپدیت دیتابیس
          await supabase
            .from('profiles')
            .update({
              plan_name: planName.charAt(0).toUpperCase() + planName.slice(1),
              images_total: quota.images,
              images_used: 0,
              videos_total: quota.videos,
              videos_used: 0
            })
            .eq('id', userId);

          // ۲. اطلاع‌رسانی تلگرام
          const amount = body.resource.amount?.total || body.resource.purchase_units?.[0]?.amount?.value || '0.00';
          
          const telegramMessage = `
💰 <b>Safi Neural Studio - New Sale!</b>
────────────────
📦 <b>Plan:</b> ${planName.toUpperCase()}
💵 <b>Amount:</b> $${amount} USD
💳 <b>Gateway:</b> PayPal (Automatic)
👤 <b>User ID:</b> <code>${userId}</code>
────────────────
🚀 <i>Quotas updated successfully in the system.</i>
          `;

          await sendTelegramNotification(telegramMessage);
        }
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error("PayPal Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}