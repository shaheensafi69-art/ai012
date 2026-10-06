import { NextResponse } from 'next/server';
import { GEMINI_CONFIG } from '@/lib/gemini';

export async function GET(request: Request) {
  try {
    const token = `gemini_live_session_${Date.now()}`;
    return NextResponse.json({ 
      success: true, 
      token,
      engine: 'Google AI Studio Live' 
    });
  } catch (error: any) {
    console.error('Voice Token API Error:', error);
    return NextResponse.json({ error: error.message || 'خطای سرور' }, { status: 500 });
  }
}