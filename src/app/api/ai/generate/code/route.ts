import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateGeminiContent } from '@/lib/gemini';

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

    const systemPrompt = `You are SAFI Neural Code Engine, an elite full-stack software architect and senior software engineer.
You are powered by Google AI Studio Gemini Enterprise.

Your responsibilities:
- Provide direct, clear, production-ready code with best architectural patterns.
- Always include clean markdown code fences with correct language identifiers.
- Explain trade-offs, security, and edge-cases.
- Prefer elegant, modern TypeScript, Next.js, React, Tailwind CSS, or backend structures.`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: `${prompt}\n\nPlease generate a clean, fully-functioning production solution.` }]
    });

    const result = await generateGeminiContent({
      model: 'gemini-2.5-pro',
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.2,
      maxOutputTokens: 8192
    });

    return NextResponse.json({
      success: true,
      code: result.text,
      modelUsed: `Google AI Studio (${result.modelUsed})`
    });

  } catch (error: any) {
    console.error('Code Engine Backend Error:', error);
    return NextResponse.json({ 
      error: error.message || 'خطا در پردازش موتور کدنویسی' 
    }, { status: 500 });
  }
}