'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, GraduationCap, 
  Award, BookOpen, Cpu, Gamepad2, Lightbulb,
  Code2, Server, BarChart3, Binary, User,
  Database, Layout, Languages, Briefcase, Mail, MapPin,
  MessageCircle, Target, Activity, Trophy, TrendingUp, PieChart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

// ============================================================================
// REALISTIC SOLAR SYSTEM DATA (ثابت در تمام صفحات)
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

// --- Custom Brand Icons (SVGs for Error-Free Rendering) ---
const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// --- 3D Floating Objects Component ---
const Floating3DObject = ({ children, x, y, translateZ, rotate }: any) => (
  <motion.div
    style={{ x, y, translateZ, rotateZ: rotate, transformStyle: "preserve-3d" }}
    className="absolute z-20 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-blue-500"
  >
    {children}
  </motion.div>
);

export default function MujtabaRahmaniFullBio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  const moveX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const socialLinks = [
    { icon: <LinkedinIcon size={20} />, href: "https://www.linkedin.com/mwlite/profile/me" },
    { icon: <InstagramIcon size={20} />, href: "https://www.instagram.com/bigshot_tradez" },
    { icon: <FacebookIcon size={20} />, href: "https://www.facebook.com/share/1DJJUX1TS2/" },
    { icon: <TikTokIcon size={20} />, href: "https://www.tiktok.com/@chill_asf_fr" },
    { icon: <MessageCircle size={20} />, href: "https://wa.me/+93793035609" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-20 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white" dir="ltr" onMouseMove={handleMouseMove}>
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND (BLUE THEME)
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* هاله آبی ملایم روی کل صفحه برای تم مجتبی */}
        <div className="absolute inset-0 bg-blue-900/5 mix-blend-screen z-10" />

        {/* نقطه ثقل صفر دقیقاً در مرکز مانیتور */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* 1. THE BURNING SUN (در مرکز) */}
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-blue-600/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-blue-400/15 rounded-full blur-[100px]" />
          
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #3b82f6 20%, #1e40af 60%, #1e3a8a 90%)',
              boxShadow: '0 0 80px #1e40af, 0 0 150px #3b82f6, inset -10px -10px 30px rgba(0,0,50,0.8)'
            }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full mix-blend-overlay opacity-60" 
              style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} 
            />
          </motion.div>

          {/* 2. THE PLANETS */}
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
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.1 }}></div>
      </div>

      <div className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section ref={containerRef} className="relative pt-32 pb-20 flex flex-col items-center">
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 z-10">
              <div className="absolute inset-0 bg-blue-500/30 blur-[100px] rounded-full opacity-50" />
              <div className="relative h-full w-full rounded-[4rem] overflow-hidden border-2 border-blue-500/30 p-2 bg-[#050505]">
                <Image src="/mujtaba.jpeg" alt="Mujtaba Rahmani" fill className="object-cover rounded-[3.5rem]" priority />
              </div>
            </div>

            <Floating3DObject x={moveX} y={moveY} translateZ={120} rotate="10deg">
              <TrendingUp size={30} />
            </Floating3DObject>
            <motion.div style={{ x: moveY, y: moveX, translateZ: 180 }} className="absolute -right-16 top-10">
                <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-2xl font-black italic tracking-widest uppercase">CO-FOUNDER</div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12 px-6">
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white uppercase">MUJTABA <span className="text-blue-500">RAHMANI</span></h1>
            <p className="text-blue-400 font-bold tracking-[0.5em] text-xl mt-4 uppercase text-pretty">SafiPay Co-Founder & Economy Specialist</p>
            
            <div className="flex justify-center gap-4 mt-8">
              {socialLinks.map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href} 
                  target="_blank"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all duration-300 shadow-xl backdrop-blur-md"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-gray-500 text-sm">
               <span className="flex items-center gap-2"><MapPin size={16}/> Kabul Afghanistan</span>
               <span className="flex items-center gap-2"><User size={16}/> July 28, 2006</span>
               <span className="flex items-center gap-2 font-bold text-blue-500/50 italic underline">@bigshot_tradez</span>
            </div>
          </motion.div>
        </section>

        {/* --- ABOUT & VISION --- */}
        <section className="py-20 container mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-[#080808]/80 backdrop-blur-xl border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-2xl">
            <h2 className="text-4xl font-black mb-10 border-l-8 border-blue-600 pl-6 uppercase italic">The Co-Founder's Mission</h2>
            <div className="space-y-8 text-gray-300 text-xl leading-[2.3] text-justify font-light">
              <p>
                My name is <span className="text-white font-bold">Mujtaba Rahmani</span>, a visionary entrepreneur and professional trader dedicated to revolutionizing the financial landscape of Afghanistan. With a specialized academic background in <span className="text-blue-400 underline decoration-2">Economics and Online Business</span>, I lead the strategic and financial development of SafiPay.
              </p>
              <div className="bg-blue-600/10 p-8 rounded-[2.5rem] italic border-l-8 border-blue-600 text-blue-100">
                "We are merging traditional economic principles with cutting-edge FinTech solutions to empower the Afghan people and connect them to the global digital market."
              </div>
              <p>
                Beyond the charts and business strategies, I am a firm believer in discipline and resilience—qualities I cultivate daily through MMA and running, ensuring I stay sharp for the high-stakes world of Foreign Exchange.
              </p>
            </div>
          </motion.div>
        </section>

        {/* --- TECHNICAL STACK --- */}
        <section className="py-20 bg-blue-600/[0.02]">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="text-center text-4xl font-black mb-20 italic">CORE COMPETENCIES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-blue-500/40 transition-all group">
                <BarChart3 className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Market Analysis</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono italic">Advanced Technical Analysis, Price Action, Liquidity Management, and Forex Strategies.</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-blue-500/40 transition-all group">
                <Globe className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Digital Economy</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono italic">Strategic Online Business Development, E-commerce Scaling, and Global Market Expansion.</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-blue-500/40 transition-all group">
                <PieChart className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Financial Strategy</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono italic">Asset Allocation, Risk-to-Reward Ratio Management, and FinTech System Optimization.</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-blue-500/40 transition-all group">
                <Gamepad2 className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Next-Gen Tech</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono italic">Digital Banking Infrastructure, Blockchain Basics, and High-Performance Gaming Systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- EXPERIENCE & EDUCATION --- */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><Briefcase className="text-blue-500"/> WORK EXPERIENCE</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_#2563eb]" />
                  <h4 className="text-xl font-bold text-white">Co-Founder</h4>
                  <p className="text-blue-400 text-sm mb-2">SafiPay Digital Bank (2024 - Present)</p>
                  <p className="text-gray-500 text-sm leading-relaxed text-justify">Strategizing the financial framework and driving the growth of Afghanistan's first modern digital banking ecosystem.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Full-Time Forex Trader</h4>
                  <p className="text-blue-400 text-sm mb-2">Self-Employed (2021 - Present)</p>
                  <p className="text-gray-500 text-sm leading-relaxed text-justify">Analyzing global currency markets and managing diversified digital asset portfolios with precision.</p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><GraduationCap className="text-blue-500"/> EDUCATION</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-blue-600 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Bachelor of Economics & Online Business</h4>
                  <p className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-1">Specialized Degree</p>
                  <p className="text-gray-500 text-sm mt-2 text-justify">Comprehensive study of global financial markets, digital commerce strategies, and economic modeling.</p>
                </div>
                <div className="pt-6">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Activity size={20} className="text-blue-500"/> PHYSICAL DISCIPLINE</h3>
                   <div className="flex flex-wrap gap-4">
                     {['MMA', 'Endurance Running', 'High-Stakes Gaming'].map(item => (
                       <span key={item} className="px-5 py-2 bg-blue-500/5 rounded-2xl border border-blue-500/20 text-xs font-black text-blue-400 uppercase tracking-[0.2em]">{item}</span>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ACHIEVEMENTS --- */}
        <section className="py-20 container mx-auto max-w-4xl px-6 text-center">
            <div className="bg-gradient-to-br from-blue-600/20 to-transparent p-12 rounded-[4rem] border border-blue-500/20 backdrop-blur-md relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={150}/></div>
               <Award className="text-blue-500 mx-auto mb-6" size={60} />
               <h2 className="text-3xl font-black mb-6 italic uppercase">Core Achievements</h2>
               <ul className="text-gray-300 space-y-4 text-lg text-left inline-block">
                 <li className="flex items-center gap-3"><Zap size={18} className="text-blue-500"/> Co-Founding the SafiPay Global Financial Ecosystem</li>
                 <li className="flex items-center gap-3"><Zap size={18} className="text-blue-500"/> Strategic Graduate in Economics & Digital Markets</li>
                 <li className="flex items-center gap-3"><Zap size={18} className="text-blue-500"/> Expert Trader with 3+ years in Foreign Exchange</li>
                 <li className="flex items-center gap-3"><Zap size={18} className="text-blue-500"/> Active Advocate for Online Business in Afghanistan</li>
               </ul>
            </div>
        </section>

        <footer className="py-20 text-center">
          <div className="flex justify-center gap-6 mb-8">
            {socialLinks.map((social, idx) => (
              <Link key={idx} href={social.href} target="_blank" className="text-gray-600 hover:text-blue-500 transition-colors">
                {social.icon}
              </Link>
            ))}
          </div>
          <p className="opacity-30 text-[10px] tracking-[0.6em] uppercase font-black">
            Mujtaba Rahmani • SafiPay Co-Founder & Economy Specialist • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}