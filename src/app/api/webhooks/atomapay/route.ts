import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// اتصال به سوپابیس در سمت سرور
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amountUsd, amountAfn, customerEmail, planName, transactionId, receiptUrl, userId } = body;

    // ۱. خواندن مشخصات کامل کاربر از جدول profiles
    let profileData = null;
    let realEmail = customerEmail;

    if (userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        profileData = data;
        realEmail = data.email || customerEmail;
      } else if (error) {
        console.error('Profile query error:', error);
      }
    }

    const firstName = profileData?.first_name || 'نامشخص';
    const lastName = profileData?.last_name || 'نامشخص';
    const phoneNumber = profileData?.phone_number || 'نامشخص';
    const currentBalance = profileData?.credit_balance || 0;
    const dob = profileData?.date_of_birth || 'نامشخص';
    const country = profileData?.country || 'نامشخص';
    const avatarUrl = profileData?.avatar_url || '';

    // ۲. ثبت سفارش در دیتابیس
    const { error: dbError } = await supabase
      .from('orders')
      .upsert({ 
        order_id: orderId,
        user_id: userId, // 🟢 این خط اضافه شد! بسیار مهم برای دیتابیس
        customer_email: realEmail,
        status: 'awaiting_verification',
        amount_usd: parseFloat(amountUsd) || 0, // 🟢 ایمن‌سازی اعداد
        amount_afn: parseFloat(String(amountAfn).replace(/,/g, '')) || 0,
        first_name: firstName,
        last_name: lastName,
        customer_phone: phoneNumber,
        credit_balance_before: currentBalance,
        date_of_birth: dob,
        country: country,
        avatar_url: avatarUrl,
        plan_name: planName,
        transaction_id: transactionId,
        receipt_url: receiptUrl 
      }, { onConflict: 'order_id' });

    if (dbError) {
      // 🟢 این لاگ به شما در Vercel نشان می‌دهد دقیقاً چرا دیتابیس ارور داده
      console.error('❌ Supabase Upsert Error:', dbError);
      return NextResponse.json({ error: `خطای دیتابیس: ${dbError.message}` }, { status: 500 });
    }

    // ۳. ارسال پیام به ربات تلگرام
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ success: true, message: 'ذخیره شد اما تلگرام تنظیم نیست.' });
    }

    const telegramMessage = `
🌟 <b>تراکنش جدید در انتظار تایید</b> 🌟
────────────────
📦 <b>مشخصات پکیج:</b>
• نام پکیج: <b>${planName}</b>
• کد سفارش: <code>${orderId}</code>
• کد تراکنش (TID): <code>${transactionId || 'نامشخص'}</code>
• روش پرداخت: Manual Gateway

👤 <b>مشخصات کامل کاربر:</b>
• نام: ${firstName} ${lastName}
• ایمیل: ${realEmail}
• شماره تماس: ${phoneNumber}
• کشور: ${country}
• موجودی فعلی: ${currentBalance.toLocaleString()}

💰 <b>جزئیات مالی تراکنش:</b>
• مبلغ دلاری: $${parseFloat(amountUsd).toFixed(2)}
• مبلغ به افغانی: ${amountAfn} AFN
────────────────
⚠️ <b>اقدام لازم:</b> لطفاً عکس رسید پیوست شده را بررسی کنید. در صورت صحت، سفارش را تایید نمایید.
    `;

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
          text: telegramMessage + `\n\n❌ <i>اخطار: کاربر عکسی آپلود نکرده است.</i>`,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'وب‌هوک با موفقیت اجرا شد.' });

  } catch (error: any) {
    console.error('❌ Webhook Critical Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}