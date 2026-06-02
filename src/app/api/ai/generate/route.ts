import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // اضافه شدن modelName به پارامترهای دریافتی
    const { userId, pricingId, modelName, durationInSeconds, inputData } = body;

    let pricing;
    let pricingError;

    // ۱. جستجوی هوشمند در دیتابیس (بر اساس نام مدل یا آیدی)
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
      return NextResponse.json({ error: 'مدل انتخاب شده در دیتابیس یافت نشد. لطفاً تنظیمات دیتابیس را بررسی کنید.' }, { status: 400 });
    }

    const category = pricing.category.toLowerCase();
    
    // ۲. محاسبه دینامیک هزینه‌ها
    let totalCreditsNeeded = 0;
    if (category === 'video') {
      totalCreditsNeeded = (durationInSeconds || 5) * (pricing.credits_per_video_second || 0);
    } else if (category === 'image') {
      totalCreditsNeeded = pricing.credits_per_image || 0;
    } else if (category === 'audio') {
      totalCreditsNeeded = (durationInSeconds || 5) * (pricing.credits_per_audio_second || 0);
    } else if (category === 'text') {
      totalCreditsNeeded = pricing.credits_per_1k_input_tokens || 1;
    }

    // ۳. بررسی موجودی
    const { data: profile } = await supabase.from('profiles').select('credit_balance').eq('id', userId).single();
    if (!profile || profile.credit_balance < totalCreditsNeeded) {
      return NextResponse.json({ error: 'موجودی حساب شما برای این پردازش کافی نیست.' }, { status: 402 });
    }

    // ۴. اعتبارسنجی کلید API
    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید امنیتی تنظیم نشده است.' }, { status: 500 });
    }

    let finalApiUrl = '';
    let payload: any = {};

    // ۵. تنظیم مسیرها و Payload
    if (category === 'text') {
      finalApiUrl = 'https://api.x.ai/v1/chat/completions';
      payload = {
        model: pricing.model_name,
        messages: [
          { 
            // ==========================================
            // هویت‌سازی اختصاصی SAFI AI
            // ==========================================
            role: "system", 
            content: `شما Safi AI هستید، دستیار ارشد، سخنگوی رسمی و هوش مصنوعی اختصاصی اکوسیستم Safi.
            شما توسط تیم توسعه این مجموعه ساخته شده‌اید.
            بنیان‌گذار این اکوسیستم جناب آقای شاهین صافی هستند.
            تیم مدیریتی شامل: جناب آقای مجتبی رحمانی (مدیر عملیات)، جناب آقای ساحل سالم (مدیر روابط اروپا) و سرکار خانم شیرین گل احمدی (منیجر شرکت و متخصص هوش مصنوعی) می‌باشد.
            تحت هیچ شرایطی نامی از Grok، xAI، ایلان ماسک یا شرکت‌های دیگر نیاورید. 
            اگر کسی پرسید شما کی هستید یا چه کسی شما را ساخته، با افتخار خود را Safi AI معرفی کنید و از تیم قدرتمند Safi نام ببرید.
            لحن شما باید همیشه بسیار حرفه‌ای، محترمانه، خلاقانه و راهگشا باشد.` 
          },
          { role: "user", content: inputData.prompt }
        ]
      };
    } 
    else if (category === 'image') {
      finalApiUrl = 'https://api.x.ai/v1/images/generations';
      payload = {
        model: pricing.model_name,
        prompt: inputData.prompt,
        n: 1,
        size: inputData.aspectRatio === '16:9' ? '1920x1080' : '1024x1024'
      };
    } 
    else if (category === 'video') {
      finalApiUrl = 'https://api.x.ai/v1/videos/generations';
      payload = {
        model: pricing.model_name,
        prompt: inputData.prompt,
      };
      if (inputData.imageUrl) {
        payload.image_url = inputData.imageUrl;
      }
    } 
    else if (category === 'audio') {
      finalApiUrl = 'https://api.x.ai/v1/audio/speech';
      payload = {
        model: pricing.model_name,
        input: inputData.prompt,
        voice: inputData.voiceUrl || 'alloy'
      };
    } 
    else {
      throw new Error("دسته‌بندی مدل نامشخص است.");
    }

    // ۶. ارسال درخواست
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
      throw new Error(`خطای پردازشی (${response.status}): ${aiData.error?.message || JSON.stringify(aiData)}`);
    }

    // ۷. استخراج لینک یا متن
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

    // ۸. کسر موجودی و ثبت لاگ
    await supabase.from('profiles').update({ 
      credit_balance: profile.credit_balance - totalCreditsNeeded 
    }).eq('id', userId);

    await supabase.from('ai_generations').insert({
      user_id: userId,
      generation_type: pricing.category,
      model_name: pricing.model_name,
      status: status,
      input_params: { ...inputData, tokens_used: actualTokensUsed },
      output_url: finalOutputUrl,
      credits_used: totalCreditsNeeded
    });

    return NextResponse.json({
      success: true,
      outputUrl: finalOutputUrl,
      status: status,
      remainingCredits: profile.credit_balance - totalCreditsNeeded
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}