"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Sparkles, Send } from 'lucide-react';
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

// ============================================================================
// CONTACT METHODS DATA (Updated)
// ============================================================================
const CONTACT_METHODS = [
  { title: "WhatsApp", value: "+44 7000 000000", icon: <MessageCircle className="w-6 h-6 text-[#FAD961]" />, href: "https://wa.me/447000000000", delay: 0.1 },
  { title: "Direct Call", value: "+44 20 7946 0958", icon: <Phone className="w-6 h-6 text-[#FAD961]" />, href: "tel:+442079460958", delay: 0.2 },
  { title: "Email Us", value: "support@safi-ai.com", icon: <Mail className="w-6 h-6 text-[#FAD961]" />, href: "mailto:support@safi-ai.com", delay: 0.3 }
];

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // TELEGRAM BOT INTEGRATION CONFIGURATION
  // ============================================================================
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN; 
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      alert("Telegram configuration is missing in .env file.");
      setIsSubmitting(false);
      return;
    }

    const messageText = `
🌟 <b>New Message from Safi AI Studio</b> 🌟

👤 <b>Name:</b> ${formState.name}
📧 <b>Email:</b> ${formState.email}

📝 <b>Message:</b>
${formState.message}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });

      if (response.ok) {
        setFormState({ name: '', email: '', message: '' });
        alert('Message sent successfully! We will contact you soon.');
      } else {
        alert('Failed to send message. Please try again or use direct contact methods.');
      }
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden pb-24">
      
      {/* ==========================================
          REALISTIC 3D SOLAR SYSTEM BACKGROUND
      ========================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          
          {/* THE BURNING SUN */}
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

          {/* THE PLANETS */}
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
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '120px 120px', opacity: 0.15 }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40">
        
        {/* ==========================================
            HEADER SECTION
        ========================================== */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#FAD961]/40 mb-8 shadow-[0_0_25px_rgba(250,217,97,0.2)]"
          >
            <Sparkles className="w-4 h-4 text-[#FAD961] animate-pulse" />
            <span className="text-xs font-bold tracking-[0.2em] text-[#FAD961] uppercase">Global Support</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-8 tracking-tighter drop-shadow-2xl"
          >
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#FAD961] to-[#D4AF37] drop-shadow-[0_0_40px_rgba(250,217,97,0.5)]">Connect</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl font-light leading-relaxed bg-black/40 p-4 rounded-2xl backdrop-blur-sm border border-white/5 drop-shadow-md"
          >
            Whether you have a question about our AI engines, enterprise pricing, or need technical support, our team is ready to assist you worldwide.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* ==========================================
              LEFT SIDE: CONTACT CARDS
          ========================================== */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {CONTACT_METHODS.map((method, idx) => (
              <motion.a
                href={method.href}
                target={method.href.startsWith('http') ? "_blank" : undefined}
                rel="noopener noreferrer"
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: method.delay }}
                whileHover={{ x: 10, backgroundColor: "rgba(250,217,97,0.08)", borderColor: "rgba(250,217,97,0.4)" }}
                className="flex items-center gap-6 p-5 rounded-2xl bg-[#0A0A0A]/70 backdrop-blur-2xl border border-[#FAD961]/10 transition-all duration-300 group shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="w-14 h-14 rounded-xl bg-black/80 border border-[#FAD961]/30 flex items-center justify-center shadow-[0_0_20px_rgba(250,217,97,0.15)] group-hover:scale-110 group-hover:border-[#FAD961] transition-all duration-300">
                  {method.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-1 tracking-widest uppercase">{method.title}</p>
                  <p className="text-lg font-black text-white group-hover:text-[#FAD961] transition-colors drop-shadow-md">{method.value}</p>
                </div>
              </motion.a>
            ))}

            {/* Corporate Address Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 p-8 rounded-3xl bg-[#0A0A0A]/80 backdrop-blur-3xl border border-[#FAD961]/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-[#FAD961]/50 transition-colors"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FAD961]/10 rounded-full blur-[50px] translate-x-1/3 -translate-y-1/3 group-hover:bg-[#FAD961]/20 transition-colors duration-500" />
              <MapPin className="w-10 h-10 text-[#FAD961] mb-6 drop-shadow-[0_0_15px_rgba(250,217,97,0.5)]" />
              <h3 className="text-white font-black text-xl mb-3 tracking-wide">Headquarters</h3>
              <p className="text-gray-300 text-sm leading-relaxed font-light">
                <strong className="text-[#FAD961] font-bold text-base tracking-wide block mb-1">Safi International Capital LTD</strong>
                71-75 Shelton Street, Covent Garden<br />
                London, United Kingdom<br />
                <span className="inline-block mt-3 bg-white/10 px-3 py-1 rounded-md text-white font-mono text-xs border border-white/10">Company No: 17063286</span>
              </p>
            </motion.div>
          </div>

          {/* ==========================================
              RIGHT SIDE: LUXURY CONTACT FORM
          ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-3 h-full"
          >
            <div className="h-full bg-[#0A0A0A]/75 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-[#FAD961]/20 relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] hover:border-[#FAD961]/40 transition-colors duration-500">
              
              {/* Form Glow */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80 shadow-[0_0_20px_rgba(250,217,97,1)]" />
              <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-[#FAD961]/5 to-transparent pointer-events-none" />

              <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg">Send us a Message</h2>
              <p className="text-gray-400 font-light mb-12 text-lg">Fill out the form below and our VIP support team will respond shortly.</p>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Name Input */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#FAD961] tracking-[0.2em] uppercase ml-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                      className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all shadow-inner text-lg font-light"
                      placeholder="John Doe"
                    />
                  </div>
                  {/* Email Input */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#FAD961] tracking-[0.2em] uppercase ml-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                      className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all shadow-inner text-lg font-light"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-[#FAD961] tracking-[0.2em] uppercase ml-2">Your Message</label>
                  <textarea 
                    required
                    rows={6}
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                    className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all resize-none shadow-inner text-lg font-light leading-relaxed"
                    placeholder="How can we help you today?"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black font-black tracking-[0.2em] uppercase py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(250,217,97,0.6)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm mt-4"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}