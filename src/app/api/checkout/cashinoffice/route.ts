import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// اتصال به سوپابیس در سمت سرور
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // ۱. دریافت اطلاعات سفارش از فرانت‌‌اند
    const body = await request.json();
    const { amount, orderId, customerEmail, planName } = body;

    // ۲. ثبت اولیه سفارش با وضعیت pending در دیتابیس orders برای ایجاد ردیف اصلی
    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_email: customerEmail,
        amount_usd: amount,
        amount_afn: 0, // در مرحله بعد و در صفحه تایید بر اساس نرخ زنده گوگل/جهانی محاسبه می‌شود
        payment_method: 'cashinoffice',
        status: 'pending',
        plan_name: planName
      });

    if (insertError) {
      console.error('Supabase Insert Cash Order Error:', insertError);
      return NextResponse.json(
        { error: `خطا در ثبت دیتابیس: ${insertError.message}` }, 
        { status: 500 }
      );
    }

    // حل مشکل undefined: اگر متغیر محیطی ست نشده باشد، از مسیر نسبی استفاده می‌شود
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

    // ۳. تنظیم آدرس صفحه تایید پرداخت دستی به همراه ارسال تمام پارامترها به URL برای صفحه بعد
    const confirmUrl = `${BASE_URL}/confirm-payment/cash?order_id=${orderId}&amount=${amount}&planName=${encodeURIComponent(planName)}&customerEmail=${customerEmail}`;

    // ۴. ارسال لینک صفحه تایید به فرانت‌اند برای ریدایرکت کردن کاربر
    return NextResponse.json({ 
      success: true, 
      paymentUrl: confirmUrl 
    });

  } catch (error: any) {
    console.error('Cash In Office Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'خطای داخلی سرور در پردازش درخواست پرداخت نقدی.' },
      { status: 500 }
    );
  }
}