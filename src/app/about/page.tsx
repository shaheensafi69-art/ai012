"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe2, ShieldCheck, Zap, ArrowRight, Smartphone, Shirt } from 'lucide-react';
import Link from 'next/link';
import TechBackground from '@/components/TechBackground';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ============================================================================
// EXECUTIVE LEADERSHIP DATA - ORDERED STRICTLY BY ORGANIZATIONAL RANK
// ============================================================================
const TEAM_MEMBERS = [
  {
    id: "shaheen",
    name: "Shaheen Safi",
    role: "Director & Founder",
    image: "/shaheen.jpeg",
    delay: 0.1,
    colors: {
      borderHover: "group-hover:border-[#FAD961]/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(250,217,97,0.25)]",
      glow: "from-[#FAD961]/15",
      ringBase: "border-[#D4AF37]/40",
      ringHover: "group-hover:border-[#FAD961]",
      textHover: "group-hover:text-[#FAD961]",
      roleText: "text-[#FAD961]"
    }
  },
  {
    id: "sahel",
    name: "Sahel Salem",
    role: "CEO & Head of European Relations",
    image: "/sahel.jpeg",
    delay: 0.2,
    colors: {
      borderHover: "group-hover:border-emerald-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.25)]",
      glow: "from-emerald-500/15",
      ringBase: "border-emerald-500/40",
      ringHover: "group-hover:border-emerald-400",
      textHover: "group-hover:text-emerald-400",
      roleText: "text-emerald-400"
    }
  },
  {
    id: "shirin",
    name: "Shirin Gol Ahmadi",
    role: "Ecosystem General Manager",
    image: "/shirin.jpeg",
    delay: 0.3,
    colors: {
      borderHover: "group-hover:border-pink-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(236,72,153,0.25)]",
      glow: "from-pink-500/15",
      ringBase: "border-pink-500/40",
      ringHover: "group-hover:border-pink-400",
      textHover: "group-hover:text-pink-400",
      roleText: "text-pink-400"
    }
  },
  {
    id: "mujtaba",
    name: "Mujtaba Rahmani",
    role: "Co-Founder",
    image: "/mujtaba.jpeg",
    delay: 0.4,
    colors: {
      borderHover: "group-hover:border-blue-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.25)]",
      glow: "from-blue-500/15",
      ringBase: "border-blue-500/40",
      ringHover: "group-hover:border-blue-400",
      textHover: "group-hover:text-blue-400",
      roleText: "text-blue-400"
    }
  },
  {
    id: "mobin",
    name: "Mobin Hasani",
    role: "Lead Developer",
    image: "/mobin.jpeg",
    delay: 0.5,
    colors: {
      borderHover: "group-hover:border-cyan-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(6,182,212,0.25)]",
      glow: "from-cyan-500/15",
      ringBase: "border-cyan-500/40",
      ringHover: "group-hover:border-cyan-400",
      textHover: "group-hover:text-cyan-400",
      roleText: "text-cyan-400"
    }
  },
  {
    id: "husnafar",
    name: "Husnafar Shadab Zafer",
    role: "Head of Database Management",
    image: "/Husnafar Shadab Zafer.jpeg",
    delay: 0.6,
    colors: {
      borderHover: "group-hover:border-purple-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.25)]",
      glow: "from-purple-500/15",
      ringBase: "border-purple-500/40",
      ringHover: "group-hover:border-purple-400",
      textHover: "group-hover:text-purple-400",
      roleText: "text-purple-400"
    }
  },
  {
    id: "mudassir",
    name: "Mudassir Moradi",
    role: "Social Media Manager",
    image: "/mudassir.jpeg",
    delay: 0.7,
    colors: {
      borderHover: "group-hover:border-amber-500/60",
      shadowHover: "group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)]",
      glow: "from-amber-500/15",
      ringBase: "border-amber-500/40",
      ringHover: "group-hover:border-amber-400",
      textHover: "group-hover:text-amber-400",
      roleText: "text-amber-400"
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
    desc: "Our flagship artificial intelligence studio powered by Google AI Studio Gemini. Delivering cinematic video creation, advanced vision, code generation, and hyper-realistic digital avatars globally."
  },
  {
    title: "SafiPay",
    icon: <Globe2 className="w-6 h-6 text-[#FAD961]" />,
    desc: "A borderless digital banking application providing multi-currency accounts (EUR, USD, GBP, etc.) and instant virtual Visa card issuance across the European Union and worldwide."
  },
  {
    title: "Safi TopUp",
    icon: <Smartphone className="w-6 h-6 text-[#FAD961]" />,
    desc: "Global connectivity platform allowing users to send mobile airtime, high-speed data bundles, and digital utility payments to over 150 countries instantly."
  },
  {
    title: "SafiPro",
    icon: <Shirt className="w-6 h-6 text-[#FAD961]" />,
    desc: "Our premium lifestyle and clothing brand, delivering high-quality, modern, and uniquely designed apparel that meets global executive fashion standards."
  }
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#030305] text-white overflow-hidden pb-24">
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="default" />

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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0E]/90 backdrop-blur-xl border border-[#FAD961]/30 mb-8 shadow-[0_0_25px_rgba(250,217,97,0.15)]"
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
            className="bg-black/60 p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed mb-6 text-justify">
              Registered in London, United Kingdom (Reg: 17063286), <strong className="text-[#FAD961] font-semibold">Safi International Capital LTD</strong> is an elite global holding company. We pioneer breakthroughs across Financial Technology, Artificial Intelligence, Telecommunications, and Global Digital Infrastructure. 
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#D4AF37]"/> UK Registered</span>
              <span className="flex items-center gap-2"><Globe2 className="w-4 h-4 text-[#D4AF37]"/> European & Global Operations</span>
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#D4AF37]"/> AI Neural Infrastructure</span>
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
            <p className="text-gray-400 text-lg font-medium">A unified architecture of cutting-edge technology platforms.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ECOSYSTEM.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#0A0A0E]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 hover:border-[#FAD961]/40 transition-all duration-500 group shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
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
            STRICTLY RANKED BY HIERARCHY
        ========================================== */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">
              Executive Hierarchy
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              Board of <span className="text-[#D4AF37]">Directors</span> & Leadership
            </h2>
            <p className="text-gray-400 text-lg font-medium">Ranked executive leaders driving Safi International Capital LTD.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <Link key={member.id} href={`/founders/${member.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: member.delay }}
                  whileHover={{ y: -8 }}
                  className="relative group cursor-pointer h-full"
                >
                  {/* Card Container */}
                  <div className={`bg-[#0A0A0E]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 text-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] ${member.colors.borderHover} ${member.colors.shadowHover} transition-all duration-500 h-full flex flex-col relative overflow-hidden`}>
                    
                    {/* Rank Badge */}
                    <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:text-white group-hover:border-white/30 transition-all">
                      #{index + 1}
                    </div>

                    {/* Hover Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${member.colors.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none`} />
                    
                    {/* Profile Image */}
                    <div className="relative w-36 h-36 mx-auto mb-6 flex-shrink-0">
                      <div className={`absolute inset-0 rounded-full border-[3px] ${member.colors.ringBase} ${member.colors.ringHover} group-hover:scale-105 transition-all duration-500 z-20`} />
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full relative z-10 transition-all duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-20 flex-grow flex flex-col">
                      <h3 className={`text-xl font-black text-white mb-2 ${member.colors.textHover} transition-colors`}>
                        {member.name}
                      </h3>
                      <p className={`${member.colors.roleText} text-[11px] sm:text-xs font-bold tracking-widest uppercase flex items-center justify-center flex-grow py-1`}>
                        {member.role}
                      </p>
                      
                      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                        EXECUTIVE BIO <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}