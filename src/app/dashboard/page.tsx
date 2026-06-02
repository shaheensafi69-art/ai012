"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Video, ChevronRight, 
  ArrowUpRight, MessageSquareCode, UserCog
} from 'lucide-react';
import Link from 'next/link';

export default function CentralDashboardPage() {
  // Upgraded categorization: Consolidated & Enterprise-focused
  const studioModules = [
    {
      id: 'chat',
      title: 'SAFI Neural Chat',
      subtitle: 'Assistant & Vision',
      desc: 'Your intelligent core. Write code, draft scripts, search the web, and generate high-fidelity images directly through natural conversation.',
      link: '/dashboard/chat',
      icon: <MessageSquareCode className="w-8 h-8 text-[#FAD961]" />,
      features: ["Text & Code", "Image Synthesis", "Web Search"],
      color: "from-[#FAD961]/10 via-transparent to-transparent",
      borderColor: "hover:border-[#FAD961]/50"
    },
    {
      id: 'video',
      title: 'Cinematic Studio',
      subtitle: 'Motion & Lip-Sync',
      desc: 'Transform static concepts into hyper-realistic motion. Access text-to-video capabilities and advanced audio-driven lip-sync engines.',
      link: '/dashboard/video',
      icon: <Video className="w-8 h-8 text-[#FFF8D6]" />,
      features: ["Text to Video", "Lip-Sync Engine", "Motion Control"],
      color: "from-[#FFF8D6]/10 via-transparent to-transparent",
      borderColor: "hover:border-[#FFF8D6]/50"
    },
    {
      id: 'profile',
      title: 'Command Center',
      subtitle: 'Profile & Quotas',
      desc: 'Manage your SAFI AI workspace. Monitor your monthly generation limits, upgrade your subscription plan, and configure account settings.',
      link: '/dashboard/profile',
      icon: <UserCog className="w-8 h-8 text-[#D4AF37]" />,
      features: ["Plan Status", "Usage Analytics", "Preferences"],
      color: "from-[#D4AF37]/10 via-transparent to-transparent",
      borderColor: "hover:border-[#D4AF37]/50"
    }
  ];

  return (
    <main className="relative min-h-screen bg-black text-slate-100 overflow-hidden pb-20 pt-36 px-6 lg:px-16 selection:bg-[#FAD961] selection:text-black">
      
      {/* ==========================================
          PREMIUM MINIMALIST BACKGROUND
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Black Base */}
        <div className="absolute inset-0 bg-[#020202]" />
        
        {/* Animated Neural Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            animation: 'grid-move 20s linear infinite'
          }}
        />

        {/* Subtle Luxury Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FAD961]/5 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
      <div className="relative z-10 max-w-[75rem] mx-auto">
        
        {/* TITLE SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[#FAD961] mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-300">Welcome to SAFI AI</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 drop-shadow-2xl">
            Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAD961] to-[#D4AF37]">Core</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed font-medium max-w-xl">
            Select a processing module below. Experience seamless generation powered by the enterprise-grade SAFI neural architecture.
          </p>
        </motion.div>

        {/* MODULE CARDS (3-COLUMN GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {studioModules.map((module, index) => (
            <Link href={module.link} key={module.id} className="group flex h-full">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`w-full bg-[#070707]/80 backdrop-blur-xl bg-gradient-to-br ${module.color} border border-white/[0.05] rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:bg-[#0a0a0a] hover:-translate-y-2 ${module.borderColor} hover:shadow-[0_20px_40px_rgba(212,175,55,0.08)]`}
              >
                {/* Hover Glow Effect */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#FAD961]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="w-full relative z-10">
                  {/* Top Row: Icon & Arrow */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-black border border-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:border-[#D4AF37]/50 transition-all duration-500 shadow-xl">
                      {module.icon}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-neutral-500 group-hover:text-black group-hover:border-[#FAD961] group-hover:bg-[#FAD961] transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-[#FAD961] transition-colors duration-300">
                      {module.title}
                    </h3>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                      {module.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 font-medium leading-relaxed mb-8 group-hover:text-neutral-300 transition-colors">
                    {module.desc}
                  </p>
                </div>

                {/* Features Badges */}
                <div className="border-t border-white/5 pt-6 w-full space-y-5 relative z-10">
                  <div className="flex flex-wrap gap-2">
                    {module.features.map((feat, i) => (
                      <span key={i} className="text-[10px] font-mono font-semibold bg-black/50 border border-white/5 px-3 py-1.5 rounded-lg text-neutral-400 group-hover:text-[#FAD961] group-hover:border-[#FAD961]/20 transition-all duration-300">
                        {feat}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.15em] text-neutral-500 group-hover:text-[#D4AF37] transition-colors duration-300">
                    ACCESS MODULE <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </motion.div>
            </Link>
          ))}
        </div>

      </div>

      {/* Global CSS Animation for the Grid */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}} />
    </main>
  );
}