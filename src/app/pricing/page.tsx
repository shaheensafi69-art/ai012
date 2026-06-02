"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// REALISTIC SOLAR SYSTEM DATA
// ============================================================================
const SOLAR_SYSTEM = [
  { name: 'Mercury', size: 12, orbit: 300, speed: 15, gradient: 'radial-gradient(circle at 30% 30%, #b5b5b5, #5a5a5a)' },
  { name: 'Venus', size: 18, orbit: 420, speed: 25, gradient: 'radial-gradient(circle at 30% 30%, #e8c382, #8b6d3b)' },
  { name: 'Earth', size: 20, orbit: 560, speed: 35, gradient: 'radial-gradient(circle at 30% 30%, #4b9fe3, #154673)' },
  { name: 'Mars', size: 16, orbit: 700, speed: 45, gradient: 'radial-gradient(circle at 30% 30%, #c1440e, #7a2806)' },
  { name: 'Jupiter', size: 45, orbit: 950, speed: 80, gradient: 'radial-gradient(circle at 30% 30%, #d39c7e, #8c5a40)' },
  { name: 'Saturn', size: 38, orbit: 1200, speed: 120, gradient: 'radial-gradient(circle at 30% 30%, #ead6b8, #9e8461)', hasRing: true },
  { name: 'Uranus', size: 28, orbit: 1450, speed: 180, gradient: 'radial-gradient(circle at 30% 30%, #82b3d1, #3f708e)' },
  { name: 'Neptune', size: 28, orbit: 1700, speed: 250, gradient: 'radial-gradient(circle at 30% 30%, #3f54ba, #1a2668)' },
];

// ============================================================================
// SAFI AI SUBSCRIPTION PLANS
// ============================================================================
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    description: 'Essential tools for text and image synthesis.',
    features: [
      { name: '50 Neural Images / month', included: true },
      { name: 'Unlimited Chat & Code', included: true },
      { name: 'Standard Processing Speed', included: true },
      { name: 'Cinematic Video Generation', included: false },
      { name: 'Priority Support', included: false },
    ],
    isPopular: false
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 19,
    description: 'Professional suite for content creators & marketers.',
    features: [
      { name: '200 Neural Images / month', included: true },
      { name: '10 Cinematic Videos (10s max)', included: true },
      { name: 'Unlimited Chat & Code', included: true },
      { name: 'Fast Processing Speed', included: true },
      { name: 'Priority Support', included: true },
    ],
    isPopular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 35,
    description: 'Maximum capacity for studios and heavy users.',
    features: [
      { name: '600 Neural Images / month', included: true },
      { name: '30 Cinematic Videos (10s max)', included: true },
      { name: 'Unlimited Chat & Code', included: true },
      { name: 'Ultra-Fast Processing', included: true },
      { name: '24/7 Premium Support', included: true },
    ],
    isPopular: false
  }
];

export default function PricingPage() {
  const router = useRouter();

  const handlePurchaseClick = (planId: string) => {
    // انتقال مستقیم به داشبورد و صفحه چک‌اوت
    router.push(`/dashboard/checkout?plan=${planId}`);
  };

  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      
      {/* 3D SOLAR SYSTEM BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-[#D4AF37]/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-[#FAD961]/10 rounded-full blur-[100px]" />
          
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full" style={{ background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #FAD961 20%, #D4AF37 60%, #8A6D3B 90%)', boxShadow: '0 0 80px #D4AF37, 0 0 150px #FAD961, inset -10px -10px 30px rgba(0,0,0,0.8)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full mix-blend-overlay opacity-40" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} />
          </motion.div>

          {SOLAR_SYSTEM.map((planet) => (
            <motion.div key={planet.name} animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute border border-white/[0.03] rounded-full" style={{ width: planet.orbit, height: planet.orbit, left: -(planet.orbit / 2), top: -(planet.orbit / 2), transformStyle: 'preserve-3d' }}>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-1/2 rounded-full" style={{ width: planet.size, height: planet.size, background: planet.gradient, marginLeft: -(planet.size / 2), marginTop: -(planet.size / 2), boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.1)' }}>
                {planet.hasRing && <div className="absolute top-1/2 left-1/2 w-[220%] h-[30%] border-[3px] border-[#ead6b8]/40 rounded-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[20deg] shadow-[0_0_10px_rgba(234,214,184,0.2)]" />}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.05 }}></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-32">
        
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

        {/* PRICING CARDS */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto relative mb-32">
          {SUBSCRIPTION_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
              className={`relative rounded-[2.5rem] transition-all duration-500 flex flex-col h-full ${
                plan.isPopular 
                  ? 'bg-[#0A0A0A]/90 backdrop-blur-3xl border border-[#FAD961]/50 shadow-[0_20px_60px_rgba(212,175,55,0.25)] z-20 scale-105' 
                  : 'bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] hover:border-[#D4AF37]/30 z-10'
              }`}
            >
              {plan.isPopular && (
                <>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black text-xs font-black tracking-widest uppercase px-6 py-2 rounded-full shadow-[0_0_20px_rgba(250,217,97,0.5)] z-10">
                    Most Popular
                  </div>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80 rounded-t-[2.5rem]" />
                </>
              )}

              <div className="p-10 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-neutral-400 mb-8 min-h-[40px] leading-relaxed">{plan.description}</p>
                
                <div className="mb-8 flex items-end gap-1">
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FAD961] to-[#D4AF37]">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-bold text-neutral-500 mb-1">/month</span>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, i) => (
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
                    plan.isPopular 
                      ? 'bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black shadow-[0_0_30px_rgba(250,217,97,0.4)] hover:shadow-[0_0_40px_rgba(250,217,97,0.6)] hover:scale-[1.02]' 
                      : 'bg-white/5 text-white border border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/10'
                  }`}
                >
                  Choose {plan.name}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}