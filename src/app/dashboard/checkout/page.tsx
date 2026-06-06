"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CreditCard, SmartphoneNfc, Building, 
  Wallet, Bitcoin, Loader2, Lock, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan') || 'creator';

  const [planData, setPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>('credit');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const { data } = await supabase
          .from('plans')
          .select('*')
          .ilike('id', planId)
          .single();
        
        if (data) setPlanData(data);
      } catch (error) {
        console.error("Error fetching plan:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planId]);

  // 🟢 تنظیم دقیق مسیرها (route) بر اساس پوشه‌های شما در confirm-payment
  const paymentMethods = [
    { 
      id: 'credit', 
      title: 'Credit & Debit Card', 
      desc: 'Powered by Stripe', 
      icon: <CreditCard className="w-5 h-5" />, 
      isSoon: false, 
      route: 'stripe' // مسیر استرایپ
    },
    { 
      id: 'atomapay', 
      title: 'AtomaPay', 
      desc: 'Secure Manual Transfer', 
      icon: <Wallet className="w-5 h-5" />, 
      isSoon: false, 
      route: 'atoma' // 👈 مطابق با اسم پوشه شما
    },
    { 
      id: 'hesabpay', 
      title: 'HesabPay', 
      desc: 'Afghan Local Gateway', 
      icon: <SmartphoneNfc className="w-5 h-5" />, 
      isSoon: false, 
      route: 'hesabpay' // 👈 مطابق با اسم پوشه شما
    },
    { 
      id: 'cash', 
      title: 'Cash In Office', 
      desc: 'In-person payment', 
      icon: <Building className="w-5 h-5" />, 
      isSoon: false, 
      route: 'cash' // 👈 مطابق با اسم پوشه شما
    },
    { 
      id: 'crypto', 
      title: 'Cryptocurrency', 
      desc: 'BTC, ETH, USDT', 
      icon: <Bitcoin className="w-5 h-5" />, 
      isSoon: true, 
      route: '#' 
    },
    { 
      id: 'paypal', 
      title: 'PayPal', 
      desc: 'Global Payments', 
      icon: <div className="font-bold text-lg font-serif italic tracking-tighter">P</div>, 
      isSoon: true, 
      route: '#' 
    },
  ];

  const handleProceed = () => {
    if (!planData) return;
    setIsProcessing(true);
    
    const method = paymentMethods.find(m => m.id === selectedMethod);
    if (!method || method.isSoon) {
      setIsProcessing(false);
      return;
    }

    const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    
    // 🟢 هدایت دقیق به پوشه confirm-payment
    setTimeout(() => {
      router.push(`/confirm-payment/${method.route}?plan=${planData.name}&amount=${planData.price}&order_id=${orderId}`);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-[#FAD961] animate-spin" />
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="text-center py-32">
        <p className="text-neutral-400">Plan not found or unavailable.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#FAD961] font-medium hover:text-white transition-colors">Return to Billing</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative z-10">
      
      {/* هدر بازگشت */}
      <div className="mb-8 flex items-center">
        <button onClick={() => router.push('/dashboard/profile/billing')} className="group flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-neutral-200 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-[#0d0d0d] transition-all group-hover:border-neutral-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Plans
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 tracking-tight">Checkout</h1>
        <p className="text-sm text-neutral-500 mt-1">Review your plan and select a secure payment method.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==========================================
            LEFT COLUMN: PAYMENT METHODS
        ========================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => {
              const isSelected = selectedMethod === method.id;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={method.id}
                  onClick={() => !method.isSoon && setSelectedMethod(method.id)}
                  className={`relative p-5 rounded-2xl border flex flex-col transition-all duration-300 ${
                    method.isSoon 
                      ? 'bg-[#0a0a0a]/50 border-neutral-800/40 opacity-60 cursor-not-allowed grayscale-[0.5]'
                      : isSelected
                        ? 'bg-[#FAD961]/5 border-[#FAD961]/50 cursor-pointer shadow-[0_0_20px_rgba(250,217,97,0.05)] transform scale-[1.02]'
                        : 'bg-[#0d0d0d] border-neutral-800/80 hover:border-neutral-600 hover:bg-[#111] cursor-pointer'
                  }`}
                >
                  {/* لیبل Coming Soon */}
                  {method.isSoon && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800">
                      <Lock className="w-3 h-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Soon</span>
                    </div>
                  )}

                  {/* تیک انتخاب */}
                  <AnimatePresence>
                    {!method.isSoon && isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute top-4 right-4"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#FAD961]" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    isSelected ? 'bg-[#FAD961]/10 text-[#FAD961]' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}>
                    {method.icon}
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold mb-1 tracking-wide ${isSelected ? 'text-neutral-100' : 'text-neutral-300'}`}>
                      {method.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">{method.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: ORDER SUMMARY
        ========================================== */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 p-6 sm:p-8 sticky top-24">
            
            <h2 className="text-lg font-bold text-neutral-100 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-neutral-800/60">
                <div>
                  <p className="text-base font-bold text-neutral-200 capitalize">{planData.name.split(' (')[0]}</p>
                  <p className="text-xs text-[#D4AF37] font-medium mt-1 uppercase tracking-widest">Billed Monthly</p>
                </div>
                <p className="text-lg font-bold text-neutral-200">${planData.price.toFixed(2)}</p>
              </div>

              <div className="flex justify-between items-center text-sm">
                <p className="text-neutral-400">Subtotal</p>
                <p className="text-neutral-300">${planData.price.toFixed(2)}</p>
              </div>
              <div className="flex justify-between items-center text-sm pb-4 border-b border-neutral-800/60">
                <p className="text-neutral-400">Tax</p>
                <p className="text-neutral-300">$0.00</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-base font-bold text-neutral-100">Total Due</p>
                <p className="text-2xl font-black text-[#FAD961]">${planData.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-neutral-400 mb-8 bg-[#0a0a0a] p-4 rounded-xl border border-neutral-800/60">
              <ShieldCheck className="w-5 h-5 text-green-500/80 shrink-0" />
              <span className="leading-relaxed">Guaranteed safe & secure checkout powered by SAFI AI 256-bit encryption standard.</span>
            </div>

            <button 
              onClick={handleProceed}
              disabled={isProcessing}
              className="w-full py-3.5 bg-neutral-100 text-neutral-900 font-bold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-900" />
              ) : (
                <Lock className="w-4 h-4 text-neutral-900" />
              )}
              {isProcessing ? 'Initializing Gateway...' : 'Proceed to Payment'}
            </button>
            <p className="text-center text-[10px] font-bold text-neutral-500 mt-5 uppercase tracking-widest">
              Paying via {paymentMethods.find(m => m.id === selectedMethod)?.title}
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="relative min-h-screen bg-[#080808] text-neutral-200 antialiased selection:bg-[#FAD961] selection:text-black pb-16 pt-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* پس‌زمینه نوری */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="p-5 bg-[#0d0d0d] rounded-2xl shadow-xl mb-4 border border-neutral-800">
              <Loader2 className="animate-spin text-[#FAD961]" size={32} />
            </div>
            <p className="font-medium text-neutral-500 uppercase tracking-[0.2em] text-[10px]">Preparing Secure Checkout...</p>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}