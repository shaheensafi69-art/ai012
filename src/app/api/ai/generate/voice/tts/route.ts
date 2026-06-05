import { NextResponse } from 'next/server';

export const maxDuration = 120; 

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();
    const XAI_API_KEY = process.env.XAI_API_KEY;

    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API تنظیم نشده است.' }, { status: 500 });
    }

    // ارسال درخواست به سرور صوتی x.ai (استاندارد OpenAI Compatible)
    const response = await fetch('https://api.x.ai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1', // مدل استاندارد تولید صدا
        input: text || 'سلام. چطور می‌توانم کمک کنم؟',
        voice: voice || 'nova' // اعمال صدای انتخابی کاربر
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ TTS Server Error:", err);
      throw new Error('خطا در تولید صدای ربات از سرور x.ai');
    }

    // دریافت فایل صوتی به صورت باینری
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}