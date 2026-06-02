"use client";

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CreditCard, ShieldCheck, 
  CheckCircle2, Loader2, Lock, Bitcoin, Banknote, QrCode, SmartphoneNfc
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// تنظیم دقیق سهمیه‌های جدید برای کریتور و پرو
const PLAN_DETAILS = {
  basic: { name: 'Basic', price: 10, images: 50, videos: 0, desc: 'Essential tools for text and images.' },
  creator: { name: 'Creator', price: 19, images: 200, videos: 10, desc: 'Professional suite for content creators.' },
  pro: { name: 'Pro', price: 35, images: 600, videos: 30, desc: 'Maximum capacity for studios.' },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planQuery = (searchParams.get('plan') as keyof typeof PLAN_DETAILS) || 'creator';
  const selectedPlan = PLAN_DETAILS[planQuery] || PLAN_DETAILS['creator'];

  // دسته‌بندی پرداخت‌ها: 'auto' (اتوماتیک) و 'manual' (دستی)
  const [paymentCategory, setPaymentCategory] = useState<'auto' | 'manual'>('auto');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'crypto' | 'hesabpay' | 'atomapay' | 'cashinoffice'>('stripe');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // هندل کردن مسیرهای پرداخت بر اساس لیست شما
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. هندل کردن پرداخت‌های دستی (ارجاع به صفحات تایید)
      if (paymentCategory === 'manual') {
        let redirectPath = '';
        if (paymentMethod === 'atomapay') redirectPath = '/confirm-payment/atoma';
        if (paymentMethod === 'cashinoffice') redirectPath = '/confirm-payment/cash';
        if (paymentMethod === 'hesabpay') redirectPath = '/confirm-payment/hesabpay';

        // ارسال اطلاعات پلن به صفحه تایید دستی
        router.push(`${redirectPath}?plan=${planQuery}&amount=${selectedPlan.price}`);
        return;
      }

      // 2. هندل کردن پرداخت‌های اتوماتیک (ارتباط با APIها)
      let apiEndpoint = '';
      if (paymentMethod === 'stripe') apiEndpoint = '/api/checkout/stripe';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: planQuery, 
          amount: selectedPlan.price 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to initiate checkout');

      // انتقال کاربر به درگاه پرداخت استرایپ
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL not found.');
      }

    } catch (error: any) {
      console.error("Payment Error:", error);
      setErrorMessage(error.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  // آپدیت کردن متد پیش‌فرض وقتی تب تغییر می‌کند
  const handleCategoryChange = (category: 'auto' | 'manual') => {
    setPaymentCategory(category);
    if (category === 'auto') setPaymentMethod('stripe');
    if (category === 'manual') setPaymentMethod('hesabpay');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      
      {/* ==========================================
          LEFT COLUMN: ORDER SUMMARY
      ========================================== */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-[#070707]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl sticky top-8">
          <h2 className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase mb-6">Order Summary</h2>
          
          <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/5">
            <div>
              <h3 className="text-3xl font-black text-white">{selectedPlan.name}</h3>
              <p className="text-sm text-neutral-400 mt-1">SAFI Neural Studio</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-[#FAD961]">${selectedPlan.price}</span>
              <span className="text-sm text-neutral-500 block">/month</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-neutral-300 font-medium">{selectedPlan.images} Neural Images</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-neutral-300 font-medium">{selectedPlan.videos} Cinematic Videos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-neutral-300 font-medium">Unlimited Chat & Code Engine</span>
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-xl p-4 flex items-center gap-4 border border-white/5">
            <ShieldCheck className="w-8 h-8 text-green-500 opacity-80" />
            <div>
              <p className="text-sm font-bold text-white">Guaranteed Security</p>
              <p className="text-xs text-neutral-500">256-bit SSL Encryption</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          RIGHT COLUMN: PAYMENT DETAILS
      ========================================== */}
      <div className="lg:col-span-7">
        <form onSubmit={handlePayment} className="bg-[#070707]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <h2 className="text-xl font-black text-white mb-6">Select Payment Method</h2>

          {/* Category Tabs: Auto vs Manual */}
          <div className="flex p-1 bg-[#0A0A0A] border border-white/5 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleCategoryChange('auto')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                paymentCategory === 'auto' ? 'bg-white/10 text-white shadow-md' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Automatic (Instant)
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('manual')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                paymentCategory === 'manual' ? 'bg-white/10 text-white shadow-md' : 'text-neutral-500 hover:text-white'
              }`}
            >
              Manual (Verify)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ---------------- AUTOMATIC METHODS ---------------- */}
            {paymentCategory === 'auto' && (
              <motion.div key="auto" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  {/* درگاه فعال: استرایپ */}
                  <button 
                    type="button" onClick={() => setPaymentMethod('stripe')}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${
                      paymentMethod === 'stripe' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#FAD961]' : 'bg-[#0A0A0A] border-white/5 text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">Credit Card</span>
                  </button>

                  {/* درگاه غیرفعال: پی‌پال (Coming Soon) */}
                  <button 
                    type="button" 
                    disabled
                    className="p-4 rounded-xl flex flex-col items-center gap-2 border border-white/5 bg-[#070707] text-neutral-600 relative overflow-hidden cursor-not-allowed opacity-40"
                  >
                    <div className="absolute top-1.5 right-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#FAD961] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md scale-90">
                      Soon
                    </div>
                    <div className="w-6 h-6 font-black text-xl flex items-center justify-center italic text-neutral-600">P</div>
                    <span className="text-xs font-bold uppercase tracking-wider">PayPal</span>
                  </button>

                  {/* درگاه غیرفعال: کریپتو (Coming Soon) */}
                  <button 
                    type="button" 
                    disabled
                    className="p-4 rounded-xl flex flex-col items-center gap-2 border border-white/5 bg-[#070707] text-neutral-600 relative overflow-hidden cursor-not-allowed opacity-40"
                  >
                    <div className="absolute top-1.5 right-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#FAD961] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md scale-90">
                      Soon
                    </div>
                    <Bitcoin className="w-6 h-6 text-neutral-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Crypto</span>
                  </button>
                </div>
                <div className="bg-[#050505] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-sm text-neutral-400">You will be redirected securely to complete the payment. Your subscription will be activated instantly.</p>
                </div>
              </motion.div>
            )}

            {/* ---------------- MANUAL METHODS ---------------- */}
            {paymentCategory === 'manual' && (
              <motion.div key="manual" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <button 
                    type="button" onClick={() => setPaymentMethod('hesabpay')}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${
                      paymentMethod === 'hesabpay' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#FAD961]' : 'bg-[#0A0A0A] border-white/5 text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">HesabPay</span>
                  </button>
                  <button 
                    type="button" onClick={() => setPaymentMethod('atomapay')}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${
                      paymentMethod === 'atomapay' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#FAD961]' : 'bg-[#0A0A0A] border-white/5 text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <SmartphoneNfc className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">AtomaPay</span>
                  </button>
                  <button 
                    type="button" onClick={() => setPaymentMethod('cashinoffice')}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 border transition-all ${
                      paymentMethod === 'cashinoffice' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#FAD961]' : 'bg-[#0A0A0A] border-white/5 text-neutral-400 hover:bg-white/5'
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider text-center leading-tight">Cash In Office</span>
                  </button>
                </div>
                <div className="bg-[#050505] border border-white/5 rounded-xl p-4 text-center">
                  <p className="text-sm text-neutral-400">You will receive instructions to send the payment. Verification may take up to 24 hours.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-lg text-center">
              {errorMessage}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8 pt-8 border-t border-white/5">
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black font-black uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              {isProcessing 
                ? 'Processing...' 
                : paymentCategory === 'auto' 
                  ? `Pay $${selectedPlan.price} Securely` 
                  : `Proceed to Verification`
              }
            </button>
            <p className="text-center text-xs text-neutral-500 mt-4">By confirming, you agree to Safi International Capital LTD Terms of Service.</p>
          </div>

        </form>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-[#FAD961] selection:text-black pb-20 pt-28 px-6 lg:px-16">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[70rem] mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard/profile" className="p-3 bg-[#0A0A0A] border border-white/10 hover:border-[#FAD961]/50 hover:bg-white/5 rounded-2xl transition-all shadow-lg">
            <ArrowLeft className="w-5 h-5 text-neutral-400 hover:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Checkout
            </h1>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
          </div>
        }>
          <CheckoutContent />
        </Suspense>

      </div>
    </main>
  );
}