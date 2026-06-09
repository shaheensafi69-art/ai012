import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// تنظیم زمان پردازش برای جلوگیری از Timeout
export const maxDuration = 300; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, inputData } = body;
    const { prompt, messages = [] } = inputData;

    if (!prompt) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    // ۱. اعتبارسنجی کاربر
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
      return NextResponse.json({ error: 'خطای سرور: کلید API یافت نشد.' }, { status: 500 });
    }

    // ۲. ارسال ریکوئست به xAI
    // 🟢 نکته مهم: مدل grok-4.3 را که در SQL اضافه کردیم اینجا صدا می‌زنیم
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4.3', 
        messages: [
          { role: 'system', content: 'You are SAFI Web Agent. Search the web comprehensively and provide detailed Markdown answers.' },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.3,
        // 🟢 فعال‌سازی ابزارهای جستجو طبق داکیومنت جدید
        tools: [
          { type: "web_search" },
          { type: "x_search" }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      console.error('xAI API Error:', errorText);
      return NextResponse.json({ error: `خطای هوش مصنوعی: ${errorText}` }, { status: 500 });
    }

    // ۳. بازگرداندن استریم (بدون دستکاری در دیتابیس در این لحظه، چون استریم در فرانت‌اند هندل می‌شود)
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Search Engine Backend Error:', error);
    return NextResponse.json({ error: 'خطای غیرمنتظره در سرور' }, { status: 500 });
  }
}