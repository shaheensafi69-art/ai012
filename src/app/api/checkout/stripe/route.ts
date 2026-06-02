import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(request: Request) {
  try {
    const { planId, amount } = await request.json();

    // ۱. دریافت امن اطلاعات کاربر لاگین شده
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'کاربر لاگین نیست یا نشست منقضی شده است.' }, { status: 401 });
    }

    // آدرس دامنه شما (مثال: http://localhost:3000 یا https://safi-hub.com)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ۲. ساخت نشست پرداخت استرایپ (Checkout Session)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // اگر می‌خواهید اشتراک ماهانه خودکار تمدید شود، این را روی 'subscription' بگذارید
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SAFI Neural Studio - ${planId.toUpperCase()} Plan`,
              description: 'AI Generation Quotas & Unlimited Neural Chat',
            },
            unit_amount: Math.round(Number(amount) * 100), // استرایپ مبالغ را به سِنت (Cent) محاسبه می‌کند
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/profile?payment=success`,
      cancel_url: `${appUrl}/dashboard/checkout?plan=${planId}&payment=cancelled`,
      // متادیتا حیاتی است: وب‌هوک با این اطلاعات می‌فهمد چه کسی پرداخت کرده است
      metadata: {
        userId: user.id,
        planName: planId,
      },
    });

    // ۳. ارسال لینک پرداخت به فرانت‌اَند
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}