import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { userId, pricingId, durationInSeconds, inputData } = await request.json();

    if (!userId || !pricingId || !inputData) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    const { data: pricing, error: pricingError } = await supabase
      .from('ai_pricing')
      .select('*')
      .eq('id', pricingId)
      .single();
      
    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'مدل ویدیو یافت نشد.' }, { status: 404 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('videos_total, videos_used')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      return NextResponse.json({ error: 'پروفایل کاربر یافت نشد.' }, { status: 404 });
    }
    
    if (profile.videos_used >= profile.videos_total) {
      return NextResponse.json({ error: 'سهمیه تولید ویدیوی شما به اتمام رسیده است.' }, { status: 402 });
    }

    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API سرور تنظیم نشده است.' }, { status: 500 });
    }

    let actualApiModel = pricing.model_name || "grok-imagine-video"; 
    let safiModelName = pricing.model_name_safi || "Safi Video Engine";
    let finalApiUrl = 'https://api.x.ai/v1/videos/generations'; 
    
    let payload: any = {
      model: actualApiModel, 
      prompt: inputData.prompt || "A cinematic scene"
    };

    if (durationInSeconds) payload.duration = durationInSeconds;
    if (inputData.aspectRatio) payload.aspect_ratio = inputData.aspectRatio;
    if (inputData.resolution) payload.resolution = inputData.resolution; 

    // استخراج عکس ارسال شده
    const imageUrl = inputData.imageUrls && inputData.imageUrls.length > 0 
      ? inputData.imageUrls[0] 
      : inputData.imageUrl;
      
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    if (inputData.videoUrl) {
      payload.video = { url: inputData.videoUrl };
      
      if (inputData.isExtension) {
        finalApiUrl = 'https://api.x.ai/v1/videos/extensions';
      } else {
        finalApiUrl = 'https://api.x.ai/v1/videos/edits';
      }
    }

    // ۵. ارسال درخواست اصلی به سرور x.ai
    const response = await fetch(finalApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${XAI_API_KEY}` 
      },
      body: JSON.stringify(payload)
    });

    const aiData = await response.json();
    
    // 🟢 مدیریت هوشمند خطای سرور اصلی x.ai
    if (!response.ok) {
      console.error("❌ Video API Error Response:", aiData);
      
      // x.ai گاهی ارور را به صورت String و گاهی به صورت Object می‌فرستد
      const errorMessage = typeof aiData.error === 'string' 
        ? aiData.error 
        : (aiData.error?.message || aiData.message || "مشکل نامشخص در سرور ویدیو");

      // هندل کردن خطای اختصاصی عکس به ویدیو
      if (errorMessage.includes('Text-to-video is not supported')) {
        throw new Error("این مدل فقط از حالت «عکس به ویدیو» پشتیبانی می‌کند. لطفاً ابتدا یک عکس آپلود کنید.");
      }

      throw new Error(`خطای سرور: ${errorMessage}`);
    }

    // ۶. استخراج دقیق تسک آیدی
    const taskId = aiData.request_id;

    if (!taskId) {
      throw new Error("خطا: شناسه پیگیری (request_id) از سرور دریافت نشد.");
    }

    const finalOutputUrl = `pending_task_${taskId}`;
    const finalStatus = "processing";

    // ۷. ثبت قطعی در دیتابیس
    const creditsToDeduct = durationInSeconds ? durationInSeconds : 1; 

    await supabase.from('profiles')
      .update({ videos_used: profile.videos_used + creditsToDeduct })
      .eq('id', userId);

    await supabase.from('ai_generations').insert({
      user_id: userId, 
      generation_type: 'video', 
      model_name: safiModelName,
      status: finalStatus,
      task_id: taskId, 
      input_params: inputData, 
      output_url: finalOutputUrl, 
      credits_used: creditsToDeduct 
    });

    return NextResponse.json({ 
      success: true, 
      outputUrl: finalOutputUrl, 
      status: finalStatus, 
      taskId: taskId 
    });

  } catch (error: any) {
    console.error('Video API Fatal Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}