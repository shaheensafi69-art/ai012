import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    // ۱. استخراج تسک آیدی از کوئری پارامترهای URL (کاملاً هماهنگ با فرانت‌اندهای شما)
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'تسک آیدی (taskId) ارسال نشده است.' }, { status: 400 });
    }

    // ۲. استعلام وضعیت از دیتابیس خودمان
    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (dbError || !generation) {
      return NextResponse.json({ error: 'تسک مورد نظر یافت نشد.' }, { status: 404 });
    }

    // اگر قبلاً پردازش تمام شده بود، مستقیماً آدرس ویدیو را برگردان
    if (generation.status === 'completed' || generation.status === 'failed') {
      return NextResponse.json({ 
        success: true, 
        status: generation.status, 
        videoUrl: generation.output_url, // هماهنگ با متغیر دقیق فرانت‌اندمان
        outputUrl: generation.output_url,
        errorDetails: generation.error_details 
      });
    }

    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API تنظیم نشده است.' }, { status: 500 });
    }

    // ۳. استعلام وضعیت زنده از سرور اصلی x.ai
    const response = await fetch(`https://api.x.ai/v1/videos/${taskId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiData = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, status: 'error', message: 'خطا در استعلام وضعیت' }, { status: 500 });
    }

    const aiStatus = aiData.status;
    const videoUrl = aiData.video?.url || aiData.url || aiData.output_url || aiData.result?.url || aiData.data?.[0]?.url;

    if (aiStatus === 'done' || aiStatus === 'completed' || aiStatus === 'succeeded') {
      if (videoUrl) {
        // آپدیت نهایی در دیتابیس و تغییر وضعیت به completed
        await supabase
          .from('ai_generations')
          .update({
            status: 'completed',
            output_url: videoUrl
          })
          .eq('task_id', taskId);

        return NextResponse.json({
          success: true,
          status: 'completed',
          videoUrl: videoUrl,
          outputUrl: videoUrl
        });
      }

      return NextResponse.json({
        success: true,
        status: 'processing'
      });
      
    } else if (aiStatus === 'failed' || aiStatus === 'error') {
      const errorMsg = aiData.error?.message || 'خطا در رندر ویدیو';
      
      // مکانیزم برگشت وجه هوشمند (Refund)
      const { data: profile } = await supabase.from('profiles').select('videos_used').eq('id', generation.user_id).single();
      if (profile) {
        const creditsToRefund = generation.credits_used || 1;
        const newVideosUsed = Math.max(0, profile.videos_used - creditsToRefund);
        await supabase.from('profiles').update({ videos_used: newVideosUsed }).eq('id', generation.user_id);
      }

      await supabase.from('ai_generations').update({ status: 'failed', error_details: errorMsg }).eq('task_id', taskId);

      return NextResponse.json({ success: true, status: 'failed', errorDetails: errorMsg });
    } else {
      // در حال رندر
      return NextResponse.json({ 
        success: true, 
        status: 'processing', 
        progress: aiData.progress || 0 
      });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور' }, { status: 500 });
  }
}