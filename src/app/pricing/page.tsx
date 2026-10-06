"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

import TechBackground from '@/components/TechBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  images_limit: number;
  videos_limit: number;
  chat_free: boolean;
  video_duration_max: number;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 واکشی پلن‌ها از دیتابیس
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;

        if (data) {
          // فیلتر کردن پلن رایگان برای نمایش فقط پلن‌های پولی (مثل دیزاین اصلی شما)
          const premiumPlans = data.filter(plan => plan.price > 0);
          setPlans(premiumPlans);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePurchaseClick = (planId: string) => {
    router.push(`/dashboard/checkout?plan=${planId}`);
  };

  // 🟢 تابع هوشمند برای تولید متن‌های مارکتینگ و ویژگی‌ها بر اساس دیتای دیتابیس
  const getPlanDetails = (plan: SubscriptionPlan) => {
    const isBasic = plan.id === 'basic';
    const isCreator = plan.id === 'creator';
    const isPro = plan.id === 'pro';

    return {
      cleanName: plan.name.split(' (')[0], // جدا کردن نام انگلیسی
      description: isBasic ? 'Essential tools for text and image synthesis.' :
                   isCreator ? 'Professional suite for content creators & marketers.' :
                   'Maximum capacity for studios and heavy users.',
      isPopular: isCreator,
      features: [
        { name: `${plan.images_limit} Neural Images / month`, included: plan.images_limit > 0 },
        { 
          name: plan.videos_limit > 0 ? `${plan.videos_limit} Cinematic Videos (${plan.video_duration_max}s max)` : 'Cinematic Video Generation', 
          included: plan.videos_limit > 0 
        },
        { name: 'Unlimited Chat & Code', included: plan.chat_free },
        { name: isPro ? 'Ultra-Fast Processing' : isCreator ? 'Fast Processing Speed' : 'Standard Processing Speed', included: true },
        { name: isPro ? '24/7 Premium Support' : 'Priority Support', included: isCreator || isPro },
      ]
    };
  };

  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="default" />
      <Navbar />

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40">

        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} 
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#FAD961]/40 mb-8 shadow-[0_0_25px_rgba(250,217,97,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-[#FAD961] animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#FAD961] uppercase">Simple & Transparent Plans</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} 
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-2xl"
          >
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FAD961] to-[#D4AF37] drop-shadow-[0_0_40px_rgba(250,217,97,0.5)]">Creativity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-400 text-lg max-w-2xl mx-auto font-light"
          >
            Select the perfect package for your AI needs. Whether you are generating images, producing cinematic videos, or coding, we have a plan for you.
          </motion.p>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-[#FAD961] animate-spin" />
          </div>
        ) : (
          /* PRICING CARDS DYNAMIC GRID */
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto relative mb-32">
            {plans.map((plan, idx) => {
              const details = getPlanDetails(plan);
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                  className={`relative rounded-[2.5rem] transition-all duration-500 flex flex-col h-full ${
                    details.isPopular 
                      ? 'bg-[#0A0A0A]/90 backdrop-blur-3xl border border-[#FAD961]/50 shadow-[0_20px_60px_rgba(212,175,55,0.25)] z-20 scale-105' 
                      : 'bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] hover:border-[#D4AF37]/30 z-10'
                  }`}
                >
                  {details.isPopular && (
                    <>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black text-xs font-black tracking-widest uppercase px-6 py-2 rounded-full shadow-[0_0_20px_rgba(250,217,97,0.5)] z-10">
                        Most Popular
                      </div>
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80 rounded-t-[2.5rem]" />
                    </>
                  )}

                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-white mb-2">{details.cleanName}</h3>
                    <p className="text-sm text-neutral-400 mb-8 min-h-[40px] leading-relaxed">{details.description}</p>
                    
                    <div className="mb-8 flex items-end gap-1">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FAD961] to-[#D4AF37]">
                        ${plan.price}
                      </span>
                      <span className="text-sm font-bold text-neutral-500 mb-1">/month</span>
                    </div>

                    <div className="space-y-4 mb-10 flex-1">
                      {details.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {feature.included ? (
                            <CheckCircle2 className="w-5 h-5 text-[#FAD961] shrink-0" />
                          ) : (
                            <X className="w-5 h-5 text-neutral-600 shrink-0" />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-neutral-200' : 'text-neutral-600'}`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handlePurchaseClick(plan.id)}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase transition-all duration-300 group mt-auto ${
                        details.isPopular 
                          ? 'bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black shadow-[0_0_30px_rgba(250,217,97,0.4)] hover:shadow-[0_0_40px_rgba(250,217,97,0.6)] hover:scale-[1.02]' 
                          : 'bg-white/5 text-white border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10'
                      }`}
                    >
                      Choose {details.cleanName}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}