import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pricingId, modelName, durationInSeconds, inputData } = body;

    let pricing;
    let pricingError;

    // ۱. جستجوی هوشمند در دیتابیس
    if (modelName) {
      const res = await supabase.from('ai_pricing').select('*').eq('model_name', modelName).single();
      pricing = res.data;
      pricingError = res.error;
    } else if (pricingId) {
      const res = await supabase.from('ai_pricing').select('*').eq('id', pricingId).single();
      pricing = res.data;
      pricingError = res.error;
    }

    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'مدل انتخاب شده در دیتابیس یافت نشد.' }, { status: 400 });
    }

    const category = pricing.category.toLowerCase();
    
    // ۲. محاسبه دینامیک هزینه‌ها
    let totalCreditsNeeded = 0;
    if (category === 'image') {
      totalCreditsNeeded = pricing.credits_per_image || 0;
    } else if (category === 'audio') {
      totalCreditsNeeded = (durationInSeconds || 5) * (pricing.credits_per_audio_second || 0);
    } else if (category === 'text') {
      totalCreditsNeeded = pricing.credits_per_1k_input_tokens || 1;
    }

    // ۳. بررسی هوشمند موجودی (تفکیک ویدیو از بقیه)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credit_balance, videos_total, videos_used')
      .eq('id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'پروفایل کاربر یافت نشد.' }, { status: 404 });
    }

    if (category === 'video') {
      if (profile.videos_total === 0 || profile.videos_used >= profile.videos_total) {
        return NextResponse.json({ error: 'سهمیه تولید ویدیوی شما به اتمام رسیده است. لطفا پلن خود را ارتقا دهید.' }, { status: 402 });
      }
    } else {
      if (profile.credit_balance < totalCreditsNeeded) {
        return NextResponse.json({ error: 'موجودی حساب شما برای این پردازش کافی نیست.' }, { status: 402 });
      }
    }

    // ۴. اعتبارسنجی کلید API
    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید امنیتی سیستم تنظیم نشده است.' }, { status: 500 });
    }

    let finalApiUrl = '';
    let payload: any = {};

    // ==========================================
    // 🟢 سیستم ترجمه برندینگ به کدهای xAI
    // ==========================================
    let actualApiModel = pricing.model_name;
    const dbModelNameLower = pricing.model_name.toLowerCase();
    
    if (dbModelNameLower.includes('video')) {
      actualApiModel = 'grok-imagine-video';
    } else if (dbModelNameLower.includes('image')) {
      actualApiModel = 'grok-imagine-image';
    } else if (dbModelNameLower.includes('chat') || dbModelNameLower.includes('text') || dbModelNameLower.includes('neural')) {
      actualApiModel = 'grok-4.3';
    }

    // ==========================================
    // 🟢 متغیر جامع اطلاعات تیم (بدون نمایش پیش‌فرض)
    // ==========================================
    const safiTeamContext = `
      شما Safi AI هستید، دستیار ارشد، سخنگوی رسمی و هوش مصنوعی اختصاصی اکوسیستم Safi.
      شما توسط تیم توسعه این مجموعه ساخته شده‌اید و به هیچ شرکت خارجی دیگری (مثل xAI، Grok یا ایلان ماسک) تعلق ندارید.
      
      اطلاعات محرمانه تیم (فقط در صورتی که کاربر مستقیماً درباره تیم، مدیران یا فرد خاصی سوال پرسید، با احترام و با استفاده از لینک‌های مربوطه پاسخ دهید):
      - بنیان‌گذار (Founder): جناب آقای شاهین صافی (Shaheen Safi). لینک پروفایل: https://www.safiai.site/founders/shaheen
      - منیجر شرکت و متخصص هوش مصنوعی: سرکار خانم شیرین گل احمدی (Shirin Gol Ahmadi). لینک پروفایل: https://www.safiai.site/founders/shirin
      - مدیر عملیات (COO): جناب آقای مجتبی رحمانی (Mujtaba Rahmani). لینک پروفایل: https://www.safiai.site/founders/mujtaba
      - مدیر روابط اروپا: جناب آقای ساحل سالم (Sahel Salem). لینک پروفایل: https://www.safiai.site/founders/sahel

      لحن شما باید همیشه حرفه‌ای، محترمانه، راهگشا و صمیمی باشد. هرگز اطلاعات تیم را بدون دلیل و بدون درخواست کاربر ارائه ندهید.
    `;

    // ۵. تنظیم مسیرها و Payload برای xAI
    if (category === 'text') {
      finalApiUrl = 'https://api.x.ai/v1/chat/completions';
      
      let userContent: any = inputData.prompt || "Please analyze the content.";
      
      // 🟢 پشتیبانی از ارسال یک یا چندین عکس به صورت همزمان برای چت
      if (inputData.imageUrls && inputData.imageUrls.length > 0) {
        userContent = [
          { type: "text", text: inputData.prompt || "Please carefully analyze these images and explain what you see." }
        ];
        inputData.imageUrls.forEach((imgUrl: string) => {
          userContent.push({ type: "image_url", image_url: { url: imgUrl } });
        });
      } else if (inputData.imageUrl) {
        userContent = [
          { type: "text", text: inputData.prompt || "Please carefully analyze this image and explain what you see." },
          { type: "image_url", image_url: { url: inputData.imageUrl } }
        ];
      }

      payload = {
        model: actualApiModel, 
        messages: [
          { role: "system", content: safiTeamContext },
          { role: "user", content: userContent }
        ]
      };
    } 
    else if (category === 'image') {
      finalApiUrl = 'https://api.x.ai/v1/images/generations';
      payload = {
        model: actualApiModel,
        prompt: inputData.prompt
      };

      // 🟢 قابلیت ادیت یا بازسازی عکس (Image-to-Image)
      if (inputData.imageUrls && inputData.imageUrls.length > 0) {
        const referenceImages = inputData.imageUrls.slice(0, 3);
        payload.image_url = referenceImages.length === 1 ? referenceImages[0] : referenceImages;
      } else if (inputData.imageUrl) {
        payload.image_url = inputData.imageUrl;
      }
    } 
    else if (category === 'video') {
      finalApiUrl = 'https://api.x.ai/v1/videos/generations';
      payload = {
        model: actualApiModel, 
        prompt: inputData.prompt,
        duration: durationInSeconds || 5
      };
      if (inputData.imageUrl) {
        payload.image_url = inputData.imageUrl;
      }
    } 
    else if (category === 'audio') {
      finalApiUrl = 'https://api.x.ai/v1/audio/speech';
      payload = {
        model: actualApiModel, 
        input: inputData.prompt,
        voice: inputData.voiceUrl || 'alloy'
      };
    } 
    else {
      throw new Error("دسته‌بندی مدل در دیتابیس نامشخص است.");
    }

    // ۶. ارسال درخواست به سرور xAI
    const response = await fetch(finalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const aiData = await response.json();

    if (!response.ok) {
      console.error("AI Core Error Detail:", aiData);
      throw new Error(aiData.error?.message || JSON.stringify(aiData));
    }

    // ۷. استخراج لینک خروجی
    let finalOutputUrl = "";
    let status = "completed";
    let actualTokensUsed = 0;

    if (category === 'text') {
      finalOutputUrl = aiData.choices?.[0]?.message?.content || "";
      actualTokensUsed = aiData.usage?.total_tokens || totalCreditsNeeded;
    } 
    else if (category === 'image') {
      finalOutputUrl = aiData.data?.[0]?.url || "";
    } 
    else if (category === 'audio') {
      finalOutputUrl = aiData.url || aiData.data?.[0]?.url || "";
    }
    else if (category === 'video') {
      const taskId = aiData.id || aiData.task_id;
      const directUrl = aiData.data?.[0]?.url || aiData.url;
      
      if (taskId && !directUrl) {
        finalOutputUrl = `pending_task_${taskId}`;
        status = "processing";
      } else if (directUrl) {
        finalOutputUrl = directUrl;
      } else {
        throw new Error("تولید موفقیت‌آمیز بود اما لینکی دریافت نشد.");
      }
    }

    // ۸. کسر موجودی و ثبت تاریخچه پردازش
    if (category === 'video') {
      await supabase.from('profiles').update({ 
        videos_used: profile.videos_used + 1 
      }).eq('id', userId);
    } else {
      await supabase.from('profiles').update({ 
        credit_balance: profile.credit_balance - totalCreditsNeeded 
      }).eq('id', userId);
    }

    await supabase.from('ai_generations').insert({
      user_id: userId,
      generation_type: pricing.category,
      model_name: pricing.model_name,
      status: status,
      input_params: { ...inputData, tokens_used: actualTokensUsed },
      output_url: finalOutputUrl,
      credits_used: category === 'video' ? 1 : totalCreditsNeeded
    });

    return NextResponse.json({
      success: true,
      outputUrl: finalOutputUrl,
      status: status,
      remainingCredits: category === 'video' ? profile.credit_balance : profile.credit_balance - totalCreditsNeeded
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور xAI' }, { status: 500 });
  }
}