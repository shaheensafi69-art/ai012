"use client";
import { motion } from 'framer-motion';
import { Play, Sparkles, Users, Zap, Camera, Wand2, Mic, Film, Globe2 } from 'lucide-react';
import Navbar from '../components/Navbar';

// ==========================================
// دیتای سیارات واقعی منظومه شمسی برای رندر خودکار
// ==========================================
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

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden perspective-1000">
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND (PERFECT CENTER FIXED)
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* نقطه ثقل مرکزی (دقیقاً در وسط مانیتور) */}
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* 1. THE BURNING SUN (خورشید) */}
          {/* هاله‌های نور */}
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-[#ff7b00]/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-[#ffdd00]/15 rounded-full blur-[100px]" />
          
          {/* بدنه اصلی خورشید */}
          <motion.div 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #ffdd00 20%, #ff5e00 60%, #cc0000 90%)',
              boxShadow: '0 0 80px #ff5e00, 0 0 150px #ffdd00, inset -10px -10px 30px rgba(150,0,0,0.8)'
            }}
          >
            {/* بافت چرخشی سطح خورشید */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full mix-blend-overlay opacity-60" 
              style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} 
            />
          </motion.div>

          {/* 2. THE PLANETS (سیارات حول مرکز دقیق) */}
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
                {/* حلقه زحل */}
                {planet.hasRing && (
                  <div className="absolute top-1/2 left-1/2 w-[220%] h-[30%] border-[3px] border-[#ead6b8]/50 rounded-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[20deg] shadow-[0_0_10px_rgba(234,214,184,0.3)]" />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* ذرات ستاره‌ای در پس‌زمینه */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '120px 120px', opacity: 0.15 }}></div>
      </div>
      {/* ========================================== */}

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-24 px-6 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* نشانگر */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#D4AF37]/40 mb-8 shadow-[0_0_25px_rgba(212,175,55,0.2)]">
            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              Powered by Advanced SkyReels AI
            </span>
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-black mb-8 tracking-tighter leading-[1.05] text-white drop-shadow-2xl">
            Control the Universe of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8D6] via-[#D4AF37] to-[#8B6914] drop-shadow-[0_0_60px_rgba(212,175,55,0.7)]">
              Video Creation
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed font-light drop-shadow-md bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
            SAFI AI Studio integrates the world's most powerful neural rendering engines. From single-image lifelike avatars to complex multi-actor scenes with segmented camera tracking and flawless audio-visual lip synchronization. Welcome to the new era of cinematic production.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 40px 0px rgba(212,175,55,0.7)" }}
              whileTap={{ scale: 0.95 }}
              href="/dashboard"
              className="px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8942E] text-black rounded-full font-extrabold text-lg flex items-center gap-3 transition-all"
            >
              <Play className="fill-black w-6 h-6" />
              Launch AI Workspace
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Deep Features Grid (Rich Content & Glassmorphism) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            Architectural <span className="text-[#D4AF37]">Excellence</span>
          </h2>
          <p className="text-[#D4AF37]/80 text-lg font-medium">Uncompromising quality for enterprise and professional creators.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="w-8 h-8 text-[#D4AF37]" />,
              title: "Multi-Actor Avatar Generation",
              subtitle: "Beyond Single Characters",
              desc: "Upload a single reference image to generate hyper-realistic digital humans. Our engine supports complex multi-actor environments, allowing seamless interaction between multiple AI avatars with distinct emotional expressions and micro-movements."
            },
            {
              icon: <Camera className="w-8 h-8 text-[#D4AF37]" />,
              title: "Segmented Camera Tracking",
              subtitle: "Full Director Control",
              desc: "Don't just generate video; direct it. Define precise panning, zooming, and tracking shots. Use segmented motion controls to dictate exactly how the virtual camera moves through your generated 3D or 2D scenes in flawless 1080p."
            },
            {
              icon: <Mic className="w-8 h-8 text-[#D4AF37]" />,
              title: "Absolute Lip-Sync Precision",
              subtitle: "Frame-Perfect Audio Mapping",
              desc: "Provide any voiceover track, and our neural engine maps phonemes to facial muscle movements with sub-millisecond accuracy. The result is a biologically natural lip-sync that eliminates the uncanny valley, rendering at 1 credit per second."
            },
            {
              icon: <Film className="w-8 h-8 text-[#D4AF37]" />,
              title: "Intelligent Video Extension",
              subtitle: "Context-Aware Continuation",
              desc: "Need your footage to last longer? The V3 contextual engine analyzes the physics, lighting, and motion of your uploaded or generated clips and seamlessly hallucinates realistic extensions without breaking spatial continuity."
            },
            {
              icon: <Wand2 className="w-8 h-8 text-[#D4AF37]" />,
              title: "Cinematic Restyling & Reference",
              subtitle: "Style Transfer V4",
              desc: "Upload a rough sketch, a basic 3D render, or a raw video, and apply global style prompts to completely transform its aesthetic. Use structural reference modes to maintain the original composition while rendering in entirely new artistic directions."
            },
            {
              icon: <Zap className="w-8 h-8 text-[#D4AF37]" />,
              title: "High-Frequency Rendering",
              subtitle: "Fast vs. Standard Pipelines",
              desc: "Optimize your workflow. Choose 'V4 Fast' for rapid storyboarding and ideation with incredibly low latency, or switch to 'V4 Standard' when you need maximum atmospheric fidelity, complex lighting calculation, and up to 62.5 FPS cloud output."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ 
                y: -10,
                boxShadow: "0px 25px 50px rgba(0,0,0,0.9), inset 0px 0px 30px rgba(212,175,55,0.15)"
              }}
              // باکس‌های شیشه‌ای، مات و بسیار لوکس
              className="relative overflow-hidden bg-[#0A0A0A]/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-[#D4AF37]/20 hover:border-[#D4AF37]/70 transition-all duration-500 group flex flex-col h-full"
            >
              {/* نویز پس‌زمینه داخل باکس برای جلوگیری از خستگی چشم */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
              
              {/* افکت نوری در هاور */}
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent group-hover:animate-shimmer" />
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="bg-black/80 border border-[#D4AF37]/40 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.25)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {feature.icon}
                </div>
                <Globe2 className="w-6 h-6 text-white/10 group-hover:text-[#D4AF37]/30 transition-colors" />
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
              
              {/* خط نوری زیر باکس */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Bottom Glow Horizon */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/80 to-transparent mt-12 shadow-[0_0_40px_rgba(212,175,55,1)] relative z-10"></div>
    </main>
  );
}