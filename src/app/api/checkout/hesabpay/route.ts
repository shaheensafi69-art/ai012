import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customerEmail, planName } = body;

    // ۱. ثبت اولیه سفارش با وضعیت pending در دیتابیس
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        amount_usd: amount,
        amount_afn: 0, 
        payment_method: 'hesabpay',
        status: 'pending',
        plan_name: planName
      });

    if (insertError) {
      console.error('Supabase Insert Order Error Details:', insertError);
      return NextResponse.json(
        { error: `خطا در ثبت دیتابیس: ${insertError.message}` }, 
        { status: 500 }
      );
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

    // ۲. هدایت کاربر به صفحه فرانت‌اَند تایید پرداخت
    const confirmPageUrl = `${BASE_URL}/confirm-payment/hesabpay?order_id=${orderId}&amount=${amount}&planName=${encodeURIComponent(planName)}&customerEmail=${customerEmail}`;

    return NextResponse.json({ 
      success: true, 
      paymentUrl: confirmPageUrl 
    });

  } catch (error: any) {
    console.error('HesabPay Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور در پردازش حساب‌پی.' },
      { status: 500 }
    );
  }
}