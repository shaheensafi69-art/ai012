import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amountUsd, amountAfn, customerEmail, planName } = body;

    // ۱. پیدا کردن اردر ثبت شده
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('customer_email, plan_name')
      .eq('order_id', orderId)
      .single();

    const realEmail = orderData?.customer_email || customerEmail;
    const finalPlanName = orderData?.plan_name || planName;

    // ۲. خواندن مشخصات کامل کاربر از جدول profiles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', realEmail)
      .single();

    const firstName = profileData?.first_name || 'نامشخص';
    const lastName = profileData?.last_name || 'نامشخص';
    const phoneNumber = profileData?.phone_number || 'نامشخص';
    const currentBalance = profileData?.credit_balance || 0;
    const dob = profileData?.date_of_birth || 'نامشخص';
    const country = profileData?.country || 'نامشخص';
    const avatarUrl = profileData?.avatar_url || '';

    // ۳. به‌روزرسانی وضعیت سفارش به "در انتظار پرداخت حضوری" (awaiting_cash)
    const { error: dbError } = await supabase
      .from('orders')
      .update({ 
        status: 'awaiting_cash',
        amount_afn: parseFloat(amountAfn.replace(/,/g, '')),
        first_name: firstName,
        last_name: lastName,
        customer_phone: phoneNumber,
        credit_balance_before: currentBalance,
        date_of_birth: dob,
        country: country,
        avatar_url: avatarUrl,
        plan_name: finalPlanName
      })
      .eq('order_id', orderId);

    if (dbError) {
      console.error('Supabase Update Error:', dbError);
      return NextResponse.json({ error: 'خطا در به‌روزرسانی نهایی دیتابیس' }, { status: 500 });
    }

    // ۴. ارسال پیام به ربات تلگرام
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return NextResponse.json({ success: true, message: 'تنظیمات تلگرام ناقص است.' });
    }

    const telegramMessage = `
🏢 *اعلام مراجعه حضوری به دفتر* 🏢
--------------------------------
📦 *مشخصات پکیج:*
- نام پکیج: ${finalPlanName}
- کد سفارش: \`${orderId}\`
- روش پرداخت: Cash In Office (نقدی / حضوری)

👤 *مشخصات کامل کاربر:*
- نام: ${firstName} ${lastName}
- ایمیل: ${realEmail}
- شماره تماس: ${phoneNumber}
- کشور: ${country}
- تاریخ تولد: ${dob}

💰 *مبلغ قابل دریافت در دفتر:*
- معادل دلاری: $${parseFloat(amountUsd).toFixed(2)}
- مبلغ نهایی به افغانی: ${amountAfn} AFN

⚠️ *اقدام لازم:* این کاربر اعلام کرده است که جهت پرداخت نقدی به دفتر مراجعه می‌کند. لطفاً پس از دریافت وجه در دفتر، سفارش را تایید نمایید.
    `;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }),
    });

    return NextResponse.json({ success: true, message: 'وب‌هوک با موفقیت اجرا شد.' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'خطای داخلی سرور' }, { status: 500 });
  }
}