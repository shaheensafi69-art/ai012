"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Building2, Globe2, ShieldCheck, Zap, ArrowRight, Smartphone, Shirt } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';

// ============================================================================
// REALISTIC SOLAR SYSTEM DATA (PERFECT CENTER FIXED)
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
// TEAM DATA WITH PERSONALIZED BRAND COLORS
// ============================================================================
const TEAM_MEMBERS = [
  {
    id: "shaheen",
    name: "Shaheen Safi",
    role: "Founder & Chief Executive Officer",
    image: "/shaheen.jpeg",
    delay: 0.1,
    colors: {
      borderHover: "group-hover:border-[#FAD961]/50",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(250,217,97,0.2)]",
      glow: "from-[#FAD961]/10",
      ringBase: "border-[#D4AF37]/30",
      ringHover: "group-hover:border-[#FAD961]",
      textHover: "group-hover:text-[#FAD961]",
      roleText: "text-[#D4AF37]"
    }
  },
  {
    id: "mujtaba",
    name: "Mujtaba Rahmani",
    role: "Chief Operating Officer & CISO",
    image: "/mujtaba.jpeg",
    delay: 0.2,
    colors: {
      borderHover: "group-hover:border-blue-500/50",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.2)]",
      glow: "from-blue-500/10",
      ringBase: "border-blue-500/30",
      ringHover: "group-hover:border-blue-400",
      textHover: "group-hover:text-blue-400",
      roleText: "text-blue-500"
    }
  },
  {
    id: "sahel",
    name: "Sahel Salem",
    role: "CO Founder & Leader Ecosystem Partnerships",
    image: "/sahel.jpeg",
    delay: 0.3,
    colors: {
      borderHover: "group-hover:border-emerald-500/50",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.2)]",
      glow: "from-emerald-500/10",
      ringBase: "border-emerald-500/30",
      ringHover: "group-hover:border-emerald-400",
      textHover: "group-hover:text-emerald-400",
      roleText: "text-emerald-500"
    }
  },
  {
    id: "shirin",
    name: "Shirin Gol Ahmadi",
    role: "Chief Creative Officer & AI Lead",
    image: "/shirin.jpeg",
    delay: 0.4,
    colors: {
      borderHover: "group-hover:border-pink-500/50",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.2)]",
      glow: "from-pink-500/10",
      ringBase: "border-pink-500/30",
      ringHover: "group-hover:border-pink-400",
      textHover: "group-hover:text-pink-400",
      roleText: "text-pink-500"
    }
  },
  {
    id: "husnafar",
    name: "Husnafar Shadab Zafer",
    role: "Head of Database Management",
    image: "/Husnafar Shadab Zafer.jpeg",
    delay: 0.5,
    colors: {
      borderHover: "group-hover:border-purple-500/50",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.2)]",
      glow: "from-purple-500/10",
      ringBase: "border-purple-500/30",
      ringHover: "group-hover:border-purple-400",
      textHover: "group-hover:text-purple-400",
      roleText: "text-purple-500"
    }
  }
];

