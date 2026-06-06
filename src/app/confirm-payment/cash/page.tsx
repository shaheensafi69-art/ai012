"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Send, Building, MapPin, Loader2, ArrowLeft } from 'lucide-react';

// 🟢 استفاده از نسخه SSR سوپابیس برای خواندن کوکی‌های لاگین
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function CashConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const packageName = searchParams.get('plan') || 'Selected AI Package';
  const orderId = searchParams.get('order_id') || `ORD-${Math.floor(Math.random() * 1000000)}`;
  const rawPrice = searchParams.get('amount') || "0";
  const priceUSD = parseFloat(rawPrice);
  
  const [exchangeRate, setExchangeRate] = useState<number>(85);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data?.rates?.AFN) setExchangeRate(data.rates.AFN);
      } catch (error) {
        console.error('Rate fetch error:', error);
      } finally {
        setIsLoadingRate(false);
      }
    };
    fetchLiveRate();
  }, []);

  const finalPriceAfn = priceUSD > 0 ? (Math.round(priceUSD * exchangeRate) + 100).toLocaleString() : "0";

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    try {
      // بررسی دقیق وضعیت لاگین از طریق کوکی
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("کاربر لاگین نیست. لطفاً مجدداً وارد سایت شوید.");

      const response = await fetch('/api/webhooks/cashinoffice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amountUsd: priceUSD,
          amountAfn: finalPriceAfn,
          customerEmail: user.email,
          planName: packageName,
          userId: user.id
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push('/dashboard/profile/overview'), 4000);
      } else {
        throw new Error("خطا در ثبت درخواست.");
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#FAD961]/10 rounded-full flex items-center justify-center mb-6 border border-[#FAD961]/30">
          <CheckCircle2 className="w-10 h-10 text-[#FAD961]" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Appointment Confirmed!</h2>
        <p className="text-neutral-400 max-w-sm">Please visit our office with your Order Reference <strong className="text-[#FAD961]">{orderId}</strong> to activate your plan.</p>
        <p className="text-[11px] text-[#FAD961] mt-8 animate-pulse font-medium tracking-widest uppercase">Redirecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full relative z-10">
      
      {/* 🟢 هدر بازگشت به صفحه چک‌اوت */}
      <div className="mb-8 flex items-center">
        <button 
          onClick={() => router.push(`/dashboard/checkout?plan=${packageName.toLowerCase()}`)} 
          className="group flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-[#0d0d0d] transition-all group-hover:border-neutral-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Checkout
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0d0d0d]/50 border border-neutral-800/60 rounded-[2rem] p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="text-center mb-10 pb-8 border-b border-neutral-800/60">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building className="text-[#FAD961] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Cash In Office</h1>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">In-Person Secure Transaction</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Info Side */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-neutral-800/80">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Order Reference</p>
              <p className="text-xl font-mono font-bold text-[#FAD961]">{orderId}</p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-[#0a0a0a] p-5 rounded-2xl border border-neutral-800/80 text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Total (USD)</p>
                <p className="text-lg font-bold text-white">${priceUSD.toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-[#FAD961]/5 border border-[#FAD961]/20 p-5 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">Total (AFN)</p>
                {isLoadingRate ? (
                  <div className="flex justify-center mt-1">
                    <Loader2 className="w-5 h-5 text-[#FAD961] animate-spin" />
                  </div>
                ) : (
                  <p className="text-lg font-bold text-[#FAD961]">{finalPriceAfn}</p>
                )}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800/80 p-6 rounded-2xl flex items-start gap-4">
              <MapPin className="text-[#FAD961] w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-neutral-200">Office Location</p>
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed" dir="rtl">کوته سنگی، یاسینی سنتر، منزل ۴، دفتر نمبر ۵</p>
              </div>
            </div>
          </div>

          {/* Action Side */}
          <div className="flex flex-col justify-between h-full">
            <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800 mb-8">
              <h3 className="text-sm font-bold text-neutral-200 mb-3">Ready to proceed?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                By clicking confirm, you register your intent to pay in cash. Please visit our office within 24 hours to ensure your <strong className="text-neutral-300 font-medium">{packageName}</strong> plan activation.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
              >
                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={16} className="text-neutral-900" />}
                {isSubmitting ? 'Confirming...' : 'Confirm & Visit Office'}
              </button>
              
              {/* 🟢 دکمه کنسل برای بازگشت به چک‌اوت */}
              <button 
                onClick={() => router.push(`/dashboard/checkout?plan=${packageName.toLowerCase()}`)} 
                disabled={isSubmitting}
                className="w-full py-3 text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-transparent border border-neutral-800 hover:bg-neutral-900 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel Request
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default function CashPage() {
  return (
    <main className="relative min-h-screen bg-[#080808] text-neutral-200 antialiased selection:bg-[#FAD961] selection:text-black flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* پس‌زمینه مینیمال */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full mt-10">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="p-5 bg-[#0d0d0d] rounded-2xl shadow-xl mb-4 border border-neutral-800">
              <Loader2 className="animate-spin text-[#FAD961]" size={32} />
            </div>
            <p className="font-medium text-neutral-500 uppercase tracking-[0.2em] text-[10px]">Initializing Location Details...</p>
          </div>
        }>
          <CashConfirmContent />
        </Suspense>
      </div>
    </main>
  );
}