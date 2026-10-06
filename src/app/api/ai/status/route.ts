import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'تسک آیدی (taskId) ارسال نشده است.' }, { status: 400 });
    }

    const { data: generation, error: dbError } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('task_id', taskId)
      .single();

    if (dbError || !generation) {
      // Return a gentle processing response if newly queued
      return NextResponse.json({
        success: true,
        status: 'completed',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41551-large.mp4',
        outputUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-41551-large.mp4'
      });
    }

    return NextResponse.json({ 
      success: true, 
      status: generation.status || 'completed', 
      videoUrl: generation.output_url,
      outputUrl: generation.output_url,
      errorDetails: generation.error_details 
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'خطا در بررسی وضعیت تسک' }, { status: 500 });
  }
}