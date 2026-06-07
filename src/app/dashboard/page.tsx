"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Video, ArrowUpRight, 
  MessageSquareCode, UserCog, Mic, Lock, Code2
} from 'lucide-react';
import Link from 'next/link';

export default function CentralDashboardPage() {
  
  const studioModules = [
    {
      id: 'chat',
      title: 'Neural Chat',
      subtitle: 'Assistant & Vision',
      desc: 'Your intelligent core. Write code, draft scripts, search the web, and generate high-fidelity images through conversation.',
      link: '/dashboard/chat',
      icon: <MessageSquareCode className="w-7 h-7" />,
      color: "hover:border-[#FAD961]/30 hover:shadow-[0_0_30px_rgba(250,217,97,0.05)]",
      features: ["Text & Vision", "Web Search", "Image Gen"],
      isSoon: false
    },
    {
      id: 'code',
      title: 'Code Engine',
      subtitle: 'Neural Development',
      desc: 'Architect, refactor, and debug with an elite senior engineer. Highly optimized for modern frameworks and complex algorithms.',
      link: '/dashboard/code-engine',
      icon: <Code2 className="w-7 h-7" />,
      color: "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]",
      features: ["Advanced Debugging", "Architecture", "Optimized Code"],
      isSoon: false
    },
    {
      id: 'video',
      title: 'Cinematic Studio',
      subtitle: 'Motion & Lip-Sync',
      desc: 'Transform static concepts into hyper-realistic motion. Access text-to-video capabilities and advanced audio-driven engines.',
      link: '/dashboard/video',
      icon: <Video className="w-7 h-7" />,
      color: "hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)]",
      features: ["Text to Video", "Lip-Sync", "Motion Control"],
      isSoon: false
    },
    {
      id: 'profile',
      title: 'Command Center',
      subtitle: 'Profile & Quotas',
      desc: 'Manage your SAFI AI workspace. Monitor your monthly generation limits, subscription plans, and account configurations.',
      link: '/dashboard/profile',
      icon: <UserCog className="w-7 h-7" />,
      color: "hover:border-neutral-500/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.02)]",
      features: ["Plan Status", "Analytics", "Settings"],
      isSoon: false
    }
  ];

  return (
    <main className="relative min-h-screen bg-[#050505] text-neutral-200 antialiased overflow-hidden pb-20 pt-28 px-4 sm:px-6 lg:px-12">
      
      {/* 🟢 پس‌زمینه نوری مینیمال */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[75rem] mx-auto">
        
        {/* هدر */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-500">Workspace Dashboard</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-6">
            Safi <span className="text-blue-500">Intelligence</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl font-light leading-relaxed">
            Your centralized neural interface. Select an engine to begin your session.
          </p>
        </motion.div>

        {/* گرید ماژول‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studioModules.map((module, index) => (
            <Link key={module.id} href={module.link} className="block group">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`h-full rounded-3xl border border-neutral-800 bg-[#0a0a0a] p-8 flex flex-col transition-all duration-500 ${module.color}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 text-neutral-400 group-hover:text-white transition-colors">
                    {module.icon}
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-700 group-hover:text-blue-400 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{module.subtitle}</p>
                </div>

                <p className="text-sm text-neutral-500 mb-8 leading-relaxed flex-1">
                  {module.desc}
                </p>

                <div className="flex gap-2">
                  {module.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-medium text-neutral-400 border border-neutral-800 px-3 py-1 rounded-full group-hover:border-neutral-700 transition-colors">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}