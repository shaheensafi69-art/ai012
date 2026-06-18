'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, GraduationCap, 
  Award, BookOpen, Cpu, Lightbulb,
  Briefcase, MapPin, 
  MessageCircle, Landmark, Star, Target,
  History, School, ArrowUpRight, MonitorPlay, Activity
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

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

// --- Custom Brand Icons ---
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

const Floating3DObject = ({ children, x, y, translateZ, rotate }: any) => (
  <motion.div
    style={{ x, y, translateZ, rotateZ: rotate, transformStyle: "preserve-3d" }}
    className="absolute z-20 p-5 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-cyan-500/20 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] text-cyan-500"
  >
    {children}
  </motion.div>
);

export default function MudassirMoradiBio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const moveX = useTransform(springX, [-0.5, 0.5], [-40, 40]);
  const moveY = useTransform(springY, [-0.5, 0.5], [-40, 40]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // اطلاعات شبکه‌های اجتماعی مدثر
  const socialLinks = [
    { icon: <FacebookIcon size={22} />, href: "#", label: "Facebook" },
    { icon: <InstagramIcon size={22} />, href: "#", label: "Instagram" },
    { icon: <LinkedinIcon size={22} />, href: "#", label: "LinkedIn" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32 font-sans overflow-x-hidden selection:bg-cyan-500/30" onMouseMove={handleMouseMove}>
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* هاله فیروزه‌ای رنگ مخصوص تم پروفایل مدثر */}
        <div className="absolute inset-0 bg-cyan-900/5 mix-blend-screen z-10" />

        {/* نقطه ثقل صفر دقیقاً در مرکز مانیتور */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* 1. THE BURNING SUN (Cyan Theme) */}
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-cyan-600/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-cyan-400/15 rounded-full blur-[100px]" />
          
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #06b6d4 20%, #0891b2 60%, #164e63 90%)',
              boxShadow: '0 0 80px #0891b2, 0 0 150px #06b6d4, inset -10px -10px 30px rgba(0,50,50,0.8)'
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
      {/* ========================================== */}

      <div className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section ref={containerRef} className="relative pt-40 pb-20 flex flex-col items-center">
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
            <div className="relative w-72 h-72 md:w-96 md:h-96 z-10">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full" />
              <div className="relative h-full w-full rounded-[5rem] overflow-hidden border border-cyan-500/20 p-3 bg-[#050505]">
                <Image src="/mudassir.jpeg" alt="Mudassir Moradi" fill className="object-cover rounded-[4.5rem] grayscale hover:grayscale-0 transition-all duration-700" priority />
              </div>
            </div>

            <Floating3DObject x={moveX} y={moveY} translateZ={150} rotate="15deg">
              <Zap size={35} fill="currentColor" />
            </Floating3DObject>
          </motion.div>

          <div className="text-center mt-16 px-6">
            <h1 className="text-8xl md:text-[8vw] font-black italic tracking-tighter leading-[0.8] mb-6">
              MUDASSIR <span className="text-transparent stroke-cyan-500 stroke-2" style={{ WebkitTextStroke: '2px #06b6d4' }}>MORADI</span>
            </h1>
            <p className="text-cyan-500 font-bold tracking-[0.6em] text-lg uppercase mt-4">Social Media Manager</p>
            
            {/* Social Links Bar */}
            <div className="flex justify-center gap-6 mt-12">
              {socialLinks.map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href} 
                  target="_blank"
                  className="group relative w-16 h-16 flex items-center justify-center rounded-3xl bg-white/[0.03] border border-white/10 text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-all duration-500 backdrop-blur-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- BIO & ACADEMIC --- */}
        <section className="py-20 container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="p-12 rounded-[4rem] bg-black/60 border border-white/5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <h3 className="text-4xl font-black italic mb-8 uppercase text-white">The Digital Mastermind</h3>
                <p className="text-gray-400 text-xl leading-[2.2] text-justify font-light italic">
                  Known professionally as **"Sultan"** and born in Jawzjan Province on **April 5, 2000**, Mudassir is an absolute powerhouse in the digital realm. As an Information Technology graduate, he has successfully cracked the code to internet algorithms, monetizing dozens of YouTube channels. From TikTok to Facebook, if it exists on the internet, Sultan knows the system.
                </p>
                <div className="mt-12 flex items-center gap-6 p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 italic text-cyan-100/80">
                  "Mastering the internet ecosystem isn't just about code; it's about understanding the pulse of digital connectivity."
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="p-10 rounded-[3.5rem] bg-gradient-to-br from-cyan-600/20 to-black/60 backdrop-blur-2xl border border-cyan-500/20">
                <Cpu className="text-cyan-500 mb-6" size={40} />
                <h4 className="text-2xl font-black italic uppercase mb-2">Academic Foundation</h4>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  B.Sc. in Computer Science <br/>
                  <span className="text-cyan-400 font-mono tracking-widest uppercase text-[10px]">Major: Information Technology (IT)</span>
                </p>
                <div className="h-[1px] w-full bg-white/10 my-4" />
                <p className="text-gray-400 text-sm leading-relaxed">
                  Safiullah Afzali High School (1396) <br/>
                  <span className="text-cyan-400 font-mono tracking-widest uppercase text-[10px]">Early Education</span>
                </p>
              </div>

              <div className="p-10 rounded-[3.5rem] bg-black/60 backdrop-blur-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
                 <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 mb-1">Birth & Origin</p>
                    <p className="text-lg font-bold">Jawzjan Province</p>
                 </div>
                 <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                    <MapPin size={20} />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- GLOBAL STRATEGY / DIGITAL ARSENAL --- */}
        <section className="py-24 bg-cyan-500/[0.02]">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
               <h3 className="text-4xl font-black italic uppercase text-white mb-4">Digital <span className="text-cyan-500">Arsenal</span></h3>
               <p className="text-gray-400 uppercase tracking-widest text-sm">Core Technical Competencies</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: <MonitorPlay size={40} />, title: "Content Monetization", desc: "Expertise in YouTube monetization, generating sustainable revenue across global media networks." },
                { icon: <Target size={40} />, title: "Algorithmic Mastery", desc: "Deep understanding of Meta, Facebook, and TikTok growth systems and social analytics." },
                { icon: <Globe size={40} />, title: "Internet Ecosystems", desc: "Solid IT foundation in networking, digital infrastructure, and digital marketing." }
              ].map((pill, i) => (
                <div key={i} className="p-12 rounded-[3.5rem] bg-black/80 backdrop-blur-xl border border-white/5 group hover:border-cyan-500/40 transition-all duration-700 shadow-xl">
                  <div className="text-cyan-500 mb-8 group-hover:scale-110 transition-transform">{pill.icon}</div>
                  <h4 className="text-2xl font-black italic uppercase mb-4 tracking-tighter">{pill.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{pill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
          <p className="text-gray-600 text-[10px] uppercase font-black tracking-[1em] mb-8">
            Mudassir Moradi • Social Media Manager • 2026
          </p>
          <div className="flex justify-center gap-8">
             {socialLinks.map((social, i) => (
               <Link key={i} href={social.href} target="_blank" className="text-gray-500 hover:text-cyan-500 transition-colors">
                  {social.icon}
               </Link>
             ))}
          </div>
        </footer>
      </div>
    </div>
  );
}