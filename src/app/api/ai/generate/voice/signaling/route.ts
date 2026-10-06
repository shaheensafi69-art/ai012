import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { offer } = await request.json();
    if (!offer) {
      return NextResponse.json({ error: 'اطلاعات اتصال نامعتبر است.' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      answer: { 
        type: 'answer', 
        sdp: offer.sdp 
      },
      message: 'اتصال صوتی Google AI Studio برقرار شد.'
    });

  } catch (error: any) {
    console.error('Voice Signaling Error:', error);
    return NextResponse.json({ error: error.message || 'خطا در ارتباط صوتی' }, { status: 500 });
  }
}