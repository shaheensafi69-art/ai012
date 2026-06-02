"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, RefreshCw, Send, ShieldCheck, Clock, HeartHandshake, Building, MapPin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function CashConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // ۱. خواندن اطلاعات از URL
  const packageName = searchParams.get('plan') || searchParams.get('planName') || 'Selected AI Package';
  const orderId = searchParams.get('order_id') || `ORD-${Math.floor(Math.random() * 1000000)}`;
  const rawPrice = searchParams.get('amount') || searchParams.get('price') || "0";
  const priceUSD = parseFloat(rawPrice);
  const customerEmail = searchParams.get('customerEmail') || 'Unknown Email';
  
  // استیت‌های مربوط به نرخ ارز و لودینگ
  const [exchangeRate, setExchangeRate] = useState<number>(85);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // گرفتن نرخ زنده دلار به افغانی از API جهانی
  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates && data.rates.AFN) {
          setExchangeRate(data.rates.AFN);
        }
      } catch (error) {
        console.error('خطا در دریافت نرخ زنده ارز:', error);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchLiveRate();
  }, []);

  // منطق محاسبه قیمت نهایی
  const calculatedAfn = (priceUSD * exchangeRate);
  const finalPriceAfn = priceUSD > 0 ? (Math.round(calculatedAfn) + 100).toLocaleString() : "0";

  // تابع اتصال به وب‌هوک بک‌اند هنگام کلیک روی دکمه "مراجعه می‌کنم"
  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      // دریافت امن اطلاعات کاربر
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("کاربر لاگین نیست.");

      const response = await fetch('/api/webhooks/cashinoffice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          amountUsd: priceUSD,
          amountAfn: finalPriceAfn,
          customerEmail: user.email || customerEmail,
          planName: packageName,
          userId: user.id
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/profile');
        }, 4000);
      } else {
        throw new Error("متاسفانه در ثبت درخواست خطایی رخ داد.");
      }
    } catch (error: any) {
      console.error("Error submitting payment confirmation:", error);
      alert(error.message || "خطای ارتباط با سرور رخ داد. لطفاً اینترنت خود را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // صفحه تاییدیه بعد از ثبت درخواست
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10 text-center">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6 border border-[#FAD961]/50 shadow-[0_0_40px_rgba(250,217,97,0.3)]"
        >
          <Building className="w-12 h-12 text-[#FAD961]" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2">Appointment Confirmed!</h2>
        <p className="text-neutral-400 max-w-md mx-auto leading-relaxed">
          Your intent to pay in cash has been registered. Please visit our office with your Order Reference (<strong className="text-[#FAD961]">{orderId}</strong>) to activate your <b>{packageName.toUpperCase()}</b> plan.
        </p>
        <p className="text-xs text-[#FAD961] mt-6 animate-pulse font-bold tracking-widest uppercase">Redirecting to Command Center...</p>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FAD961]/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.05 }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 border border-[#FAD961]/20 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80" />

        {/* HEADER */}
        <div className="text-center border-b border-white/5 pb-8 mb-8 relative">
          <div className="inline-flex items-center justify-center p-5 bg-black border border-[#FAD961]/30 rounded-2xl mb-5 shadow-[0_0_20px_rgba(250,217,97,0.2)]">
            <Building className="text-[#FAD961] w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            CASH IN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAD961] to-[#D4AF37]">OFFICE</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
            In-Person Secure Transaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* ==========================================
              LEFT COLUMN: OFFICE ADDRESS INFO
          ========================================== */}
          <div className="md:col-span-5 space-y-8">
            <div className="relative group perspective-[1000px] mx-auto max-w-[300px]">
              <div className="relative aspect-square w-full bg-[#111] rounded-[2rem] overflow-hidden border border-[#FAD961]/20 p-8 shadow-[0_0_40px_rgba(250,217,97,0.1)] transition-transform duration-500 group-hover:scale-105 flex flex-col items-center justify-center text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FAD961] shadow-[0_0_20px_5px_rgba(250,217,97,0.4)] z-20" />
                
                <div className="w-28 h-28 bg-[#FAD961]/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#FAD961]/20 group-hover:bg-[#FAD961]/20 transition-colors">
                  <MapPin size={48} className="text-[#FAD961]" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase">E-Commerce</h3>
                <p className="text-[#FAD961] text-base font-black tracking-widest uppercase mt-1">With S4Hel</p>
                
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FAD961]/5 to-transparent pointer-events-none" />
              </div>
            </div>

            <div className="bg-[#111] border border-white/10 p-6 rounded-[2rem] text-center shadow-inner mt-6 relative overflow-hidden group">
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-[#FAD961]/10 blur-2xl rounded-full transition-transform duration-700 group-hover:scale-150" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-4">
                Official Location / آدرس دفتر
              </p>
              <p className="text-base font-medium text-white leading-relaxed font-sans" dir="rtl">
                کوته سنگی، یاسینی سنتر<br />
                منزل ۴، دفتر نمبر ۵
              </p>
              <hr className="border-white/10 my-4 mx-8" />
              <p className="text-sm text-gray-400 font-light leading-relaxed">
                Kote Sangi, Yasini Center<br />
                4th Floor, Office No. 5
              </p>
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: DETAILS & INSTRUCTIONS
          ========================================== */}
          <div className="md:col-span-7 space-y-8 flex flex-col justify-between h-full">
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] text-center shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Order Reference / کد پیگیری سفارش</p>
              <p className="text-2xl font-mono font-black text-[#FAD961] tracking-wider selection:bg-white selection:text-black">
                {orderId}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5 text-center">
              <div className="bg-black/60 border border-[#FAD961]/40 p-6 rounded-[2rem] shadow-[0_0_20px_rgba(250,217,97,0.05)]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount (USD)</p>
                <p className="text-4xl font-black text-[#FAD961]">${priceUSD.toFixed(2)}</p>
              </div>
              <div className="bg-black/60 border border-white/10 p-6 rounded-[2rem] flex flex-col justify-center items-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">مبلغ به افغانی</p>
                {isLoadingRate ? (
                  <div className="mt-2 py-1 px-3 bg-white/5 rounded-lg border border-white/10 animate-pulse">
                    <p className="text-xs text-[#FAD961] font-bold tracking-widest">در حال دریافت نرخ...</p>
                  </div>
                ) : (
                  <p className="text-3xl font-black text-white mt-1">{finalPriceAfn} <span className="text-sm text-gray-500">AFN</span></p>
                )}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] text-right space-y-4" dir="rtl">
              <div className="flex items-center gap-3 text-[#FAD961] font-black mb-4">
                <div className="p-2.5 bg-[#FAD961]/10 rounded-full">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-xl">درخواست خرید شما ثبت شد</h3>
              </div>
              <p className="text-base text-gray-300 leading-loose font-light">
                برای فعال‌سازی پکیج <strong className="text-[#FAD961] bg-[#FAD961]/10 px-2 py-0.5 rounded-md mx-1">{packageName}</strong>، لطفاً به آدرس دفتر ما واقع در کوته سنگی مراجعه نموده و مبلغ فوق را به همراه <strong className="text-white">کد پیگیری سفارش</strong> به صورت نقدی پرداخت نمایید تا حساب کاربری شما شارژ گردد.
              </p>
            </div>

            <div className="bg-[#D4AF37]/5 border border-[#FAD961]/30 p-7 rounded-[2rem] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FAD961]/5 rounded-full blur-3xl" />
              
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-start gap-5">
                  <div className="p-3 bg-black/60 rounded-xl text-[#FAD961] shadow-inner shrink-0">
                    <Clock size={28} />
                  </div>
                  <div className="text-base font-light text-gray-200 leading-relaxed">
                    <strong className="font-black text-[#FAD961] uppercase tracking-widest block mb-2 text-sm">Instant Office Activation</strong>
                    Your AI credits will be manually added to your workspace <strong className="text-white font-bold border-b border-[#FAD961]">Immediately</strong> after we receive your cash payment at the office.
                    <p className="text-gray-400 mt-3 text-sm leading-loose" dir="rtl">
                      کریدت‌های هوش مصنوعی شما <strong className="text-white font-bold">بلافاصله</strong> پس از پرداخت نقدی در دفتر، به حساب کاربری شما اضافه خواهد شد.
                    </p>
                  </div>
                </div>

                <hr className="border-[#FAD961]/20 my-2" />
                
                <div className="flex items-center gap-3 text-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-[#FAD961]" />
                  <p className="text-sm text-gray-300 font-medium tracking-wide">
                    We look forward to seeing you at <strong className="text-white">E-Commerce With S4Hel</strong>. <br/>
                    <span className="text-xs text-gray-500 mt-2 block">بی‌صبرانه مشتاق دیدار شما در دفترمان هستیم. سپاس از اعتماد شما.</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-6 items-center justify-between">
          <button 
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="order-2 sm:order-1 text-gray-400 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:text-[#FAD961] transition-colors py-3 px-5 rounded-xl hover:bg-white/5 disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Back to Pricing
          </button>

          <button 
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="relative order-1 sm:order-2 w-full sm:w-auto bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black px-12 py-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all duration-300 shadow-[0_0_30px_rgba(250,217,97,0.3)] hover:shadow-[0_0_40px_rgba(250,217,97,0.5)] active:scale-95 flex items-center justify-center gap-3 group overflow-hidden disabled:opacity-70"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform relative z-10 fill-black" /> 
                <span className="relative z-10">I Will Visit Office / مراجعه می‌کنم</span>
              </>
            )}
          </button>
        </div>

      </motion.div>
    </main>
  );
}

export default function CashConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202]">
        <div className="p-6 bg-black rounded-3xl shadow-2xl mb-5 relative border border-[#FAD961]/20">
          <div className="absolute inset-0 rounded-3xl border-2 border-[#FAD961] animate-ping opacity-20" />
          <RefreshCw className="animate-spin text-[#FAD961]" size={48} />
        </div>
        <p className="font-black italic text-gray-500 uppercase tracking-[0.3em] text-xs">Initializing Location Details...</p>
      </div>
    }>
      <CashConfirmContent />
    </Suspense>
  );
}