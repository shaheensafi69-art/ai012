import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGeminiContent, SAFI_TEAM_CONTEXT } from '@/lib/gemini';

// جلوگیری از تایم‌اوت در پردازش‌های هوش مصنوعی
export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const { userId, pricingId, inputData } = await request.json();

    if (!userId || !pricingId || !inputData) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    const { data: pricing, error: pricingError } = await supabase
      .from('ai_pricing')
      .select('*')
      .eq('id', pricingId)
      .single();

    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'مدل چت یافت نشد.' }, { status: 404 });
    }

    const totalCreditsNeeded = pricing.credits_per_1k_input_tokens || 1;
    let creditBalance = 100;
    let isRealUser = false;

    if (userId && userId !== 'demo_user') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        creditBalance = profile.credit_balance;
        isRealUser = true;
      }
    }

    if (isRealUser && creditBalance < totalCreditsNeeded) {
      return NextResponse.json({ error: 'موجودی حساب شما کافی نیست. لطفاً حساب خود را شارژ نمایید.' }, { status: 402 });
    }

    // ==========================================
    // 🟢 ذخیره پیام کاربر در سوپابیس
    // ==========================================
    if (inputData.sessionId && inputData.userMessageId) {
      const { data: sessionCheck } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', inputData.sessionId)
        .maybeSingle();

      if (!sessionCheck) {
        await supabase.from('chat_sessions').insert({
          id: inputData.sessionId,
          user_id: userId,
          title: inputData.sessionTitle || 'New Conversation'
        });
      } else if (inputData.sessionTitle) {
        await supabase.from('chat_sessions').update({ title: inputData.sessionTitle }).eq('id', inputData.sessionId);
      }

      await supabase.from('chat_messages').insert({
        id: inputData.userMessageId,
        session_id: inputData.sessionId,
        role: 'user',
        content: inputData.prompt || 'Uploaded image(s)',
        type: 'text',
        image_urls: inputData.imageUrls || []
      });
    }

    // ==========================================
    // 🟢 ساخت کانتنت برای Google AI Studio Gemini
    // ==========================================
    const contents: Array<{ role: string; parts: Array<{ text?: string }> }> = [];

    if (inputData.messages && Array.isArray(inputData.messages)) {
      for (const m of inputData.messages) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        const textContent = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
        if (textContent.trim()) {
          contents.push({
            role,
            parts: [{ text: textContent }]
          });
        }
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: inputData.prompt || 'Hello' }]
      });
    }

    // Ensure last message is from user if history ended oddly
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: inputData.prompt || 'Continue' }]
      });
    }

    // فراخوانی موتور Gemini
    let aiResponseText = '';
    let modelUsed = 'gemini-2.5-flash';

    try {
      const geminiResult = await generateGeminiContent({
        model: 'gemini-2.5-flash',
        contents,
        systemInstruction: SAFI_TEAM_CONTEXT,
        temperature: 0.7,
      });
      aiResponseText = geminiResult.text;
      modelUsed = geminiResult.modelUsed;
    } catch (geminiError: any) {
      console.warn('Gemini API primary attempt failed:', geminiError.message);

      // اگر خطای اعتبار پیش‌پرداخت یا مدل خاصی بود، بررسی فال‌بک
      if (geminiError.message.includes('شارژ')) {
        throw geminiError;
      }

      // فال‌بک تکمیلی
      const fallbackResult = await generateGeminiContent({
        model: 'gemini-3.8-flash',
        contents,
        systemInstruction: SAFI_TEAM_CONTEXT,
        temperature: 0.7,
      });
      aiResponseText = fallbackResult.text;
      modelUsed = fallbackResult.modelUsed;
    }

    // ==========================================
    // 🟢 کسر اعتبار و ثبت پیام در دیتابیس
    // ==========================================
    const newBalance = isRealUser ? Math.max(0, creditBalance - totalCreditsNeeded) : creditBalance;
    const botMsgId = `bot_${Date.now()}`;

    if (isRealUser) {
      await supabase.from('profiles').update({ credit_balance: newBalance }).eq('id', userId);
    }

    if (inputData.sessionId) {
      await supabase.from('chat_messages').insert({
        id: botMsgId,
        session_id: inputData.sessionId,
        role: 'assistant',
        content: aiResponseText,
        type: 'text'
      });

      await supabase.from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', inputData.sessionId);
    }

    return NextResponse.json({
      success: true,
      text: aiResponseText,
      modelUsed: `Google AI Studio (${modelUsed})`,
      creditsDeducted: totalCreditsNeeded,
      remainingCredits: newBalance
    });

  } catch (error: any) {
    console.error('❌ Chat API Error:', error);
    return NextResponse.json({
      error: error.message || 'خطا در پردازش هوش مصنوعی Google AI Studio'
    }, { status: 500 });
  }
}