'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, GraduationCap, 
  Award, BookOpen, Cpu, Gamepad2, Lightbulb,
  Code2, Server, BarChart3, Binary, User,
  Database, Layout, Languages, Briefcase, Mail, MapPin,
  MessageCircle, PenTool, HardDrive, ScrollText
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';

import TechBackground from '@/components/TechBackground';

// --- Custom Brand Icons (SVGs) ---
const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// --- 3D Floating Objects Component ---
const Floating3DObject = ({ children, x, y, translateZ, rotate, colorClass }: any) => (
  <motion.div
    style={{ x, y, translateZ, rotateZ: rotate, transformStyle: "preserve-3d" }}
    className={`absolute z-20 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ${colorClass}`}
  >
    {children}
  </motion.div>
);

export default function HusnafarBio() {
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

  // Social Links
  const mySocials = [
    { icon: <LinkedinIcon size={20} />, href: "https://www.linkedin.com/in/husnafar-shadab-zafer-8787b1325/" },
    { icon: <Mail size={20} />, href: "mailto:husnafar@saficapital.com" }, // می‌توانید ایمیل واقعی را جایگزین کنید
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-20 font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white" dir="ltr" onMouseMove={handleMouseMove}>
      
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="purple" />


      <div className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section ref={containerRef} className="relative pt-32 pb-20 flex flex-col items-center">
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="relative">
            <div className="relative w-64 h-64 md:w-80 md:h-80 z-10">
              <div className="absolute inset-0 bg-purple-500/30 blur-[100px] rounded-full opacity-50" />
              <div className="relative h-full w-full rounded-[4rem] overflow-hidden border-2 border-purple-500/30 p-2 bg-[#050505]">
                <Image src="/Husnafar Shadab Zafer.jpeg" alt="Husnafar Shadab Zafer" fill className="object-cover rounded-[3.5rem]" priority />
              </div>
            </div>

            {/* Floating 3D Icons */}
            <Floating3DObject x={moveX} y={moveY} translateZ={120} rotate="10deg" colorClass="text-purple-500">
              <Database size={30} />
            </Floating3DObject>
            <motion.div style={{ x: moveY, y: moveX, translateZ: 180 }} className="absolute -right-16 top-10">
                <div className="bg-purple-600 text-white p-4 rounded-3xl shadow-2xl font-black">DATA EXPERT</div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12 px-6">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">HUSNAFAR SHADAB <span className="text-purple-500">ZAFER</span></h1>
            <p className="text-purple-400 font-bold tracking-[0.3em] text-lg mt-4 uppercase">Head of Database Management</p>
            
            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-8">
              {mySocials.map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href} 
                  target="_blank"
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all duration-300 shadow-xl backdrop-blur-md"
                >
                  {social.icon}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-gray-500 text-sm font-semibold">
               <span className="flex items-center gap-2"><Briefcase size={16}/> Management & Business Major</span>
               <span className="flex items-center gap-2"><Award size={16}/> 36 Professional Certifications</span>
            </div>
          </motion.div>
        </section>

        {/* --- ABOUT ME --- */}
        <section className="py-20 container mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-[#080808]/80 backdrop-blur-xl border border-white/5 p-10 md:p-16 rounded-[4rem] shadow-2xl">
            <h2 className="text-4xl font-black mb-10 border-l-8 border-purple-500 pl-6">About Me</h2>
            <div className="space-y-8 text-gray-300 text-xl leading-[2.3] text-justify font-light">
              <p>
                I am Husnafar Shadab Zafer, currently serving as the Head of Database Management at Safi International Capital LTD. My expertise lies in structuring, organizing, and securing complex data ecosystems to ensure seamless corporate operations.
              </p>
              <p>
                Having completed high school in 2022, I am currently pursuing higher education in <span className="text-white font-bold underline decoration-purple-500">Management and Business</span>. My passion for continuous learning has led me to acquire <strong className="text-purple-400">36 professional certifications</strong> across various disciplines, proving my dedication to personal and professional growth.
              </p>
              <div className="bg-purple-500/10 p-8 rounded-[2.5rem] italic border-l-8 border-purple-500 text-purple-100">
                "Data is the foundation of modern business. My goal is to ensure that our organizational infrastructure remains robust, secure, and perfectly optimized for future scalability."
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- SKILLS GRID --- */}
        <section className="py-20 bg-purple-500/[0.02]">
          <div className="container mx-auto max-w-6xl px-6">
            <h2 className="text-center text-4xl font-black mb-20 italic">Professional Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-purple-500/40 transition-all group">
                <Database className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Database Mgmt</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Expertise in Data Entry, Database Structuring, Information Security, and Record Maintenance.</p>
              </div>

              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-purple-500/40 transition-all group">
                <Briefcase className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Business & Admin</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Currently majoring in Management & Business. Strong foundation in administrative operations.</p>
              </div>

              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-purple-500/40 transition-all group">
                <PenTool className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Computer & Design</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Proficient in Office Packages (Word, Excel, PowerPoint) and professional Graphic Design software.</p>
              </div>

              <div className="p-8 bg-black/60 backdrop-blur-lg border border-white/5 rounded-[3rem] hover:border-purple-500/40 transition-all group">
                <Award className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                <h3 className="text-xl font-bold mb-4">Certified Pro</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono">Holder of 36 distinct certifications validating skills in IT, management, and technical fields.</p>
              </div>

            </div>
          </div>
        </section>

        {/* --- EXPERIENCE & EDUCATION --- */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12">
            
            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><HardDrive className="text-purple-500"/> Work Experience</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-purple-500 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Head of Database Management</h4>
                  <p className="text-purple-400 text-sm mb-2">Safi International Capital LTD (Present)</p>
                  <p className="text-gray-500 text-sm">Managing the core data infrastructure, overseeing secure data entry protocols, and maintaining digital archives for the corporate ecosystem.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Computer & Design Specialist</h4>
                  <p className="text-purple-400 text-sm mb-2">Freelance & Academic Projects</p>
                  <p className="text-gray-500 text-sm">Utilizing advanced Office Packages and Design software for corporate presentations, reports, and visual asset creation.</p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <h2 className="text-3xl font-black flex items-center gap-4 italic"><GraduationCap className="text-purple-500"/> Education & Accolades</h2>
              <div className="space-y-8 border-l-2 border-white/10 pl-8">
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-purple-500 rounded-full" />
                  <h4 className="text-xl font-bold text-white">Management & Business (Ongoing)</h4>
                  <p className="text-purple-400 text-sm">University Student</p>
                  <p className="text-gray-500 text-sm mt-1">Pursuing higher education focused on organizational management, corporate strategy, and modern business operations.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 bg-white/20 rounded-full" />
                  <h4 className="text-xl font-bold text-white">High School Graduate</h4>
                  <p className="text-purple-400 text-sm">Class of 2022</p>
                </div>
              </div>
              <div className="pt-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Languages size={20} className="text-purple-500"/> Language Proficiency</h3>
                <div className="flex flex-wrap gap-4">
                  {['English', 'Persian (Farsi)'].map(lang => (
                    <span key={lang} className="px-5 py-2 bg-white/5 rounded-xl border border-white/10 text-sm font-bold text-purple-100 tracking-wider">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ACHIEVEMENTS --- */}
        <section className="py-20 container mx-auto max-w-4xl px-6 text-center">
           <div className="bg-gradient-to-br from-purple-500/20 to-transparent p-12 rounded-[4rem] border border-purple-500/20 backdrop-blur-md">
              <ScrollText className="text-purple-500 mx-auto mb-6" size={60} />
              <h2 className="text-3xl font-black mb-6">Core Competencies</h2>
              <ul className="text-gray-300 space-y-4 text-lg text-left inline-block">
                <li>• Certified Expert: <strong className="text-white">36 Professional Certificates</strong> achieved</li>
                <li>• Fluent in <strong className="text-white">English and Farsi</strong> for seamless communication</li>
                <li>• Specialist in <strong className="text-white">Data Entry & Database Management</strong></li>
                <li>• High proficiency in <strong className="text-white">Computer Design & Office Packages</strong></li>
              </ul>
           </div>
        </section>

        <footer className="py-20 text-center">
          <div className="flex justify-center gap-6 mb-8">
            {mySocials.map((social, idx) => (
              <Link key={idx} href={social.href} target="_blank" className="text-gray-600 hover:text-purple-500 transition-colors">
                {social.icon}
              </Link>
            ))}
          </div>
          <p className="opacity-30 text-xs tracking-[0.5em] uppercase">
            Husnafar Shadab Zafer • Professional Portfolio • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}