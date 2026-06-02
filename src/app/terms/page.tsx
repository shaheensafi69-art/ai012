"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar';// مسیر نوبار را چک کن

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

export default function TermsOfServicePage() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-0 h-0 opacity-40">
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-[#ff7b00]/10 rounded-full blur-[200px]" />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full mix-blend-overlay opacity-60" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} />
          {SOLAR_SYSTEM.map((planet) => (
            <motion.div key={planet.name} animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute border border-white/[0.03] rounded-full" style={{ width: planet.orbit, height: planet.orbit, left: -(planet.orbit / 2), top: -(planet.orbit / 2), transformStyle: 'preserve-3d' }}>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-1/2 rounded-full" style={{ width: planet.size, height: planet.size, background: planet.gradient, marginLeft: -(planet.size / 2), marginTop: -(planet.size / 2) }} />
            </motion.div>
          ))}
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 pt-40">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-[#FAD961] transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
            <div className="w-12 h-12 bg-black border border-[#FAD961]/40 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#FAD961]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Terms of Service</h1>
              <p className="text-[#FAD961] text-sm tracking-widest uppercase mt-2">Last Updated: May 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 font-light leading-relaxed text-justify">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and <strong>Safi International Capital LTD</strong> (Company No: 17063286), registered at 71-75 Shelton Street, Covent Garden, London, United Kingdom ("Company", "we", "us", or "our"), concerning your access to and use of the Safi AI website and application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Artificial Intelligence Usage Rules</h2>
              <p className="mb-3">By using our AI video generation and avatar rendering services, you agree that you will NOT use the platform to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Generate deepfakes or non-consensual realistic imagery of real persons without explicit permission.</li>
                <li>Create content that promotes hate speech, violence, or illegal activities.</li>
                <li>Infringe upon the intellectual property rights of third parties.</li>
                <li>Bypass or attempt to reverse-engineer our AI models and credit systems.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Intellectual Property Rights</h2>
              <p>
                You retain all ownership rights to the original text, scripts, and base images you upload to Safi AI. However, by processing data through our platform, you grant us a temporary license to host and process that data. The resulting AI-generated output belongs to you, provided your account is in good standing and you have not violated these terms. Safi International Capital LTD retains all rights to the underlying AI engines and software architecture.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscriptions and AI Credits</h2>
              <p>
                Access to premium AI features requires the purchase of monthly subscriptions or credit packs. All payments are processed securely. Due to the high computational costs of AI rendering, credits consumed for video generation are strictly <strong>non-refundable</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Governing Law</h2>
              <p>
                These Terms shall be governed by and defined following the laws of the United Kingdom. Safi International Capital LTD and yourself irrevocably consent that the courts of England and Wales shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
              </p>
            </section>
            
            <p className="pt-8 border-t border-white/10 text-sm text-gray-500">
              For any legal inquiries, please contact us at <a href="mailto:support@safi-ai.com" className="text-[#FAD961] hover:underline">support@safi-ai.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}