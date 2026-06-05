import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// جلوگیری از تایم‌اوت سرور
export const maxDuration = 300; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { userId, pricingId, inputData } = await request.json();

    // ۱. اعتبارسنجی ورودی‌ها
    if (!userId || !pricingId || !inputData) {
      return NextResponse.json({ error: 'اطلاعات ورودی ناقص است.' }, { status: 400 });
    }

    // ۲. دریافت اطلاعات مدل از دیتابیس
    const { data: pricing, error: pricingError } = await supabase
      .from('ai_pricing')
      .select('*')
      .eq('id', pricingId)
      .single();
      
    if (pricingError || !pricing) {
      return NextResponse.json({ error: 'مدل عکس یافت نشد.' }, { status: 404 });
    }

    // ۳. بررسی موجودی اعتبارات کاربر
    const totalCreditsNeeded = pricing.credits_per_image || 1;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile || profile.credit_balance < totalCreditsNeeded) {
      return NextResponse.json({ error: 'موجودی حساب شما کافی نیست.' }, { status: 402 });
    }

    // ۴. بررسی کلید API
    const XAI_API_KEY = process.env.XAI_API_KEY;
    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'کلید API سرور تنظیم نشده است.' }, { status: 500 });
    }

    // ==========================================
    // 🟢 منطق تفکیک شناسه فنی مدل بر اساس تنظیمات جدید
    // ==========================================
    
    // اطمینان از ارسال مدل دقیق و معتبر تصویرسازی
    let actualApiModel = pricing.model_name || 'grok-imagine-image-quality';
    if (actualApiModel.toLowerCase().includes('safi') || !actualApiModel.includes('image')) {
       actualApiModel = 'grok-imagine-image-quality';
    }
      
    // مسیر پایه برای ساخت عکس از متن
    let finalApiUrl = 'https://api.x.ai/v1/images/generations'; 
    let payload: any = {
      model: actualApiModel,
      prompt: inputData.prompt
    };

    // تجمیع عکس‌ها
    const allImages: string[] = [];
    if (inputData.imageUrls && Array.isArray(inputData.imageUrls) && inputData.imageUrls.length > 0) {
      allImages.push(...inputData.imageUrls);
    } else if (inputData.imageUrl) {
      allImages.push(inputData.imageUrl);
    }

    // ۵. هدایت هوشمند (تبدیل به Image-to-Image در صورت داشتن تصویر)
    if (allImages.length > 0) {
      finalApiUrl = 'https://api.x.ai/v1/images/edits';
      
      const referenceImages = allImages.slice(0, 3);
      payload.images = referenceImages.map((imgUrl: string) => ({ 
        url: imgUrl
      }));
    }

    if (inputData.aspectRatio) {
      payload.aspect_ratio = inputData.aspectRatio; 
    }

    // 🟢 دور زدن مشکل قطعی شبکه در Next.js با تنظیمات پیشرفته Fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 ثانیه فرصت اتصال

    // ۶. ارسال درخواست به سرور تصویرسازی x.ai
    const response = await fetch(finalApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${XAI_API_KEY}` 
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store' // 🟢 بسیار مهم: جلوگیری از تداخل کش‌های Next.js
    });

    clearTimeout(timeoutId); // پاک کردن تایمر در صورت موفقیت

    const aiData = await response.json();
    
    // مدیریت ارورهای مستقیم از سمت سرور
    if (!response.ok) {
      console.error("❌ x.ai Image API Error:", aiData);
      const rawErrorMessage = aiData.error?.message || aiData.message || JSON.stringify(aiData);
      throw new Error(`خطا از x.ai: ${rawErrorMessage}`);
    }

    // استخراج آدرس تصویر
    let finalOutputUrl = "";
    if (aiData.data && aiData.data.length > 0 && aiData.data[0].url) {
        finalOutputUrl = aiData.data[0].url;
    } else if (aiData.url) { 
        finalOutputUrl = aiData.url;
    } else {
        throw new Error("آدرس تصویر در پاسخ سرور یافت نشد.");
    }

    // ۷. کسر اعتبار و ثبت در دیتابیس
    const newBalance = profile.credit_balance - totalCreditsNeeded;

    await Promise.all([
      supabase.from('profiles').update({ credit_balance: newBalance }).eq('id', userId),
      supabase.from('ai_generations').insert({
        user_id: userId, 
        generation_type: 'image', 
        model_name: pricing.model_name_safi || actualApiModel, 
        status: 'completed',
        input_params: inputData, 
        output_url: finalOutputUrl, 
        credits_used: totalCreditsNeeded
      })
    ]);

    return NextResponse.json({ success: true, outputUrl: finalOutputUrl, status: 'completed' });

  } catch (error: any) {
    console.error('Image API Fatal Error:', error);
    
    // 🟢 شناسایی هوشمند ارورهای مربوط به قطعی اینترنت و فایروال محلی
    let errorMessage = error.message || 'خطای داخلی سرور';
    if (errorMessage.includes('timeout') || errorMessage.includes('fetch failed')) {
      errorMessage = "خطای اتصال (Connect Timeout): امکان برقراری ارتباط با سرور x.ai وجود ندارد. لطفاً در صورت استفاده از پروکسی یا VPN، وضعیت آن را بررسی کنید و دوباره تلاش نمایید.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}