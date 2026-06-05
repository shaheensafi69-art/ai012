import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API تنظیم نشده است.' }, { status: 500 });
    }

    // دریافت درخواست اتصال (Offer) از فرانت‌اند کاربر
    const { offer } = await request.json();
    if (!offer) {
      return NextResponse.json({ error: 'اطلاعات اتصال نامعتبر است.' }, { status: 400 });
    }

    const model = 'grok-voice-latest';
    const baseUrl = `https://api.x.ai/v1/realtime?model=${model}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 

    // 🟢 ارسال پیشنهاد ارتباط مستقیماً به سرور x.ai بدون نیاز به توکن (با بالاترین امنیت)
    const response = await fetch(baseUrl, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/sdp',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ x.ai Signaling Error:', errorText);
      throw new Error(`خطا از سرور صوتی x.ai (وضعیت: ${response.status})`);
    }

    // دریافت تاییدیه ارتباط از سرور x.ai و پاس دادن آن به فرانت‌اند
    const answerSdp = await response.text();
    return NextResponse.json({ success: true, answer: { type: 'answer', sdp: answerSdp } });

  } catch (error: any) {
    console.error('Voice Signaling API Error:', error);
    let errorMsg = error.message || 'خطای داخلی سرور';
    if (errorMsg.includes('abort') || errorMsg.includes('fetch failed')) {
      errorMsg = 'ارتباط با سرور صوتی x.ai تایم‌اوت شد.';
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}