'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Code2, Server, Terminal, Cpu, Database, 
  Layers, ShieldCheck, Zap, Globe, Sparkles, 
  Binary, Compass, ArrowLeft, GitBranch, Workflow
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';
import TechBackground from '@/components/TechBackground';

export default function MobinHasaniFullBio() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div 
      className="min-h-screen bg-[#030305] text-white pb-20 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black" 
      dir="ltr" 
      onMouseMove={handleMouseMove}
    >
      <TechBackground variant="cyan" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Executive Board
          </Link>
        </div>

        {/* Hero Section */}
        <div ref={containerRef} className="grid lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left: 3D Photo Display */}
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="lg:col-span-5 flex justify-center perspective-1000"
          >
            <div className="relative w-80 h-96 sm:w-96 sm:h-[480px] rounded-[2.5rem] p-3 bg-gradient-to-b from-cyan-500/20 via-white/5 to-transparent border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.25)] backdrop-blur-xl group">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                <Image 
                  src="/mobin.jpeg" 
                  alt="Mobin Hasani" 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                    Executive Leadership
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">Mobin Hasani</h2>
                  <p className="text-cyan-400 text-sm font-semibold">Lead Developer • Safi Ecosystem</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Biography & Title */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest">
              <Code2 className="w-4 h-4" /> Lead Developer & Core Architect
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none">
              MOBIN <span className="text-cyan-400">HASANI</span>
            </h1>

            <p className="text-xl text-gray-300 font-light leading-relaxed">
              Leading the software engineering departments and architectural vision across the entire Safi AI ecosystem. Spearheading core full-stack engineering, microservices pipelines, high-concurrency neural networking, and mission-critical cloud deployments.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Terminal className="w-6 h-6 text-cyan-400 mb-2" />
                <h4 className="text-white font-bold text-base">Full-Stack Lead</h4>
                <p className="text-gray-400 text-xs mt-1">Next.js, TypeScript, Cloud Native Architecture</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <Server className="w-6 h-6 text-cyan-400 mb-2" />
                <h4 className="text-white font-bold text-base">Engine Architecture</h4>
                <p className="text-gray-400 text-xs mt-1">AI pipelines, REST/gRPC & WebSocket microservices</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <GitBranch className="w-6 h-6 text-cyan-400 mb-2" />
                <h4 className="text-white font-bold text-base">Dev Team Leader</h4>
                <p className="text-gray-400 text-xs mt-1">Directing sprint cycles, QA, and security protocols</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Domain Details */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white">Engineering Leadership Scope</h2>
            <p className="text-gray-400 mt-2">Core pillars managed by Mobin Hasani within Safi International Capital LTD.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Code2 className="w-6 h-6 text-cyan-400" />,
                title: "Core Platform Development",
                desc: "Directing the production codebase of Safi AI, SafiPay, and Safi TopUp with strict architectural standards, automated CI/CD pipelines, and zero-downtime releases."
              },
              {
                icon: <Workflow className="w-6 h-6 text-cyan-400" />,
                title: "AI Integration Pipelines",
                desc: "Connecting enterprise model providers including Google AI Studio Gemini API, Google Imagen 3, and high-throughput vision/video models."
              },
              {
                icon: <Database className="w-6 h-6 text-cyan-400" />,
                title: "Distributed Data & Cache",
                desc: "Designing resilient schema structures, edge caching, and real-time database synchronizations across global user touchpoints."
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
                title: "Security & Code Integrity",
                desc: "Enforcing OWASP security compliance, strict authentication flows, API secret rotation, and server-side authorization checks."
              },
              {
                icon: <Cpu className="w-6 h-6 text-cyan-400" />,
                title: "Performance Optimization",
                desc: "Achieving sub-second TTFB, high Google Core Web Vitals scores, optimized asset delivery, and efficient serverless execution."
              },
              {
                icon: <Globe className="w-6 h-6 text-cyan-400" />,
                title: "Cross-Platform Ecosystem",
                desc: "Orchestrating synchronized user experiences across web dashboards, mobile applications, and payment gateways."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-[#0A0A0E]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
