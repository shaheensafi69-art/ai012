"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Video, ArrowUpRight, 
  MessageSquareCode, UserCog, Mic, Lock
} from 'lucide-react';
import Link from 'next/link';

export default function CentralDashboardPage() {
  
  // 🟢 لیست ماژول‌ها + اضافه شدن ماژول Voice Chat
  const studioModules = [
    {
      id: 'chat',
      title: 'Neural Chat',
      subtitle: 'Assistant & Vision',
      desc: 'Your intelligent core. Write code, draft scripts, search the web, and generate high-fidelity images directly through natural conversation.',
      link: '/dashboard/chat',
      icon: <MessageSquareCode className="w-7 h-7" />,
      features: ["Text & Code", "Image Synthesis", "Web Search"],
      isSoon: false
    },
    {
      id: 'video',
      title: 'Cinematic Studio',
      subtitle: 'Motion & Lip-Sync',
      desc: 'Transform static concepts into hyper-realistic motion. Access text-to-video capabilities and advanced audio-driven lip-sync engines.',
      link: '/dashboard/video',
      icon: <Video className="w-7 h-7" />,
      features: ["Text to Video", "Lip-Sync Engine", "Motion Control"],
      isSoon: false
    },
    {
      id: 'voice',
      title: 'Voice AI',
      subtitle: 'Speech & Synthesis',
      desc: 'Engage in fluid, real-time voice conversations. Clone voices and generate broadcast-quality speech directly from your text inputs.',
      link: '#',
      icon: <Mic className="w-7 h-7" />,
      features: ["Real-time Voice", "Voice Cloning", "TTS Engine"],
      isSoon: true // 🟢 فعال کردن حالت Coming Soon
    },
    {
      id: 'profile',
      title: 'Command Center',
      subtitle: 'Profile & Quotas',
      desc: 'Manage your SAFI AI workspace. Monitor your monthly generation limits, upgrade your subscription plan, and configure account settings.',
      link: '/dashboard/profile',
      icon: <UserCog className="w-7 h-7" />,
      features: ["Plan Status", "Usage Analytics", "Preferences"],
      isSoon: false
    }
  ];

  return (
    <main className="relative min-h-screen bg-[#080808] text-neutral-200 antialiased selection:bg-[#FAD961] selection:text-black overflow-hidden pb-20 pt-28 px-4 sm:px-6 lg:px-12">
      
      {/* 🟢 پس‌زمینه مینیمال (بدون شلوغی، با هاله‌های نوری بسیار ظریف) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-[#FAD961]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[70rem] mx-auto">
        
        {/* 🟢 بخش هدر و خوش‌آمدگویی */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-[#0d0d0d] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#FAD961]" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Welcome to SAFI Workspace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-100 mb-6">
            Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAD961] to-[#D4AF37]">Core</span>
          </h1>
          <p className="text-neutral-500 text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
            Select a processing module below. Experience seamless generation powered by the enterprise-grade SAFI neural architecture.
          </p>
        </motion.div>

        {/* 🟢 گرید ماژول‌ها (2 در 2 برای زیبایی بیشتر) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {studioModules.map((module, index) => {
            
            // محتوای داخلی هر کارت
            const CardContent = (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group h-full w-full rounded-2xl border border-neutral-800/60 p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all duration-300 ${
                  module.isSoon 
                    ? 'bg-[#0a0a0a]/50 opacity-80 cursor-not-allowed' // استایل حالت Soon
                    : 'bg-[#0d0d0d]/50 hover:bg-[#111] hover:border-neutral-700 hover:shadow-2xl hover:shadow-[#FAD961]/[0.02] cursor-pointer'
                }`}
              >
                {/* 🟢 برچسب Coming Soon */}
                {module.isSoon && (
                  <div className="absolute top-6 right-6 flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-md">
                    <Lock className="w-3 h-3 text-neutral-500" />
                    <span className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">Coming Soon</span>
                  </div>
                )}

                {/* آیکون و فلش */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    module.isSoon 
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-600' 
                      : 'bg-[#0a0a0a] border-neutral-800 text-neutral-300 group-hover:text-[#FAD961] group-hover:border-[#FAD961]/30 shadow-sm'
                  }`}>
                    {module.icon}
                  </div>
                  {!module.isSoon && (
                    <div className="text-neutral-600 group-hover:text-neutral-300 transition-colors">
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  )}
                </div>

                {/* عنوان‌ها */}
                <div className="mb-4">
                  <h3 className={`text-xl font-bold tracking-tight mb-1.5 transition-colors ${module.isSoon ? 'text-neutral-500' : 'text-neutral-100 group-hover:text-white'}`}>
                    {module.title}
                  </h3>
                  <p className="text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
                    {module.subtitle}
                  </p>
                </div>

                {/* توضیحات */}
                <p className={`text-sm leading-relaxed flex-1 mb-8 ${module.isSoon ? 'text-neutral-600' : 'text-neutral-400 group-hover:text-neutral-300'}`}>
                  {module.desc}
                </p>

                {/* تگ‌های ویژگی */}
                <div className="flex flex-wrap gap-2 pt-5 border-t border-neutral-800/60 mt-auto">
                  {module.features.map((feat, i) => (
                    <span 
                      key={i} 
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-md border ${
                        module.isSoon 
                          ? 'bg-neutral-900/50 border-neutral-800 text-neutral-600'
                          : 'bg-[#0a0a0a] border-neutral-800 text-neutral-400 group-hover:border-neutral-700'
                      }`}
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </motion.div>
            );

            // اگر ماژول Soon باشد، نباید لینک کار کند
            if (module.isSoon) {
              return <div key={module.id} className="block w-full h-full">{CardContent}</div>;
            }

            // برای بقیه ماژول‌ها لینک را رندر می‌کنیم
            return (
              <Link key={module.id} href={module.link} className="block w-full h-full focus:outline-none">
                {CardContent}
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}