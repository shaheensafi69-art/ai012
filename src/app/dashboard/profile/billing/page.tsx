"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Sparkles, Zap } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  images_limit: number;
  videos_limit: number;
  chat_free: boolean;
}

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // دریافت همزمان نام پلن کاربر و لیست پلن‌ها از دیتابیس
        const [profileRes, plansRes] = await Promise.all([
          supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
          supabase.from('plans').select('*').order('price', { ascending: true })
        ]);

        if (profileRes.data?.plan_name) setCurrentPlan(profileRes.data.plan_name);
        if (plansRes.data) setPlans(plansRes.data);
        
      } catch (error) {
        console.error("Error fetching billing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPlanUI = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'free': return { desc: 'Essential tools to get started.', isPopular: false };
      case 'basic': return { desc: 'Perfect for text & image generation.', isPopular: false };
      case 'creator': return { desc: 'Ideal for content creators and marketers.', isPopular: true };
      case 'pro': return { desc: 'Maximum capacity for studio professionals.', isPopular: false };
      default: return { desc: 'Premium AI features.', isPopular: false };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* 🟢 بنر وضعیت پلن فعلی (Current Plan Banner) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl border border-neutral-800/60 bg-gradient-to-br from-[#0d0d0d] to-[#050505] shadow-lg relative overflow-hidden">
        {/* افکت نوری داخل بنر */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FAD961]/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#FAD961]" />
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">Active Plan</h2>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-100">
            {currentPlan.toUpperCase()} <span className="text-neutral-500 font-medium text-lg">Workspace</span>
          </p>
        </div>
        
        <div className="shrink-0">
          <div className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 font-medium">
            Manage your subscription below
          </div>
        </div>
      </div>

      {/* 🟢 گرید کارت‌های قیمت‌گذاری */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const ui = getPlanUI(plan.id);
          const isCurrentPlan = currentPlan.toLowerCase() === plan.id.toLowerCase();

          return (
            <div 
              key={plan.id} 
              className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                ui.isPopular 
                  ? 'border border-[#FAD961]/40 bg-[#0a0a0a] shadow-[0_0_30px_rgba(250,217,97,0.05)] hover:border-[#FAD961]/60 -translate-y-1' 
                  : 'border border-neutral-800/60 bg-[#0d0d0d]/50 hover:border-neutral-700 hover:bg-[#0d0d0d]'
              }`}
            >
              {/* برچسب محبوب‌ترین پلن */}
              {ui.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black text-[10px] font-bold uppercase tracking-widest py-1 px-3.5 rounded-full shadow-md">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              
              {/* هدر کارت */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-200 mb-2">{plan.name.split(' (')[0]}</h3>
                <div className="flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-neutral-100">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-neutral-100">${plan.price}</span>
                      <span className="text-sm font-medium text-neutral-500">/mo</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">{ui.desc}</p>
              </div>
              
              {/* خط جداکننده */}
              <hr className="border-neutral-800/60 mb-6" />
              
              {/* ویژگی‌های پلن */}
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${ui.isPopular ? 'text-[#FAD961]' : 'text-neutral-500'}`} /> 
                  <span><span className="font-semibold text-neutral-200">{plan.images_limit}</span> Images</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${ui.isPopular ? 'text-[#FAD961]' : 'text-neutral-500'}`} /> 
                  <span><span className="font-semibold text-neutral-200">{plan.videos_limit}</span> Videos</span>
                </div>
                {plan.chat_free && (
                  <div className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${ui.isPopular ? 'text-[#FAD961]' : 'text-neutral-500'}`} /> 
                    <span>Unlimited Chat</span>
                  </div>
                )}
              </div>

              {/* دکمه اکشن */}
              <Link 
                href={`/dashboard/checkout?plan=${plan.id}`} 
                className={`w-full py-2.5 rounded-lg font-medium transition-all text-center text-sm flex items-center justify-center ${
                  isCurrentPlan 
                    ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-default pointer-events-none'
                    : ui.isPopular
                      ? 'bg-[#FAD961] text-black hover:bg-white shadow-[0_0_15px_rgba(250,217,97,0.2)]'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-white'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}