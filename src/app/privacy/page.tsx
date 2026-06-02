"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Navbar from '../../components/Navbar';
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

export default function PrivacyPolicyPage() {
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
              <Lock className="w-6 h-6 text-[#FAD961]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">Privacy Policy</h1>
              <p className="text-[#FAD961] text-sm tracking-widest uppercase mt-2">Effective Date: May 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-300 font-light leading-relaxed text-justify">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-3">When you register for an account at Safi AI, operated by <strong>Safi International Capital LTD</strong>, we collect personal information that you voluntarily provide to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Identity Data: First Name, Last Name, Date of Birth.</li>
                <li>Contact Data: Email address, Phone number.</li>
                <li>Location Data: Country of residence.</li>
                <li>AI Processing Data: Texts, scripts, and images you upload for AI generation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p>
                We process your information for purposes based on legitimate business interests, the fulfillment of our contract with you, and compliance with our legal obligations. Your data is primarily used to provide our AI rendering services, process payments securely via global gateways, and maintain the security of our platform. We <strong>do not</strong> sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. AI Data Processing & Storage</h2>
              <p>
                Inputs provided to our Artificial Intelligence engines (such as photos or voice samples) are processed securely in cloud environments. We implement strict data isolation protocols. We do not use your private user-generated content to train public AI models without your explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. GDPR & Data Security</h2>
              <p>
                As a UK-registered company, we comply with the General Data Protection Regulation (GDPR). We use high-end encryption (AES-256) to protect your authentication credentials and personal data. You have the right to request access to, correction of, or deletion of your personal data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, you may email our Data Protection Officer at: <br/><br/>
                <strong className="text-white">Safi International Capital LTD</strong><br/>
                71-75 Shelton Street, Covent Garden<br/>
                London, United Kingdom<br/>
                Email: <a href="mailto:support@safi-ai.com" className="text-[#FAD961] hover:underline">support@safi-ai.com</a>
              </p>
            </section>
            
          </div>
        </motion.div>
      </div>
    </main>
  );
}