// ============================================================================
// ECOSYSTEM DATA
// ============================================================================
const ECOSYSTEM = [
  {
    title: "SAFI AI",
    icon: <Zap className="w-6 h-6 text-[#FAD961]" />,
    desc: "Our flagship artificial intelligence studio. Powering cinematic video generation, flawless lip-sync, and hyper-realistic digital avatars globally."
  },
  {
    title: "SafiPay",
    icon: <Globe2 className="w-6 h-6 text-[#FAD961]" />,
    desc: "A borderless digital banking application providing multi-currency accounts (EUR, USD, GBP, etc.) and instant virtual Visa card issuance across the EU."
  },
  {
    title: "Safi TopUp",
    icon: <Smartphone className="w-6 h-6 text-[#FAD961]" />,
    desc: "Global connectivity platform allowing users to send mobile airtime, data bundles, and digital utility payments to over 150 countries instantly."
  },
  {
    title: "SafiPro",
    icon: <Shirt className="w-6 h-6 text-[#FAD961]" />,
    desc: "Our premium lifestyle and clothing brand, delivering high-quality, modern, and uniquely designed apparel that meets global fashion standards."
  }
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* THE BURNING SUN */}
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-[#ff7b00]/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-[#ffdd00]/15 rounded-full blur-[100px]" />
          
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #ffdd00 20%, #ff5e00 60%, #cc0000 90%)',
              boxShadow: '0 0 80px #ff5e00, 0 0 150px #ffdd00, inset -10px -10px 30px rgba(150,0,0,0.8)'
            }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full mix-blend-overlay opacity-60" 
              style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} 
            />
          </motion.div>

          {/* THE PLANETS */}
          {SOLAR_SYSTEM.map((planet) => (
            <motion.div
              key={planet.name}
              animate={{ rotate: 360 }}
              transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }}
              className="absolute border border-white/[0.03] rounded-full"
              style={{ 
                width: planet.orbit, 
                height: planet.orbit, 
                left: -(planet.orbit / 2), 
                top: -(planet.orbit / 2),
                transformStyle: 'preserve-3d'
              }}
            >
              <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/2 rounded-full"
                style={{
                  width: planet.size,
                  height: planet.size,
                  background: planet.gradient,
                  marginLeft: -(planet.size / 2),
                  marginTop: -(planet.size / 2),
                  boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.1)'
                }}
              >
                {planet.hasRing && (
                  <div className="absolute top-1/2 left-1/2 w-[220%] h-[30%] border-[3px] border-[#ead6b8]/50 rounded-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[20deg] shadow-[0_0_10px_rgba(234,214,184,0.3)]" />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '120px 120px', opacity: 0.15 }}></div>
      </div>
      {/* ========================================== */}

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40">
        
        {/* ==========================================
            HERO SECTION (HOLDING COMPANY)
        ========================================== */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#FAD961]/40 mb-8 shadow-[0_0_25px_rgba(250,217,97,0.2)]"
          >
            <Building2 className="w-4 h-4 text-[#FAD961]" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#FAD961] uppercase">Safi International Capital LTD</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter drop-shadow-2xl leading-tight"
          >
            Engineering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FAD961] to-[#D4AF37]">Future</span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-black/50 p-8 rounded-3xl backdrop-blur-md border border-white/5 drop-shadow-xl"
          >
            <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-6 text-justify">
              Registered in London, United Kingdom (Reg: 17063286), <strong className="text-[#FAD961] font-semibold">Safi International Capital LTD</strong> is a premier global holding company. We are pioneering advancements across FinTech, Artificial Intelligence, Telecommunications, and Premium Retail. 
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold tracking-widest text-gray-500 uppercase">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#D4AF37]"/> UK Registered</span>
              <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-[#D4AF37]"/> Global Operations</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#D4AF37]"/> AI Infrastructure</span>
            </div>
          </motion.div>
        </div>

        {/* ==========================================
            THE ECOSYSTEM SECTION
        ========================================== */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              The Safi <span className="text-[#D4AF37]">Ecosystem</span>
            </h2>
            <p className="text-[#D4AF37]/80 text-lg font-medium">A unified network of cutting-edge platforms.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ECOSYSTEM.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#0A0A0A]/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 hover:border-[#FAD961]/40 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-black border border-[#FAD961]/30 flex items-center justify-center shadow-[0_0_20px_rgba(250,217,97,0.15)] group-hover:scale-110 transition-transform duration-500">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white">{item.title}</h3>
                </div>
                <p className="text-gray-400 leading-relaxed font-light text-justify">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ==========================================
            BOARD OF DIRECTORS / TEAM SECTION
        ========================================== */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              Board of <span className="text-[#D4AF37]">Directors</span>
            </h2>
            <p className="text-[#D4AF37]/80 text-lg font-medium">The visionaries behind Safi International Capital LTD.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM_MEMBERS.map((member) => (
              <Link key={member.id} href={`/founders/${member.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: member.delay }}
                  whileHover={{ y: -10 }}
                  className="relative group cursor-pointer h-full"
                >
                  {/* Card Container (Dynamic Border & Shadow on Hover) */}
                  <div className={`bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 text-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] ${member.colors.borderHover} ${member.colors.shadowHover} transition-all duration-500 h-full flex flex-col`}>
                    
                    {/* Hover Glow (Dynamic background color) */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${member.colors.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none`} />
                    
                    {/* Profile Image (Dynamic border color) */}
                    <div className="relative w-36 h-36 mx-auto mb-6 flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full border-[3px] ${member.colors.ringBase} ${member.colors.ringHover} group-hover:scale-105 transition-all duration-500 z-20`} />
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full relative z-10 grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>

                    {/* Content (Dynamic text colors) */}
                    <div className="relative z-20 flex-grow flex flex-col">
                      <h3 className={`text-xl font-black text-white mb-2 ${member.colors.textHover} transition-colors`}>
                        {member.name}
                      </h3>
                      <p className={`${member.colors.roleText} text-[10px] sm:text-xs font-bold tracking-widest uppercase flex items-center justify-center flex-grow`}>
                        {member.role}
                      </p>
                      
                      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                        VIEW PROFILE <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}