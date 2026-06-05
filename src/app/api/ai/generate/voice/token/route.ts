import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API تنظیم نشده است.' }, { status: 500 });
    }

    // درخواست توکن موقت (Ephemeral Token) از سرور x.ai برای ارتباط بی‌درنگ
    // این توکن فقط برای یک نشست (Session) معتبر است و امنیت سیستم شما را تضمین می‌کند
    const response = await fetch('https://api.x.ai/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-voice-latest', // مدل اختصاصی صوت
        modalities: ['audio', 'text'],
        instructions: `شما Safi AI هستید، دستیار صوتی هوشمند اکوسیستم Safi. با لحنی دوستانه، حرفه‌ای و کوتاه پاسخ دهید.`,
        voice: 'nova', // نام یکی از صداهای استاندارد
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ x.ai Voice Token Error:', data);
      throw new Error(data.error?.message || 'خطا در دریافت توکن صوتی');
    }

    // x.ai (طبق استاندارد OpenAI) توکن موقت را در client_secret برمی‌گرداند
    const ephemeralToken = data.client_secret?.value;

    return NextResponse.json({ success: true, token: ephemeralToken });
  } catch (error: any) {
    console.error('Voice Token API Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}