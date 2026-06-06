"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, RefreshCw, Send, ShieldCheck, Clock, HeartHandshake, Building, MapPin, Loader2 } from 'lucide-react';
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("کاربر لاگین نیست.");

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-[#FAD961]/10 rounded-full flex items-center justify-center mb-6 border border-[#FAD961]/30">
          <CheckCircle2 className="w-10 h-10 text-[#FAD961]" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Appointment Confirmed!</h2>
        <p className="text-neutral-400 max-w-sm">Please visit our office with your Order Reference <strong className="text-[#FAD961]">{orderId}</strong> to activate your plan.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-[2rem] p-8 sm:p-12 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="text-[#FAD961] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Cash In Office</h1>
          <p className="text-neutral-500 text-sm font-medium uppercase tracking-widest">In-Person Secure Transaction</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info Side */}
          <div className="space-y-6">
            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Order Reference</p>
              <p className="text-xl font-mono font-bold text-[#FAD961]">{orderId}</p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Amount (USD)</p>
                <p className="text-lg font-bold text-white">${priceUSD.toFixed(2)}</p>
              </div>
              <div className="flex-1 bg-[#FAD961]/5 border border-[#FAD961]/20 p-6 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] mb-1">Amount (AFN)</p>
                <p className="text-lg font-bold text-[#FAD961]">{isLoadingRate ? '...' : finalPriceAfn}</p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-2xl flex items-start gap-4">
              <MapPin className="text-[#FAD961] w-6 h-6 shrink-0" />
              <div>
                <p className="text-sm font-bold text-neutral-200">Office Location</p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed" dir="rtl">کوته سنگی، یاسینی سنتر، منزل ۴، دفتر نمبر ۵</p>
              </div>
            </div>
          </div>

          {/* Action Side */}
          <div className="flex flex-col justify-between">
            <div className="bg-gradient-to-b from-neutral-900 to-transparent p-6 rounded-2xl border border-neutral-800 mb-8">
              <h3 className="text-sm font-bold text-white mb-3">Ready to proceed?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                By clicking confirm, you register your intent to pay in cash. Please visit our office within 24 hours to ensure your plan activation.
              </p>
            </div>

            <button 
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#FAD961] text-black font-black rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Confirm & Visit Office</>}
            </button>
            
            <button onClick={() => router.back()} className="mt-4 text-center text-xs text-neutral-600 font-bold uppercase tracking-widest hover:text-white">
              Cancel Request
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CashPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020202] flex items-center justify-center"><Loader2 className="animate-spin text-[#FAD961]" /></div>}>
      <CashConfirmContent />
    </Suspense>
  );
}