"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Users, Zap, Camera, Wand2, Mic, Film, Globe2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TechBackground from '../components/TechBackground';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030305] text-white overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="default" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-28 px-6 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Official Technology Badge */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-[#0A0A0E]/90 backdrop-blur-xl border border-[#D4AF37]/35 mb-8 shadow-[0_0_25px_rgba(212,175,55,0.18)]">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              Powered by Google AI Studio & Gemini Enterprise
            </span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black mb-8 tracking-tighter leading-[1.05] text-white drop-shadow-2xl">
            Control the Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8D6] via-[#D4AF37] to-[#8B6914] drop-shadow-[0_0_60px_rgba(212,175,55,0.6)]">
              Artificial Intelligence
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed font-light drop-shadow-md bg-black/40 p-6 rounded-3xl backdrop-blur-md border border-white/10">
            SAFI AI Studio unites Google AI Studio Gemini intelligence with next-generation cinematic video, photorealistic neural rendering, and enterprise code architectures. Designed for visionary creators, global institutions, and modern enterprises.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0px 0px 40px 0px rgba(212,175,55,0.6)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/dashboard"
                className="px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8942E] text-black rounded-full font-extrabold text-lg flex items-center gap-3 transition-all shadow-xl"
              >
                <Play className="fill-black w-5 h-5" />
                Launch AI Studio Workspace
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/about"
                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold text-lg flex items-center gap-2 border border-white/10 backdrop-blur-md transition-all"
              >
                Meet Executive Board <ArrowRight className="w-5 h-5 text-[#D4AF37]" />
              </Link>
            </motion.div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-8 border-t border-white/10 text-center">
            <div>
              <div className="text-3xl font-black text-white">Gemini 2.5</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Core Architecture</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#D4AF37]">Imagen 3</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Photorealistic Vision</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">150+</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Countries Connected</div>
            </div>
            <div>
              <div className="text-3xl font-black text-[#D4AF37]">Enterprise</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Bank-Grade Security</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Deep Features Grid (Rich Content & Glassmorphism) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-4">
            Industrial Neural Suite
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            Architectural <span className="text-[#D4AF37]">Excellence</span>
          </h2>
          <p className="text-gray-400 text-lg font-medium">Uncompromising standards for enterprise and professional creators.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="w-8 h-8 text-[#D4AF37]" />,
              title: "Multi-Actor Avatar Generation",
              subtitle: "Beyond Single Characters",
              desc: "Upload reference inputs to synthesize ultra-realistic digital humans. Our engine supports multi-actor environments, allowing seamless interaction between multiple AI avatars with distinct emotional expressions."
            },
            {
              icon: <Camera className="w-8 h-8 text-[#D4AF37]" />,
              title: "Segmented Camera Tracking",
              subtitle: "Full Director Control",
              desc: "Direct every frame. Define precise panning, zooming, and tracking shots. Use segmented motion controls to dictate exactly how the virtual camera moves through your scenes in flawless high definition."
            },
            {
              icon: <Mic className="w-8 h-8 text-[#D4AF37]" />,
              title: "Absolute Lip-Sync Precision",
              subtitle: "Frame-Perfect Audio Mapping",
              desc: "Provide any voiceover track, and our neural engine maps phonemes to facial muscle movements with sub-millisecond accuracy. The result is biologically natural lip-sync that eliminates the uncanny valley."
            },
            {
              icon: <Film className="w-8 h-8 text-[#D4AF37]" />,
              title: "Intelligent Video Extension",
              subtitle: "Context-Aware Continuation",
              desc: "Need your footage to last longer? The contextual engine analyzes the physics, lighting, and motion of your clips and seamlessly extrapolates realistic extensions without breaking spatial continuity."
            },
            {
              icon: <Wand2 className="w-8 h-8 text-[#D4AF37]" />,
              title: "Google Imagen 3 Rendering",
              subtitle: "Ultra High-Resolution Studio",
              desc: "Generate master-grade images with state-of-the-art prompt fidelity, photorealistic textures, HDR volumetric lighting, and precise aspect ratio control directly via Google AI Studio."
            },
            {
              icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
              title: "Gemini Neural Code & Reasoning",
              subtitle: "Enterprise Intelligence",
              desc: "Full-stack software architecture, algorithmic modeling, and real-time grounded search powered by Google Gemini, delivering high-speed structured insight and execution."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              whileHover={{ 
                y: -8,
                boxShadow: "0px 25px 50px rgba(0,0,0,0.8), inset 0px 0px 30px rgba(212,175,55,0.12)"
              }}
              className="relative overflow-hidden bg-[#0A0A0E]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 group flex flex-col h-full shadow-2xl"
            >
              {/* Card Hover Glow */}
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent group-hover:animate-shimmer pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="bg-black/90 border border-[#D4AF37]/30 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.2)] group-hover:scale-105 group-hover:border-[#D4AF37] transition-all duration-300">
                  {feature.icon}
                </div>
                <Globe2 className="w-6 h-6 text-white/20 group-hover:text-[#D4AF37]/60 transition-colors" />
              </div>

              <div className="relative z-10 flex-grow">
                <p className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-2">{feature.subtitle}</p>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light text-sm md:text-base text-justify">
                  {feature.desc}
                </p>
              </div>
              
              {/* Bottom decorative bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}