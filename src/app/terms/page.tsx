"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TechBackground from '@/components/TechBackground';

export default function TermsOfServicePage() {
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
      <Footer />
    </main>
  );
}