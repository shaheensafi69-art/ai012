"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, Video, MessageSquareCode, 
  Mic, Music, Box, Globe, Bot, AudioLines, 
  ArrowRight, Sparkles, Zap, ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

// Active Services
const CURRENT_SERVICES = [
  {
    id: 'images',
    title: 'Neural Image Studio',
    subtitle: 'AI Image Generation',
    description: 'Transform text into ultra-realistic, artistic, and cinematic images with the highest resolution. Create characters, environments, and commercial products in seconds.',
    icon: ImageIcon,
    features: ['Ultra-HD Resolution', 'Style Transfer', 'Photorealism']
  },
  {
    id: 'videos',
    title: 'Cinematic Video Engine',
    subtitle: 'AI Video Creation',
    description: 'Animate images and convert text scenarios into smooth, stunning videos with realistic physics and professional lighting.',
    icon: Video,
    features: ['Text-to-Video', 'Image-to-Video', 'Motion Control']
  },
  {
    id: 'chat',
    title: 'Unlimited Code & Chat',
    subtitle: 'Smart AI Assistant',
    description: 'Natural language processing engine for unlimited chat, solving complex mathematical problems, content creation, and writing/debugging advanced code.',
    icon: MessageSquareCode,
    features: ['Advanced LLM', 'Code Generation', 'Data Analysis']
  }
];

// Coming Soon Services
const FUTURE_SERVICES = [
  {
    id: 'voice',
    title: 'Voice Cloning & TTS',
    subtitle: 'Speech & Audio Synthesis',
    description: 'Generate natural human voices from text and precisely clone your voice with various emotions and tones.',
    icon: Mic
  },
  {
    id: 'music',
    title: 'AI Music Composer',
    subtitle: 'Music & Sound Effects',
    description: 'Compose exclusive music in various genres and produce cinematic sound effects using only text descriptions.',
    icon: Music
  },
  {
    id: '3d',
    title: '3D Asset Generation',
    subtitle: '3D Models & Environments',
    description: 'Create 3D objects and environments ready for use in game development and cinematic animation.',
    icon: Box
  },
  {
    id: 'web',
    title: 'Web Architect AI',
    subtitle: 'Smart Website Builder',
    description: 'Generate complete user interfaces (UI) and code for a professional website with just a simple text prompt.',
    icon: Globe
  },
  {
    id: 'agents',
    title: 'Autonomous AI Agents',
    subtitle: 'Enterprise Smart Bots',
    description: 'Autonomous bots for managing emails, scheduling meetings, and executing daily business tasks effortlessly.',
    icon: Bot
  },
  {
    id: 'dubbing',
    title: 'Real-time Dubbing',
    subtitle: 'Translation & Lip-sync',
    description: 'Automatic translation of videos into other languages with precise lip-sync matching and tone preservation.',
    icon: AudioLines
  }
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-slate-100 selection:bg-[#FAD961] selection:text-black overflow-hidden pb-24">
      
      {/* ==========================================
          SOLAR SYSTEM BACKGROUND EFFECTS
      ========================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Central Core / Sun */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
        
        {/* Orbital Rings & Planets */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Orbit 1 */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#FAD961] rounded-full shadow-[0_0_15px_#FAD961]" />
          </motion.div>

          {/* Orbit 2 */}
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.03] rounded-full"
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-[#D4AF37] rounded-full shadow-[0_0_20px_#D4AF37]" />
          </motion.div>

          {/* Orbit 3 */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white/[0.02] rounded-full"
          >
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/30 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </motion.div>
        </div>

        {/* Star Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.04 }} />
      </div>

      <div className="relative z-10 max-w-[85rem] mx-auto pt-32 px-6 lg:px-16">
        
        {/* ==========================================
            HEADER SECTION
        ========================================== */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#FAD961] text-xs font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
          >
            <Sparkles className="w-4 h-4" /> Safi AI Ecosystem
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6"
          >
            Capabilities & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAD961] to-[#D4AF37]">Vision</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            At Safi AI, we are pushing the boundaries of technology. From creating stunning images to producing cinematic videos; this is just the beginning of our journey. A smarter future is on the horizon.
          </motion.p>
        </div>

        {/* ==========================================
            CURRENT SERVICES (ACTIVE)
        ========================================== */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-4">
            <Zap className="w-8 h-8 text-[#FAD961]" />
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Active Modules</h2>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Ready-to-use deployed services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {CURRENT_SERVICES.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/50 rounded-[2rem] p-8 transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                
                <div className="w-16 h-16 bg-gradient-to-br from-[#FAD961] to-[#D4AF37] rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-8 h-8 text-black" />
                </div>
                
                <h3 className="text-xl font-black text-white mb-1">{service.title}</h3>
                <h4 className="text-sm font-bold text-[#FAD961] mb-4">{service.subtitle}</h4>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6 font-light">{service.description}</p>
                
                <div className="space-y-2 border-t border-white/5 pt-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-[#FAD961]" />
                      <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==========================================
            FUTURE VISION (COMING SOON)
        ========================================== */}
        <div>
          <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-4">
            <Globe className="w-8 h-8 text-neutral-500" />
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">Future Horizon</h2>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Vision & upcoming core modules</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FUTURE_SERVICES.map((service, index) => (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-[#050505]/80 backdrop-blur-sm border border-white/5 rounded-[1.5rem] p-6 relative overflow-hidden group"
              >
                {/* Coming Soon Tag */}
                <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-neutral-500">
                  In Development
                </div>

                <service.icon className="w-8 h-8 text-neutral-600 mb-4 group-hover:text-[#FAD961] transition-colors" />
                <h3 className="text-lg font-black text-white mb-1">{service.title}</h3>
                <h4 className="text-xs font-bold text-neutral-500 mb-3">{service.subtitle}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==========================================
            CALL TO ACTION
        ========================================== */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-gradient-to-r from-[#111] to-[#0A0A0A] border border-[#D4AF37]/30 rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.05)]"
        >
          <div className="absolute inset-0 bg-[#FAD961]/5 blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Create?</h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
              Log into your account right now and leverage the power of Safi AI's active services to accelerate your projects.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(250,217,97,0.3)]"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}