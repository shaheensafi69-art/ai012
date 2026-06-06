"use client";

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowLeft, RefreshCw, Send, 
  ShieldCheck, ScanLine, Upload, Receipt, Loader2, Info
} from 'lucide-react';

// 🟢 استفاده از نسخه SSR سوپابیس برای خواندن دقیق کوکی‌های لاگین
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function HesabpayConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // خواندن اطلاعات از URL
  const packageName = searchParams.get('plan') || 'Selected AI Package';
  const orderId = searchParams.get('order_id') || `ORD-${Math.floor(Math.random() * 1000000)}`;
  const rawPrice = searchParams.get('amount') || "0";
  const priceUSD = parseFloat(rawPrice);
  const customerEmail = searchParams.get('customerEmail') || 'user@safi-hub.com';
  
  // استیت‌های فرم
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [exchangeRate, setExchangeRate] = useState<number>(85);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // دریافت نرخ زنده دلار
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

  const calculatedAfn = (priceUSD * exchangeRate);
  const finalPriceAfn = priceUSD > 0 ? (Math.round(calculatedAfn) + 100).toLocaleString() : "0";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !receiptImage) {
      alert('لطفاً شماره تراکنش و عکس رسید را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 🟢 بررسی دقیق کاربر از طریق کوکی
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("کاربر لاگین نیست. لطفاً مجدداً وارد سایت شوید.");

      const fileExt = receiptImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptImage);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      const response = await fetch('/api/webhooks/hesabpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: transactionId,
          receiptUrl: publicUrlData.publicUrl,
          amountUsd: priceUSD,
          amountAfn: finalPriceAfn,
          customerEmail: user.email,
          planName: packageName,
          userId: user.id
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/profile/overview');
        }, 4000);
      } else {
        throw new Error("متاسفانه در ثبت درخواست خطایی رخ داد.");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "خطای ارتباط با سرور رخ داد. لطفاً اینترنت خود را بررسی کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10 text-center px-4">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="w-20 h-20 bg-[#FAD961]/10 rounded-full flex items-center justify-center mb-6 border border-[#FAD961]/30"
        >
          <CheckCircle2 className="w-10 h-10 text-[#FAD961]" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-100 mb-3">Verification Pending</h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Your receipt has been submitted successfully. Our team will verify the payment shortly and activate your <b className="text-neutral-200">{packageName.toUpperCase()}</b> plan.
        </p>
        <p className="text-[11px] text-[#FAD961] mt-8 animate-pulse font-medium tracking-widest uppercase">Redirecting to workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative z-10">
      
      {/* 🟢 هدر بازگشت مستقیم به صفحه Checkout */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ==========================================
            LEFT COLUMN: INSTRUCTIONS & QR
        ========================================== */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 p-6 sm:p-8">
            
            <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-neutral-800/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-[#FAD961]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-100 tracking-tight">HesabPay Gateway</h1>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mt-0.5">Secure Manual Transfer</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl border border-neutral-800/60 bg-[#0a0a0a] p-4 text-center">
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mb-1">Total (USD)</p>
                <p className="text-xl font-bold text-neutral-200">${priceUSD.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-[#FAD961]/20 bg-[#FAD961]/5 p-4 text-center">
                <p className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest mb-1">Total (AFN)</p>
                {isLoadingRate ? (
                  <div className="flex justify-center mt-1">
                    <Loader2 className="w-5 h-5 text-[#FAD961] animate-spin" />
                  </div>
                ) : (
                  <p className="text-xl font-bold text-[#FAD961]">{finalPriceAfn} <span className="text-[10px] font-medium">AFN</span></p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-[#0a0a0a] rounded-xl border border-neutral-800/60 p-6">
              {/* QR Code */}
              <div className="relative aspect-square w-32 bg-white rounded-xl overflow-hidden border border-neutral-200 p-2 shrink-0">
                <div className="relative w-full h-full">
                  <Image src="/hesabpay.jpg" alt="HesabPay QR Code" fill className="object-contain" />
                </div>
              </div>
              
              <div className="text-center sm:text-left space-y-3 w-full">
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Official Account</p>
                  <p className="text-xl font-mono font-medium text-neutral-200 tracking-wider">+33 753 928 913</p>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-neutral-400">
                  <ScanLine className="w-3.5 h-3.5 text-[#FAD961]" />
                  Scan QR or use account number
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-neutral-900/50 border border-neutral-800 p-5 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#FAD961] flex items-center gap-2">
                <Info className="w-4 h-4" /> Payment Instructions
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Please transfer exactly <strong className="text-neutral-200 font-medium">{finalPriceAfn} AFN</strong> via the HesabPay app. Once completed, enter the Transaction ID (TID) and upload a screenshot of your receipt in the form.
              </p>
            </div>

          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: SUBMISSION FORM
        ========================================== */}
        <div className="space-y-6 h-full">
          <form onSubmit={handleConfirmPayment} className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 p-6 sm:p-8 flex flex-col h-full">
            
            <div className="flex-1">
              <h2 className="text-lg font-bold text-neutral-100 mb-1.5">Submit Verification</h2>
              <p className="text-xs text-neutral-500 mb-8">Upload your transfer details to activate your workspace.</p>

              <div className="space-y-5">
                {/* Transaction ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Transaction ID (TID)
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={transactionId} 
                    onChange={e => setTransactionId(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl px-4 py-3 text-neutral-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono text-sm placeholder:text-neutral-700 placeholder:font-sans" 
                    placeholder="e.g. 1234567890" 
                  />
                </div>

                {/* Receipt Upload */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Payment Screenshot
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all h-[180px] ${
                      previewUrl ? 'border-neutral-700 bg-neutral-900/30' : 'border-neutral-800 bg-[#0a0a0a] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center group">
                        <img src={previewUrl} alt="Receipt" className="max-h-full object-contain" />
                        <div className="absolute inset-0 bg-[#080808]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-neutral-200 font-medium text-xs flex items-center gap-2">
                            <Upload className="w-4 h-4"/> Change Image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3">
                          <Receipt className="w-4 h-4 text-neutral-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-300">Click to upload receipt</p>
                        <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input 
                      type="file" ref={fileInputRef} onChange={handleFileChange} required
                      accept="image/png, image/jpeg, image/jpg" className="hidden" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row gap-3">
              {/* 🟢 دکمه کنسل برای بازگشت به چک‌اوت */}
              <button 
                type="button" 
                onClick={() => router.push(`/dashboard/checkout?plan=${packageName.toLowerCase()}`)} 
                disabled={isSubmitting} 
                className="w-full sm:w-1/3 py-3 text-xs font-semibold text-neutral-400 hover:text-neutral-200 bg-transparent border border-neutral-800 hover:bg-neutral-900 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-2/3 py-3 bg-neutral-100 text-neutral-900 font-semibold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
                ) : (
                  <Send className="w-4 h-4 text-neutral-900" />
                )}
                {isSubmitting ? 'Verifying...' : 'Submit Payment'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default function HesabpayPage() {
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
            <p className="font-medium text-neutral-500 uppercase tracking-[0.2em] text-[10px]">Initializing Secure Gateway...</p>
          </div>
        }>
          <HesabpayConfirmContent />
        </Suspense>
      </div>
    </main>
  );
}