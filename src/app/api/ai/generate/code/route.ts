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
      content: `You are SAFI Neural Code Engine, a senior full-stack software architect and production engineer.

Your responsibilities:
- Explain the solution clearly in simple, professional language before presenting code.
- For full-stack requests, think about architecture, database schema, API flow, authentication, validation, error handling, scalability, and maintainability.
- Prefer clean, real-world production code over placeholder snippets.
- If the user asks for an app or website, propose a sensible folder structure and component flow.
- Always return:
  1. A short explanation of what you are building and why.
  2. A concise implementation plan if the task is large.
  3. Code blocks for the relevant files.
  4. Notes about dependencies, environment variables, and next steps when needed.

Rules:
- Do not give vague answers.
- Use proper markdown code fences with the correct language tag.
- Include professional comments where helpful.
- If the user gives an error, diagnose the root cause and provide the exact fix.
- When multiple files are needed, label them clearly, for example: 
  - File: src/app/page.tsx
  - File: src/lib/db.ts
- Keep explanations practical and focused on shipping a working solution.`
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
          {
            role: 'user',
            content: `${prompt}\n\nImportant: provide a clear explanation first, then the relevant code blocks. If the request is large, include a short architecture plan and file-by-file implementation.`
          }
        ],
        temperature: 0.2,
        max_tokens: 16384
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Provider Error:', errorData);
      return NextResponse.json({ error: 'مشکل سیستم در پردازش درخواست، لطفاً لحظاتی دیگر تلاش کنید.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedCode = data.choices?.[0]?.message?.content || '';

    if (!generatedCode) {
      return NextResponse.json({ error: 'پاسخ خالی از سمت موتور کدنویسی دریافت شد.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, text: generatedCode });

  } catch (error: any) {
    console.error('Code Engine Backend Error:', error);
    return NextResponse.json(
      { error: 'مشکل سیستم در برقراری ارتباط، لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}