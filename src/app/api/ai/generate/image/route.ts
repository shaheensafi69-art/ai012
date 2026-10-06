import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateGeminiImage, GEMINI_CONFIG } from '@/lib/gemini';

export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      return NextResponse.json({ error: 'مدل عکس یافت نشد.' }, { status: 404 });
    }

    const totalCreditsNeeded = pricing.credits_per_image || 1;
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
      return NextResponse.json({ error: 'موجودی حساب شما کافی نیست.' }, { status: 402 });
    }

    const prompt = inputData.prompt || 'High quality cinematic render';
    const aspectRatio = inputData.aspectRatio || '1:1';

    let finalOutputUrl = '';

    // ==========================================
    // 🟢 ۱. تلاش برای تولید تصویر با Google AI Studio (Imagen 3)
    // ==========================================
    try {
      finalOutputUrl = await generateGeminiImage({
        prompt,
        aspectRatio,
        numberOfImages: 1
      });
    } catch (googleError: any) {
      console.warn('Google Imagen 3 direct generation failed:', googleError.message);

      // اگر خطای اعتبار پیش‌پرداخت بود، به کاربر اطلاع واضح می‌دهیم
      if (googleError.message.includes('شارژ')) {
        throw googleError;
      }

      // فال‌بک با استفاده از API های پرسرعت یا بک‌آپ
      const backupResponse = await fetch('https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt) + `?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`);
      if (backupResponse.ok) {
        finalOutputUrl = backupResponse.url;
      } else {
        throw new Error(googleError.message || 'خطا در پردازش تصویر');
      }
    }

    // ==========================================
    // 🟢 ۲. کسر اعتبار و ثبت در سوپابیس
    // ==========================================
    const newBalance = isRealUser ? Math.max(0, creditBalance - totalCreditsNeeded) : creditBalance;

    if (isRealUser) {
      await supabase.from('profiles').update({ credit_balance: newBalance }).eq('id', userId);
      await supabase.from('ai_generations').insert({
        user_id: userId,
        generation_type: 'image',
        model_name: 'Google AI Studio Imagen 3',
        status: 'completed',
        input_params: inputData,
        output_url: finalOutputUrl,
        credits_used: totalCreditsNeeded
      });
    }

    return NextResponse.json({
      success: true,
      outputUrl: finalOutputUrl,
      remainingCredits: newBalance
    });

  } catch (error: any) {
    console.error('❌ Image Generation Error:', error);
    return NextResponse.json({
      error: error.message || 'خطای غیرمنتظره در تولید تصویر'
    }, { status: 500 });
  }
}