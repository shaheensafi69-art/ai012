import { NextResponse } from 'next/server';
import { GEMINI_CONFIG } from '@/lib/gemini';

export const maxDuration = 120; 

export async function POST(request: Request) {
  try {
    const { text, voice } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'متن برای تبدیل به صدا ارسال نشده است.' }, { status: 400 });
    }

    // Google AI Studio Speech Synthesis endpoint
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=fa&client=tw-ob`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
      }
    });

    if (!response.ok) {
      throw new Error('خطا در تبدیل متن به گفتار');
    }

    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error: any) {
    console.error('TTS error:', error);
    return NextResponse.json({ error: error.message || 'خطا در تبدیل صدا' }, { status: 500 });
  }
}