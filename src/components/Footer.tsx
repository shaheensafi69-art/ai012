"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Mail, ShieldCheck, Globe, ChevronRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-transparent text-white overflow-hidden pt-16 z-10">
      
      {/* خط درخشان متالیک در بالای فوتر */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FAD961] to-transparent shadow-[0_0_40px_rgba(250,217,97,0.8)] opacity-80" />
      
      {/* هاله نوری گرم و جذاب در پس‌زمینه */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#FAD961]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* ستون اول: برند و توضیحات */}
          <div className="flex flex-col gap-6">
            
            {/* =========================================================
                بخش لوگوی بزرگ در فوتر
            ========================================================= */}
            <Link href="/" className="relative z-50 flex items-center group cursor-pointer mb-2">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                // سایز لوگو در اینجا بسیار بزرگ تنظیم شده است
                className="relative flex items-center h-24 md:h-28 w-auto"
              >
                <img 
                  src="/logo.png" 
                  alt="Safi AI Logo" 
                  className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(250,217,97,0.8)]"
                />
              </motion.div>
            </Link>
            {/* ========================================================= */}

            <p className="text-[15px] leading-relaxed font-light text-[#D1D1D1] text-justify drop-shadow-sm">
             The most advanced AI studio for cinematic content creation, hyper-realistic avatars, and flawless audio-visual synchronization.
            </p>
            <div className="flex gap-4 items-center mt-2">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <Link key={social} href="#" className="w-11 h-11 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-[#FAD961] hover:to-[#D4AF37] hover:border-transparent hover:text-black transition-all duration-300 shadow-lg">
                  <span className="text-xs font-bold tracking-wider">{social.substring(0, 2).toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ستون دوم: لینک‌های سریع (Platform) */}
          <div>
            <h3 className="text-white font-black text-xl mb-6 tracking-wide drop-shadow-md">Platform</h3>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'AI Studio Dashboard', href: '/dashboard' },
                { name: 'Explore Models & Services', href: '/services' },
                { name: 'Pricing & Plans', href: '/pricing' },
                { name: 'About The Team', href: '/about' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center text-[15px] font-medium text-[#B0B0B0] hover:text-[#FAD961] transition-all duration-300">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-[#FAD961]/20 transition-colors duration-300">
                      <ChevronRight className="w-4 h-4 text-[#FAD961] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300 drop-shadow-sm">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون سوم: اکوسیستم (Safi Ecosystem) */}
          <div>
            <h3 className="text-white font-black text-xl mb-6 tracking-wide drop-shadow-md">Safi Ecosystem</h3>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'Safi Capital - Official Site', href: 'https://safiinternationalcapitalltd.site' },
                { name: 'SafiPay - Digital Banking', href: 'https://www.safipay.net' },
                { name: 'Safi TopUp - Global Airtime', href: 'https://www.safitopup.site' },
                { name: 'SafiPro - Premium Lifestyle', href: 'https://www.safipro.site' },
                { name: 'Shaheen Safi - Tech Blog', href: 'https://shaheensafi.blog/' },
              ].map((brand) => (
                <li key={brand.name}>
                  <a href={brand.href} target="_blank" rel="noopener noreferrer" className="group flex items-center text-[15px] font-medium text-[#B0B0B0] hover:text-white transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center mr-3 group-hover:border-[#FAD961]/50 group-hover:shadow-[0_0_15px_rgba(250,217,97,0.3)] transition-all duration-300">
                      <Globe className="w-4 h-4 text-[#FAD961]" />
                    </div>
                    <span className="drop-shadow-sm">{brand.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ستون چهارم: اطلاعات حقوقی و تماس */}
          <div>
            <h3 className="text-white font-black text-xl mb-6 tracking-wide drop-shadow-md">Headquarters</h3>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-4 group">
                <div className="bg-[#1A1A1A]/80 backdrop-blur-md p-2.5 rounded-xl border border-[#FAD961]/20 group-hover:border-[#FAD961] transition-colors duration-300">
                  <MapPin className="w-5 h-5 text-[#FAD961]" />
                </div>
                <div className="text-[14px] font-light leading-relaxed text-[#D1D1D1]">
                  <span className="text-[#FAD961] block font-bold mb-1 tracking-wide">Safi International Capital LTD</span>
                  71-75 Shelton Street, Covent Garden <br />
                  London, United Kingdom
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-[#1A1A1A]/80 backdrop-blur-md p-2.5 rounded-xl border border-[#FAD961]/20 group-hover:border-[#FAD961] transition-colors duration-300">
                  <ShieldCheck className="w-5 h-5 text-[#FAD961]" />
                </div>
                <span className="text-[14px] font-medium text-[#D1D1D1]">Company No: <span className="text-white font-bold tracking-wider bg-white/10 px-2 py-1 rounded-md ml-1 border border-white/10">17063286</span></span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="bg-[#1A1A1A]/80 backdrop-blur-md p-2.5 rounded-xl border border-[#FAD961]/20 group-hover:border-[#FAD961] transition-colors duration-300">
                  <Mail className="w-5 h-5 text-[#FAD961]" />
                </div>
                <a href="mailto:support@safi-ai.com" className="text-[14px] font-medium text-[#D1D1D1] hover:text-[#FAD961] transition-colors drop-shadow-sm">
                  support@safi-ai.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* بخش پایانی (Copyright) */}
        <div className="border-t border-white/10 py-8 flex flex-col md:flex-row items-center justify-between gap-4 relative">
          <p className="text-[13px] text-[#A0A0A0] font-medium tracking-wider uppercase">
            © {currentYear} <span className="text-white font-bold">Safi International Capital LTD</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-[13px] text-[#A0A0A0] font-bold tracking-wider uppercase">
            <Link href="/privacy" className="hover:text-[#FAD961] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#FAD961] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}