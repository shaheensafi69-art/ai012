"use client";

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, ArrowLeft, RefreshCw, Send, 
  ShieldCheck, ScanLine, Clock, HeartHandshake, Upload, Receipt
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function HesabpayConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ۱. خواندن اطلاعات از URL
  const packageName = searchParams.get('plan') || searchParams.get('planName') || 'Selected AI Package';
  const orderId = searchParams.get('order_id') || `ORD-${Math.floor(Math.random() * 1000000)}`;
  const rawPrice = searchParams.get('amount') || searchParams.get('price') || "0";
  const priceUSD = parseFloat(rawPrice);
  const customerEmail = searchParams.get('customerEmail') || 'Unknown Email';
  
  // ۲. استیت‌های فرم آپلود
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ۳. استیت‌های نرخ ارز و لودینگ
  const [exchangeRate, setExchangeRate] = useState<number>(85);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // گرفتن نرخ زنده دلار به افغانی
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

  // هندل کردن انتخاب فایل
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // ارسال نهایی (Supabase + Webhook)
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !receiptImage) {
      alert('لطفاً شماره تراکنش و عکس رسید را وارد کنید.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("کاربر لاگین نیست.");

      // آپلود عکس به سوپابیس
      const fileExt = receiptImage.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptImage);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      // ارسال به وب‌هوک حساب‌پی
      const response = await fetch('/api/webhooks/hesabpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: transactionId,
          receiptUrl: publicUrlData.publicUrl,
          amountUsd: priceUSD,
          amountAfn: finalPriceAfn,
          customerEmail: customerEmail,
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

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative z-10 text-center">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="w-24 h-24 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-6 border border-[#FAD961]/50 shadow-[0_0_40px_rgba(250,217,97,0.3)]"
        >
          <CheckCircle2 className="w-12 h-12 text-[#FAD961]" />
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2">Verification Pending!</h2>
        <p className="text-neutral-400 max-w-md mx-auto leading-relaxed">
          Your receipt has been submitted successfully. Our team will verify the payment within a few hours and activate your <b>{packageName.toUpperCase()}</b> plan.
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
        className="relative z-10 w-full max-w-6xl bg-[#0A0A0A]/90 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 border border-[#FAD961]/20 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80" />

        {/* HEADER */}
        <div className="text-center border-b border-white/5 pb-8 mb-8 relative">
          <div className="inline-flex items-center justify-center p-5 bg-black border border-[#FAD961]/30 rounded-2xl mb-5 shadow-[0_0_20px_rgba(250,217,97,0.2)]">
            <ShieldCheck className="text-[#FAD961] w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
            HESAB<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAD961] to-[#D4AF37]">PAY</span> GATEWAY
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
            Secure Manual Transaction Processing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ==========================================
              LEFT COLUMN: QR CODE & INSTRUCTIONS
          ========================================== */}
          <div className="lg:col-span-6 space-y-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-black/60 border border-[#FAD961]/40 p-4 rounded-2xl shadow-inner">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total (USD)</p>
                <p className="text-2xl font-black text-[#FAD961]">${priceUSD.toFixed(2)}</p>
              </div>
              <div className="bg-black/60 border border-white/10 p-4 rounded-2xl flex flex-col justify-center items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">مبلغ به افغانی</p>
                {isLoadingRate ? (
                  <div className="mt-1 w-5 h-5 border-2 border-[#FAD961] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <p className="text-xl font-black text-white mt-1">{finalPriceAfn} <span className="text-[10px] text-gray-500">AFN</span></p>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="relative group mx-auto max-w-[220px]">
              <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden border-4 border-[#FAD961]/20 p-3 shadow-[0_0_30px_rgba(250,217,97,0.15)] transition-transform duration-500 group-hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#FAD961] shadow-[0_0_20px_5px_rgba(250,217,97,0.6)] z-20 animate-[bounce_3s_infinite]" />
                <div className="relative w-full h-full">
                  <Image src="/hesabpay.jpg" alt="HesabPay QR Code" fill className="object-contain relative z-10 rounded-xl" />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-[#FAD961]/50 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.8)] z-30">
                <ScanLine size={14} className="text-[#FAD961] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FAD961]">Scan to Pay</span>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-[#111] border border-white/10 p-5 rounded-2xl text-center shadow-inner relative overflow-hidden group">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Official Account / شماره حساب</p>
              <p className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-widest">
                +33753928913
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl text-right space-y-3" dir="rtl">
              <h3 className="text-sm font-bold text-[#FAD961] flex items-center gap-2">
                <CheckCircle2 size={16} /> راهنمای پرداخت
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                مبلغ <strong className="text-white">{finalPriceAfn} افغانی</strong> را از طریق اپلیکیشن حساب‌پی به کیوآر کد بالا یا شماره حساب واریز کنید. سپس شماره تراکنش (TID) و عکس رسید را در فرم روبرو وارد نمایید.
              </p>
            </div>
          </div>

          {/* ==========================================
              RIGHT COLUMN: RECEIPT SUBMISSION FORM
          ========================================== */}
          <div className="lg:col-span-6">
            <form onSubmit={handleConfirmPayment} className="bg-[#070707]/90 backdrop-blur-3xl border border-[#D4AF37]/30 rounded-[2rem] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.9)] h-full flex flex-col justify-between">
              
              <div>
                <h2 className="text-xl font-black text-white mb-2">Submit Verification</h2>
                <p className="text-xs text-neutral-400 mb-8">Upload your transfer details to activate the {packageName} plan.</p>

                <div className="space-y-6">
                  {/* Transaction ID */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Transaction ID (TID) / کد پیگیری</label>
                    <input 
                      type="text" required value={transactionId} onChange={e => setTransactionId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#D4AF37] transition-all font-mono text-sm" 
                      placeholder="e.g. 1234567890" 
                    />
                  </div>

                  {/* Receipt Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Payment Screenshot / عکس رسید</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all min-h-[200px] ${
                        previewUrl ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 bg-[#0A0A0A] hover:border-[#D4AF37]/50 hover:bg-white/5'
                      }`}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                          <img src={previewUrl} alt="Receipt" className="max-h-48 object-contain rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-bold text-xs flex items-center gap-2"><Upload className="w-4 h-4"/> Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Receipt className="w-10 h-10 text-neutral-600 mb-3" />
                          <p className="text-sm font-bold text-neutral-300">Click to upload receipt</p>
                          <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-wider">PNG, JPG (Max 5MB)</p>
                        </>
                      )}
                      <input 
                        type="file" ref={fileInputRef} onChange={handleFileChange} required
                        accept="image/png, image/jpeg, image/jpg" className="hidden" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="order-2 sm:order-1 w-full sm:w-1/3 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 disabled:opacity-50">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="order-1 sm:order-2 w-full sm:w-2/3 py-4 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black font-black uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(250,217,97,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send className="w-5 h-5 fill-black" />}
                  {isSubmitting ? 'Uploading...' : 'Submit Payment'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </motion.div>
    </main>
  );
}

export default function HesabpayPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#020202]">
        <div className="p-6 bg-black rounded-3xl shadow-2xl mb-5 relative border border-[#FAD961]/20">
          <div className="absolute inset-0 rounded-3xl border-2 border-[#FAD961] animate-ping opacity-20" />
          <RefreshCw className="animate-spin text-[#FAD961]" size={48} />
        </div>
        <p className="font-black italic text-gray-500 uppercase tracking-[0.3em] text-xs">Initializing Secure Gateway...</p>
      </div>
    }>
      <HesabpayConfirmContent />
    </Suspense>
  );
}