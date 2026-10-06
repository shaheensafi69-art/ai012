import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateGeminiContent } from '@/lib/gemini';

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, inputData } = body;
    const { prompt, messages = [] } = inputData;

    if (!prompt) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز.' }, { status: 401 });
    }

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const result = await generateGeminiContent({
      model: 'gemini-2.5-flash',
      contents,
      systemInstruction: 'You are SAFI Intelligent Search Agent powered by Google AI Studio. Provide real-time accurate information with citations and markdown format.',
      tools: [{ googleSearch: {} }],
      temperature: 0.3
    });

    return NextResponse.json({
      success: true,
      result: result.text,
      modelUsed: `Google AI Studio (${result.modelUsed})`
    });

  } catch (error: any) {
    console.error('Search Engine Backend Error:', error);
    return NextResponse.json({ 
      error: error.message || 'خطا در موتور جستجو' 
    }, { status: 500 });
  }
}