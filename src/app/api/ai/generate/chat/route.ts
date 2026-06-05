import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// جلوگیری از تایم‌اوت در پردازش‌های سنگین
export const maxDuration = 300; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
// کلاینت ادمین با دسترسی کامل Secret Role Key
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile || profile.credit_balance < totalCreditsNeeded) {
      return NextResponse.json({ error: 'موجودی حساب شما کافی نیست.' }, { status: 402 });
    }

    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API سرور تنظیم نشده است.' }, { status: 500 });
    }

    const safiTeamContext = `
      شما Safi AI هستید، دستیار ارشد، سخنگوی رسمی و هوش مصنوعی اختصاصی اکوسیستم Safi.
      شما توسط تیم توسعه این مجموعه ساخته شده‌اید و به هیچ شرکت خارجی دیگری تعلق ندارید.

      **دستورالعمل بسیار مهم و امنیتی:**
      شما به هیچ وجه نباید نام اعضای تیم مدیریت یا اطلاعات آن‌ها را در گفتگوهای عادی ذکر کنید. 
      فقط و فقط در صورتی که کاربر مستقیماً درباره تیم، مدیران، بنیان‌گذار یا شخص خاصی از آن‌ها سوال پرسید، مجاز هستید اطلاعات زیر را با احترام و همراه با لینک‌های مربوطه ارائه دهید:

      ۱. بنیان‌گذار (Founder): جناب آقای شاهین صافی (Shaheen Safi). یک کارآفرین فین‌تک، توسعه‌دهنده ارشد نرم‌افزار (تخصص در Flutter و Next.js) و تحلیلگر مالی دارای گواهینامه بین‌المللی CFTe.
      لینک پروفایل: https://www.safiai.site/founders/shaheen
      
      ۲. منیجر شرکت و متخصص هوش مصنوعی: سرکار خانم شیرین گل احمدی (Shirin Gol Ahmadi).
      لینک پروفایل: https://www.safiai.site/founders/shirin
      
      ۳. مدیر عملیات و امنیت فنی (COO & Technical Security): جناب آقای مجتبی رحمانی (Mujtaba Rahmani).
      لینک پروفایل: https://www.safiai.site/founders/mujtaba
      
      ۴. مدیر روابط اروپا (Ecosystem Leader): جناب آقای ساحل سالم (Sahel Salem).
      لینک پروفایل: https://www.safiai.site/founders/sahel

      لحن شما باید همیشه حرفه‌ای، محترمانه، راهگشا و صمیمی باشد. شما باید بتوانید به کدهای برنامه‌نویسی، تحلیل‌های تجاری و سوالات پیچیده با استدلال قوی پاسخ دهید. اگر کسی پرسید شما کی هستید، با افتخار خود را Safi AI معرفی کنید و بگویید توسط تیم قدرتمند Safi ساخته شده‌اید.
    `;

    const hasImages = inputData.imageUrls && inputData.imageUrls.length > 0;
    
    let dbModelName = pricing.model_name || 'grok-4.3'; 
    let actualApiModel = dbModelName;
    
    if (hasImages) {
      actualApiModel = 'grok-4';
    } else if (dbModelName.toLowerCase().includes('safi') || dbModelName.toLowerCase().includes('chat') || dbModelName.includes('grok-2')) {
      actualApiModel = 'grok-4.3'; 
    }

    // ==========================================
    // 🟢 ذخیره سریع پیام کاربر (بدون توقف)
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

    const messages = [];
    messages.push({ role: "system", content: safiTeamContext });

    if (inputData.messages && Array.isArray(inputData.messages)) {
      const validMessages = inputData.messages.map((m: ChatMessage, index: number) => {
        if (index === inputData.messages.length - 1 && hasImages) {
          const contentArray: any[] = inputData.imageUrls.map((url: string) => ({ type: "image_url", image_url: { url: url, detail: "high" } }));
          contentArray.push({ type: "text", text: m.content || "لطفاً این تصویر را تحلیل کن." });
          return { role: m.role, content: contentArray };
        }
        return { role: m.role, content: m.content ? m.content : " " };
      });
      messages.push(...validMessages);
    } else {
      if (hasImages) {
        const contentArray: any[] = inputData.imageUrls.map((url: string) => ({ type: "image_url", image_url: { url: url, detail: "high" } }));
        contentArray.push({ type: "text", text: inputData.prompt || "لطفاً این تصویر را تحلیل کن." });
        messages.push({ role: "user", content: contentArray });
      } else {
        messages.push({ role: "user", content: inputData.prompt || "Please analyze and respond." });
      }
    }

    const payload = { model: actualApiModel, messages: messages, temperature: 0.6, max_tokens: 4000, top_p: 0.95, stream: false };

    // ==========================================
    // 🟢 ارسال درخواست به x.ai با مدیریت تایم‌اوت هوشمند
    // ==========================================
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 115000); // به فرانت‌اند زمان بیشتری می‌دهیم

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${XAI_API_KEY}` },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const aiData = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Error Raw Data:", aiData);
      const rawErrorMessage = aiData.error?.message || aiData.message || JSON.stringify(aiData);
      throw new Error(`پاسخ سرور: ${rawErrorMessage}`);
    }

    const finalOutputUrl = aiData.choices?.[0]?.message?.content || "";
    const actualTokensUsed = aiData.usage?.total_tokens || totalCreditsNeeded;
    const newBalance = profile.credit_balance - totalCreditsNeeded;
    
    const botMsgId = `bot_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const finalType = inputData.activeMode === 'code' ? 'code' : (inputData.activeMode === 'image' ? 'image' : 'text');

    // ==========================================
    // 🟢 آپدیت‌های پس‌زمینه (Fire and Forget)
    // ==========================================
    // ما پاسخ را بلافاصله برمی‌گردانیم، اما به سرور می‌گوییم به ذخیره‌سازی ادامه دهد
    
    const updateDatabase = async () => {
      try {
        await supabase.from('profiles').update({ credit_balance: newBalance }).eq('id', userId);

        await supabase.from('ai_generations').insert({
          user_id: userId, 
          generation_type: 'text', 
          model_name: pricing.model_name_safi || actualApiModel, 
          status: 'completed',
          input_params: { prompt: inputData.prompt, tokens_used: actualTokensUsed }, 
          output_url: finalOutputUrl, 
          credits_used: totalCreditsNeeded
        });

        if (inputData.sessionId) {
          await supabase.from('chat_messages').insert({
            id: botMsgId, 
            session_id: inputData.sessionId, 
            role: 'assistant', 
            content: finalOutputUrl, 
            type: finalType
          });
          
          await supabase.from('chat_sessions').update({ 
            updated_at: new Date().toISOString() 
          }).eq('id', inputData.sessionId);
        }
      } catch (dbErr) {
        console.error("❌ Background DB Update Error:", dbErr);
      }
    };

    // اجرا بدون await تا درخواست بلافاصله به فرانت‌اند برگردد
    updateDatabase();

    return NextResponse.json({ success: true, outputUrl: finalOutputUrl, status: 'completed' });

  } catch (error: any) {
    console.error('Chat API Fatal Error:', error);
    
    let errorMessage = error.message || 'خطای داخلی سرور';
    if (errorMessage.includes('abort') || errorMessage.includes('fetch failed')) {
       errorMessage = 'ارتباط با سرور به دلیل کندی شبکه قطع شد. لطفاً دوباره تلاش کنید.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}