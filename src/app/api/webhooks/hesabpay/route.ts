import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// اتصال به سوپابیس با کلید سرویس (برای دور زدن RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // دریافت userId که در کدهای جدید فرانت‌اند اضافه کردیم
    const { 
      orderId, amountUsd, amountAfn, customerEmail, 
      planName, transactionId, receiptUrl, userId 
    } = body;

    // ۱. دریافت مستقیم اطلاعات کاربر از جدول profiles با استفاده از userId
    let profileData = null;
    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) profileData = data;
      if (error) console.error('Profile fetch error:', error);
    }

    // استخراج مشخصات کاربر با مقادیر پیش‌فرض
    const firstName = profileData?.first_name || 'نامشخص';
    const lastName = profileData?.last_name || 'نامشخص';
    const realEmail = profileData?.email || customerEmail || 'نامشخص';
    const phoneNumber = profileData?.phone_number || 'نامشخص';
    const currentBalance = profileData?.credit_balance || 0;
    const country = profileData?.country || 'نامشخص';
    const avatarUrl = profileData?.avatar_url || '';

    // ۲. ثبت یا به‌روزرسانی سفارش (upsert)
    // استفاده از upsert ضروری است چون سفارش ممکن است برای اولین بار ثبت شود
    const { error: dbError } = await supabase
      .from('orders')
      .upsert({ 
        order_id: orderId,
        user_id: userId,
        customer_email: realEmail,
        status: 'awaiting_verification',
        amount_usd: parseFloat(amountUsd) || 0,
        amount_afn: parseFloat(String(amountAfn).replace(/,/g, '')) || 0,
        first_name: firstName,
        last_name: lastName,
        customer_phone: phoneNumber,
        credit_balance_before: currentBalance,
        country: country,
        avatar_url: avatarUrl,
        plan_name: planName,
        transaction_id: transactionId,
        receipt_url: receiptUrl 
      }, { onConflict: 'order_id' });

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'خطا در ثبت دیتابیس' }, { status: 500 });
    }

    // ۳. ارسال پیام به ربات تلگرام
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ success: true, message: 'Telegram settings missing' });
    }

    const telegramMessage = `
🌟 <b>تراکنش جدید (حساب‌پی) در انتظار تایید</b> 🌟
────────────────
📦 <b>مشخصات پکیج:</b>
• نام پکیج: <b>${planName}</b>
• کد سفارش: <code>${orderId}</code>
• کد تراکنش (TID): <code>${transactionId || 'نامشخص'}</code>
• روش پرداخت: <b>HesabPay</b>

👤 <b>مشخصات کامل کاربر:</b>
• نام: ${firstName} ${lastName}
• ایمیل: ${realEmail}
• شماره تماس: ${phoneNumber}
• کشور: ${country}
• موجودی فعلی: ${currentBalance.toLocaleString()}

💰 <b>جزئیات مالی:</b>
• مبلغ دلاری: $${parseFloat(amountUsd).toFixed(2)}
• مبلغ به افغانی: ${amountAfn} AFN
────────────────
⚠️ <b>اقدام لازم:</b> لطفاً عکس رسید پیوست شده را بررسی کنید. در صورت دریافت وجه، سفارش را تایید نمایید.
    `;

    // ارسال عکس و متن به تلگرام
    if (receiptUrl) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          photo: receiptUrl,
          caption: telegramMessage,
          parse_mode: 'HTML',
        }),
      });
    } else {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMessage + `\n\n❌ <i>اخطار: عکس رسید دریافت نشد.</i>`,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Critical Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}