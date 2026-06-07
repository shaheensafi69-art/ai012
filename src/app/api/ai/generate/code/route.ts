import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      console.error("Critical: XAI_API_KEY is missing.");
      return NextResponse.json({ error: 'مشکل فنی در سیستم رخ داده است.' }, { status: 500 });
    }

    const systemPrompt = {
      role: 'system',
      content: `You are SAFI Neural Code Engine, an elite Senior Software Engineer.
RULES:
1. ONLY return the code. Do not include filler words.
2. ALWAYS wrap the code in proper markdown blocks with the correct language identifier.
3. Include professional inline comments.
4. If the user posts an error/bug, provide the exact fix inside a code block.`
    };

    const formattedHistory = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // ارسال درخواست به مدل جدید xAI مخصوص کدنویسی (grok-build-0.1)
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-build-0.1', 
        messages: [
          systemPrompt,
          ...formattedHistory,
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // دمای بسیار پایین برای تولید کد بدون باگ
        max_tokens: 8192 // امکان تولید کدهای طولانی‌تر
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Provider Error:', errorData);
      return NextResponse.json({ error: 'مشکل سیستم در پردازش درخواست، لطفاً لحظاتی دیگر تلاش کنید.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    return NextResponse.json({ success: true, text: generatedCode });

  } catch (error: any) {
    console.error('Code Engine Backend Error:', error);
    return NextResponse.json(
      { error: 'مشکل سیستم در برقراری ارتباط، لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}