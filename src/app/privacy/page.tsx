"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TechBackground from '@/components/TechBackground';

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      {/* Sleek, executive enterprise tech background */}
      <TechBackground variant="default" />

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
      <Footer />
    </main>
  );
}