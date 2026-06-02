import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ۱. ساخت پاسخ اولیه
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ۲. ساخت کلاینت سوپابیس با مدیریت دقیق کوکی‌ها
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ۳. بررسی امنیتی کاربر به جای تکیه بر کوکی ساده
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentPath = request.nextUrl.pathname;
  
  // مسیرهایی که نیاز به لاگین دارند (داشبورد، استودیو، صفحات پرداخت)
  const isProtectedRoute = 
    currentPath.startsWith('/dashboard') || 
    currentPath.startsWith('/ai-studio') ||
    currentPath.startsWith('/confirm-payment');
  
  // مسیرهای احراز هویت
  const isAuthRoute = currentPath === '/login' || currentPath === '/signup';

  // ==========================================
  // ۴. مدیریت ریدایرکت‌ها همراه با حفظ کوکی‌ها
  // ==========================================

  // اگر لاگین نیست و می‌خواهد وارد مناطق ممنوعه شود
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // انتقال کوکی‌های تنظیم شده به ریسپانس جدید
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // اگر لاگین است و می‌خواهد دوباره صفحه لاگین را ببیند
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // اگر مشکلی نبود، همون مسیر خودش رو با کوکی‌های آپدیت شده برگردون
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * تمام مسیرها از این گیت (Gate) امنیتی رد می‌شوند، 
     * به جز فایل‌های سیستمی نکست و عکس‌ها تا سرعت سایت پایین نیاید.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};