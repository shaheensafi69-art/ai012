import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// تخصیص زمان کافی برای پردازش اولیه درخواست ویدیو در Next.js
export const maxDuration = 300; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { userId, pricingId, durationInSeconds, inputData } = await request.json();

    // ۱. اعتبارسنجی ورودی‌ها
    if (!userId || !pricingId || !inputData) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    // ۲. دریافت اطلاعات مدل ویدیو (شامل فیلد جدید نام اختصاصی)
    const { data: pricing, error: pricingError } = await supabase
      .from('ai_pricing')
      .select('*')
      .eq('id', pricingId)
      .single();
      
    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'مدل ویدیو یافت نشد.' }, { status: 404 });
    }

    // ۳. بررسی سهمیه تولید ویدیوی کاربر
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

    // ==========================================
    // 🟢 ۴. تفکیک شناسه فنی x.ai و نام تجاری Safi
    // ==========================================
    let actualApiModel = pricing.model_name || "grok-imagine-video-1.5-preview"; 
    let safiModelName = pricing.model_name_safi || "Safi Video Engine";
    
    // مسیر پیش‌فرض: تولید ویدیو (Text-to-Video یا Image-to-Video)
    let finalApiUrl = 'https://api.x.ai/v1/videos/generations'; 
    
    let payload: any = {
      model: actualApiModel, 
      prompt: inputData.prompt
    };

    // افزودن تنظیمات کیفیت و زمان ویدیو بر اساس ورودی‌های کلاینت
    if (durationInSeconds) payload.duration = durationInSeconds;
    if (inputData.aspectRatio) payload.aspect_ratio = inputData.aspectRatio;
    if (inputData.resolution) payload.resolution = inputData.resolution; 

    // تشخیص عکس (Image-to-Video)
    const imageUrl = inputData.imageUrls && inputData.imageUrls.length > 0 
      ? inputData.imageUrls[0] 
      : inputData.imageUrl;
      
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    // تشخیص ویرایش یا گسترش ویدیو (Video Editing یا Video Extension)
    if (inputData.videoUrl) {
      payload.video_url = inputData.videoUrl;
      
      if (inputData.isExtension) {
        finalApiUrl = 'https://api.x.ai/v1/videos/extensions';
      } else {
        finalApiUrl = 'https://api.x.ai/v1/videos/edits';
      }
    }

    // ۵. ارسال درخواست به سرور x.ai
    const response = await fetch(finalApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${XAI_API_KEY}` 
      },
      body: JSON.stringify(payload)
    });

    const aiData = await response.json();
    
    // مدیریت خطای سرور اصلی
    if (!response.ok) {
      console.error("❌ Video API Error Response:", aiData);
      throw new Error(`خطای سرور x.ai: ${aiData.error?.message || "مشکل در ثبت درخواست تولید ویدیو"}`);
    }

    // ==========================================
    // 🟢 ۶. استخراج دقیق تسک آیدی (Asynchronous API)
    // ==========================================
    let finalOutputUrl = "";
    let finalStatus = "completed";

    const directUrl = aiData.data?.[0]?.url || aiData.video_url || aiData.url;
    const taskId = aiData.request_id || aiData.id || aiData.job_id || aiData.task_id;

    if (taskId) {
      finalOutputUrl = `pending_task_${taskId}`;
      finalStatus = "processing";
    } else if (directUrl) {
      finalOutputUrl = directUrl;
      finalStatus = "completed";
    } else {
      throw new Error(`ساختار خروجی x.ai نامشخص است.`);
    }

    // ۷. ثبت در دیتابیس به صورت موازی (Parallel Execution)
    const creditsToDeduct = durationInSeconds ? durationInSeconds : 1; 

    await Promise.all([
      supabase.from('profiles').update({ videos_used: profile.videos_used + 1 }).eq('id', userId),
      supabase.from('ai_generations').insert({
        user_id: userId, 
        generation_type: 'video', 
        model_name: safiModelName, // 🟢 ذخیره نام ظاهری پلتفرم شما برای نمایش شفاف در داشبورد
        status: finalStatus,
        task_id: taskId || null, 
        input_params: inputData, 
        output_url: finalOutputUrl, 
        credits_used: creditsToDeduct 
      })
    ]);

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