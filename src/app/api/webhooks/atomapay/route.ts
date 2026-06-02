import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// اتصال به سوپابیس در سمت سرور
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // اضافه شدن شماره تراکنش و لینک عکس رسید
    const { orderId, amountUsd, amountAfn, customerEmail, planName, transactionId, receiptUrl } = body;

    // ۱. پیدا کردن اردر ثبت شده در مرحله قبل
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('customer_email, plan_name')
      .eq('order_id', orderId)
      .single();

    const realEmail = orderData?.customer_email || customerEmail;
    const finalPlanName = orderData?.plan_name || planName;

    if (!realEmail || realEmail === 'Unknown Email') {
      console.error('امکان پیگیری سفارش بدون ایمیل معتبر وجود ندارد.');
    }

    // ۲. خواندن مشخصات کامل کاربر از جدول profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', realEmail)
      .single();

    if (profileError) {
      console.error('Profile query error:', profileError);
    }

    const firstName = profileData?.first_name || 'نامشخص';
    const lastName = profileData?.last_name || 'نامشخص';
    const phoneNumber = profileData?.phone_number || 'نامشخص';
    const currentBalance = profileData?.credit_balance || 0;
    const dob = profileData?.date_of_birth || 'نامشخص';
    const country = profileData?.country || 'نامشخص';
    const avatarUrl = profileData?.avatar_url || '';

    // ۳. به‌روزرسانی وضعیت سفارش و ذخیره لینک عکس و کد پیگیری
    const { error: dbError } = await supabase
      .from('orders')
      .update({ 
        status: 'awaiting_verification',
        amount_afn: parseFloat(String(amountAfn).replace(/,/g, '')),
        first_name: firstName,
        last_name: lastName,
        customer_phone: phoneNumber,
        credit_balance_before: currentBalance,
        date_of_birth: dob,
        country: country,
        avatar_url: avatarUrl,
        plan_name: finalPlanName,
        transaction_id: transactionId, // ذخیره کد پیگیری
        receipt_url: receiptUrl // ذخیره لینک عکس رسید
      })
      .eq('order_id', orderId);

    if (dbError) {
      console.error('Supabase Update Error:', dbError);
      return NextResponse.json({ error: 'خطا در به‌روزرسانی نهایی دیتابیس' }, { status: 500 });
    }

    // ۴. ارسال پیام به ربات تلگرام همراه با عکس
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ success: true, message: 'تنظیمات تلگرام ناقص است.' });
    }

    // استفاده از HTML برای جلوگیری از خطاهای Parse تلگرام
    const telegramMessage = `
🌟 <b>تراکنش جدید در انتظار تایید</b> 🌟
────────────────
📦 <b>مشخصات پکیج:</b>
• نام پکیج: <b>${finalPlanName}</b>
• کد سفارش: <code>${orderId}</code>
• کد تراکنش (TID): <code>${transactionId || 'نامشخص'}</code>
• روش پرداخت: Atoma Pay (دستی)

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

    // اگر لینک عکس وجود داشت، عکس را بفرست و متن را کپشن کن
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
      // اگر به هر دلیلی عکسی آپلود نشده بود، فقط متن را بفرست
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

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'خطای داخلی سرور' }, { status: 500 });
  }
}