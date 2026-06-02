"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Menu, X, Sparkles, LogIn, ArrowRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ایمپورت سوپابیس برای بررسی وضعیت لاگین
import { supabase } from '../lib/supabase'; 

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================
const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Contact', href: '/contact' },
  { name: 'About', href: '/about' },
];

// ============================================================================
// PREMIUM MAGNETIC EFFECT FOR INTERACTIVE BUTTONS
// ============================================================================
const MagneticWrapper = ({ children, range = 35 }: { children: React.ReactNode; range?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    // Check if cursor is within dynamic range boundary
    if (Math.abs(x) < range && Math.abs(y) < range) {
      setPosition({ x: x * 0.35, y: y * 0.35 });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const currentRef = ref.current;
    if (currentRef) {
      window.addEventListener('mousemove', handleMouseMove);
      currentRef.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (currentRef) {
        currentRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// DYNAMIC HOVER NAV ITEM WITH BUBBLE INTERPOLATION
// ============================================================================
const DesktopNavItem = ({ href, name, isActive }: { href: string; name: string; isActive: boolean }) => {
  return (
    <Link href={href} className="relative px-5 py-2.5 group transition-all">
      <span className={`relative z-10 text-xs font-bold tracking-[0.15em] uppercase transition-colors duration-500 ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'}`}>
        {name}
      </span>
      {isActive && (
        <motion.div
          layoutId="premium-nav-active-indicator"
          className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#B8942E] rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
      {!isActive && (
        <span className="absolute bottom-1 left-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent transition-all duration-300 ease-out group-hover:w-1/2 group-hover:-translate-x-1/2 opacity-0 group-hover:opacity-100 rounded-full" />
      )}
    </Link>
  );
};

// ============================================================================
// MAIN PREMIUM NAVBAR COMPONENT
// ============================================================================
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // استیت برای ذخیره کاربر لاگین شده
  const pathname = usePathname();

  // چک کردن وضعیت لاگین کاربر در هنگام لود شدن نوبار
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    // گوش دادن به تغییرات وضعیت لاگین (مثلاً اگر کاربر از جای دیگری خارج شد)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fine-tuned scroll hook tracking for cinematic aesthetic adaptation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
          isScrolled 
            ? 'py-3 bg-black/70 backdrop-blur-2xl border-b border-[#D4AF37]/15 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]' 
            : 'py-6 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* ==================================================================
              BRAND IDENTITY: OFFICIAL IMAGE LOGO
              ================================================================== */}
          <Link href="/" className="relative z-50 flex items-center gap-4 group cursor-pointer">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative flex items-center justify-center h-16 md:h-20 w-auto"
            >
              <img 
                src="/logo.png" 
                alt="Safi AI Logo" 
                className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-500 group-hover:drop-shadow-[0_0_25px_rgba(250,217,97,0.7)]"
              />
            </motion.div>
          </Link>

          {/* ==================================================================
              CENTER DOCK NAVIGATION MODULE (DESKTOP)
              ================================================================== */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/50 border border-white/10 px-2 py-1.5 rounded-full backdrop-blur-xl shadow-[inset_0_1px_20px_rgba(255,255,255,0.03)]">
            {NAV_LINKS.map((link) => (
              <DesktopNavItem 
                key={link.name} 
                href={link.href} 
                name={link.name} 
                isActive={pathname === link.href} 
              />
            ))}
          </nav>

          {/* ==================================================================
              RIGHT CONTROLS: METALLIC CTA BUTTON MODULE
              ================================================================== */}
          <div className="hidden lg:flex items-center gap-8">
            
            {/* اگر کاربر لاگین نیست، دکمه‌های ورود و ثبت‌نام را نشان بده */}
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="group flex items-center gap-2.5 text-xs font-bold tracking-widest uppercase text-gray-400 hover:text-white transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 text-gray-500 group-hover:text-[#D4AF37] group-hover:rotate-6 transition-all" />
                  Log in
                </Link>

                <MagneticWrapper>
                  <Link 
                    href="/login"
                    className="relative flex items-center gap-2.5 bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#B8942E] text-black px-8 py-3.5 rounded-full font-black text-xs tracking-widest uppercase overflow-hidden group shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:shadow-[0_0_45px_rgba(212,175,55,0.65)] transition-all duration-500"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.8s_infinite] skew-x-[25deg]" />
                  </Link>
                </MagneticWrapper>
              </>
            ) : (
              /* اگر کاربر لاگین است، فقط دکمه داشبورد را نشان بده */
              <MagneticWrapper>
                <Link 
                  href="/dashboard"
                  className="relative flex items-center gap-2.5 bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#B8942E] text-black px-8 py-3.5 rounded-full font-black text-xs tracking-widest uppercase overflow-hidden group shadow-[0_0_30px_rgba(212,175,55,0.35)] hover:shadow-[0_0_45px_rgba(212,175,55,0.65)] transition-all duration-500"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-black" />
                    SAFI AI STUDIO
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.8s_infinite] skew-x-[25deg]" />
                </Link>
              </MagneticWrapper>
            )}
          </div>

          {/* ==================================================================
              TACTILE HAMBURGER INTERFACE INTERACTION BUTTON (MOBILE)
              ================================================================== */}
          <button 
            className="lg:hidden relative z-50 p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-[#D4AF37] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <X className="w-7 h-7" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.3 }}>
                  <Menu className="w-7 h-7" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* ==================================================================
          STAGGERED HIGH-END MOBILITY LAYER OVERLAY SYSTEM (MOBILE MENU)
          ================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[90] bg-black flex flex-col justify-center px-8 pt-24"
          >
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            
            <nav className="flex flex-col gap-8 relative z-10 max-w-md mx-auto w-full">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-5xl font-black tracking-tight block transition-all ${pathname === link.href ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFF8D6] pl-4 border-l-2 border-[#D4AF37]' : 'text-white/60 hover:text-white'}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-16 flex flex-col gap-4"
              >
                {!user ? (
                  <>
                    <Link 
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4.5 rounded-2xl border border-white/10 text-center text-sm font-bold tracking-widest uppercase text-white flex items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/5 transition-all"
                    >
                      <LogIn className="w-4 h-4 text-gray-400" />
                      Log in
                    </Link>
                    
                    <Link 
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#B8942E] text-black text-center text-sm font-black tracking-widest uppercase shadow-[0_0_35px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-4 h-4" />
                      Get Started Now
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#FFF8D6] to-[#B8942E] text-black text-center text-sm font-black tracking-widest uppercase shadow-[0_0_35px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard className="w-4 h-4 text-black" />
                    Open Dashboard
                  </Link>
                )}
              </motion.div>
            </nav>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-12 left-8 right-8 text-center text-gray-600 text-xs font-bold tracking-[0.2em] uppercase border-t border-white/5 pt-8"
            >
              © 2026 SAFI INTERNATIONAL CAPITAL LTD.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}