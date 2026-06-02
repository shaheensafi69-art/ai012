'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, GraduationCap, 
  Award, BookOpen, Cpu, Gamepad2, Lightbulb,
  Code2, Server, BarChart3, Binary, User,
  Database, Layout, Languages, Briefcase, Mail, MapPin,
  MessageCircle 
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

// --- Custom Brand Icons (SVGs) ---
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
    className="absolute z-20 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-amber-500"
  >
    {children}
  </motion.div>
);

export default function ShaheenSafiFullExpertBio() {
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

  // Social Links updated to use the custom SVG icons
  const mySocials = [
    { icon: <LinkedinIcon size={20} />, href: "https://www.linkedin.com/in/shaheen-safi-b73a30299" },
    { icon: <InstagramIcon size={20} />, href: "https://www.instagram.com/top_g_official1" },
    { icon: <FacebookIcon size={20} />, href: "https://www.facebook.com/share/1H1vuV1i9Z/" },
    { icon: <TikTokIcon size={20} />, href: "https://www.tiktok.com/@safi_sahib6" },
    { icon: <MessageCircle size={20} />, href: "https://Wa.me/+19342032497" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-20 font-sans overflow-x-hidden selection:bg-amber-500 selection:text-black" dir="ltr" onMouseMove={handleMouseMove}>
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND (AMBER/GOLD THEME)
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* هاله ظریف کهربایی/طلایی روی کل صفحه برای تم شاهین */}
        <div className="absolute inset-0 bg-amber-900/5 mix-blend-screen z-10" />

        {/* نقطه ثقل صفر دقیقاً در مرکز مانیتور */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* 1. THE BURNING SUN */}
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
        <section ref={containerRef} className="relative pt-32 pb-20 flex flex-col items-center">
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 z-10">
              <div className="absolute inset-0 bg-amber-500/30 blur-[100px] rounded-full opacity-50" />
              <div className="relative h-full w-full rounded-[4rem] overflow-hidden border-2 border-amber-500/30 p-2 bg-[#050505]">
                <Image src="/shaheen.jpeg" alt="Shaheen Safi" fill className="object-cover rounded-[3.5rem]" priority />
              </div>
            </div>

            {/* Floating 3D Icons */}
            <Floating3DObject x={moveX} y={moveY} translateZ={120} rotate="10deg">
              <Code2 size={30} />
            </Floating3DObject>
            <motion.div style={{ x: moveY, y: moveX, translateZ: 180 }} className="absolute -right-16 top-10">
                <div className="bg-amber-500 text-black p-4 rounded-3xl shadow-2xl font-black">CEO</div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12 px-6">
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white">SHAHEEN <span className="text-amber-500">SAFI</span></h1>
            <p className="text-amber-500 font-bold tracking-[0.5em] text-xl mt-4 uppercase">SafiPay Founder & Computer Specialist</p>
            
            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-8">
              {mySocials.map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href} 
                  target="_blank"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all duration-300 shadow-xl backdrop-blur-md"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <div className="flex justify-center gap-6 mt-10 text-gray-500 text-sm">
               <span className="flex items-center gap-2"><MapPin size={16}/> Kabul, Afghanistan</span>
               <span className="flex items-center gap-2"><Mail size={16}/> ssafi9241@hotmail.com</span>
            </div>
          </motion.div>
        </section>

        {/* --- ABOUT ME --- */}
        <section className="py-20 container mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-[#080808]/80 backdrop-blur-xl border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-2xl">
            <h2 className="text-4xl font-black mb-10 border-l-8 border-amber-500 pl-6">About Me</h2>
            <div className="space-y-8 text-gray-300 text-xl leading-[2.3] text-justify font-light">
              <p>
                I am Shaheen Safi, a computer specialist, creative, energetic, and passionate about the world of technology and online business. With extensive experience in teaching computer science and managing IT systems, I have always sought to learn and develop innovative projects.
              </p>
              <p>
                I completed my specialized studies with a Bachelor of Computer Science at <span className="text-white font-bold underline decoration-amber-500">Istanbul Technical University (ITU)</span>, focusing on software architecture, network security, and FinTech systems.
              </p>
              <div className="bg-amber-500/10 p-8 rounded-[2.5rem] italic border-l-8 border-amber-500 text-amber-100">
                "My greatest professional milestone was founding and subsequently selling the SafiPro brand to focus all my energy and capital on creating SafiPay; a system designed to transform digital banking."
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- SKILLS GRID --- */}
        <section className="py-20 bg-amber-500/[0.02]">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="text-center text-4xl font-black mb-20 italic">Technical Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-amber-500/40 transition-all group">
                <Code2 className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Programming</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Python, Java, C++, JavaScript, HTML/CSS, PHP, C#, SQL, Node.js, React, Angular</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-amber-500/40 transition-all group">
                <Server className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Network & Security</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Routing & Switching, Firewall Management, VPN Configuration, Network Security, Cisco Devices, Mikrotik, Wireless Networking</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-amber-500/40 transition-all group">
                <Database className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Database Mgmt</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">MySQL, MongoDB, PostgreSQL, Microsoft SQL Server</p>
              </div>
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-amber-500/40 transition-all group">
                <Layout className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">E-Commerce & Design</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Amazon, Shopify, TikTok Shop, Trading, CorelDRAW, Premiere, After Effects</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- EXPERIENCE & EDUCATION --- */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><Briefcase className="text-amber-500"/> Work Experience</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b]" />
                  <h4 className="text-xl font-bold text-white">IT Specialist</h4>
                  <p className="text-amber-500 text-sm mb-2">Afghanistan Football Federation (2019-2024)</p>
                  <p className="text-gray-500 text-sm">1.5 years of experience managing IT systems and network infrastructure for the federation.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Computer Science Instructor</h4>
                  <p className="text-amber-500 text-sm mb-2">Various Educational Centers (2019-2024)</p>
                  <p className="text-gray-500 text-sm">3 years of experience in specialized IT teaching and training the next generation of specialists.</p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><GraduationCap className="text-amber-500"/> Education</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-amber-500 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Istanbul Technical University (ITU)</h4>
                  <p className="text-amber-500 text-sm">Bachelor of Computer Science (2019-2023)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Business & Marketing Management</h4>
                  <p className="text-amber-500 text-sm italic">Focused on e-commerce strategies and digital entrepreneurship.</p>
                </div>
              </div>
              <div className="pt-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Languages size={20} className="text-amber-500"/> Language Proficiency</h3>
                <div className="flex gap-4">
                  {['English', 'Dari', 'Pashto'].map(lang => (
                    <span key={lang} className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-bold">{lang}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ACHIEVEMENTS --- */}
        <section className="py-20 container mx-auto max-w-4xl px-6 text-center">
           <div className="bg-gradient-to-br from-amber-500/20 to-transparent p-12 rounded-[4rem] border border-amber-500/20 backdrop-blur-md">
              <Award className="text-amber-500 mx-auto mb-6" size={60} />
              <h2 className="text-3xl font-black mb-6">Honors & Certifications</h2>
              <ul className="text-gray-300 space-y-4 text-lg text-left inline-block">
                <li>• International Technical Analysis Certification from **IFTA**</li>
                <li>• Organizer of 20+ successful seminars on business and personal success</li>
                <li>• Founder of the innovative financial processing system **SafiPay**</li>
              </ul>
           </div>
        </section>

        <footer className="py-20 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-30" />
          <div className="flex justify-center gap-6 mb-8 mt-8">
            {mySocials.map((social, idx) => (
              <Link key={idx} href={social.href} target="_blank" className="text-gray-600 hover:text-amber-500 transition-colors">
                {social.icon}
              </Link>
            ))}
          </div>
          <p className="opacity-30 text-xs tracking-[0.5em] uppercase font-black">
            Shaheen Safi • Full Technical Portfolio • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}