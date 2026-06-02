import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customerEmail, planName, currency = 'USD' } = body;

    // ۱. ثبت اولیه سفارش با وضعیت pending در دیتابیس
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        amount_usd: amount,
        amount_afn: 0, 
        payment_method: 'atomapay',
        status: 'pending',
        plan_name: planName
      });

    if (insertError) {
      console.error('Supabase Insert Order Error Details:', insertError);
      return NextResponse.json({ error: `خطا در ثبت دیتابیس: ${insertError.message}` }, { status: 500 });
    }

    const API_KEY = process.env.ATOMAPAY_API_KEY;
    const MERCHANT_ID = process.env.ATOMAPAY_MERCHANT_ID;
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

    // آدرس صفحه تایید به همراه تمامی پارامترها
    const confirmPageUrl = `${BASE_URL}/confirm-payment/atoma?order_id=${orderId}&amount=${amount}&planName=${encodeURIComponent(planName)}&customerEmail=${customerEmail}`;

    if (!API_KEY) {
      return NextResponse.json({ success: true, paymentUrl: confirmPageUrl });
    }

    // ارسال درخواست به سرور درگاه AtomaPay در صورت وجود کلید
    const atomapayEndpoint = 'https://api.atomapay.net/v1/payments/create'; 

    const response = await fetch(atomapayEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amount,
        currency: currency,
        order_reference: orderId,
        customer_email: customerEmail,
        return_url: confirmPageUrl,
        webhook_url: `${BASE_URL}/api/webhooks/atomapay` 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AtomaPay Error Details, switching to manual:', data);
      return NextResponse.json({ success: true, paymentUrl: confirmPageUrl });
    }

    return NextResponse.json({ 
      success: true, 
      paymentUrl: data.payment_url || confirmPageUrl 
    });

  } catch (error: any) {
    console.error('AtomaPay Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور.' },
      { status: 500 }
    );
  }
}