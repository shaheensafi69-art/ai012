"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Calendar, Globe2, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
// اتصال به فایل Supabase
import { supabase } from '../../lib/supabase'; 

// ============================================================================
// REALISTIC SOLAR SYSTEM DATA (PERFECT CENTER FIXED)
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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // فیلدهای فرم
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState('none');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    country: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // هندل کردن ثبت‌نام و ورود با دیتابیس واقعی Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    let isSuccess = false; // متغیر برای کنترل وضعیت اسپینر هنگام انتقال

    try {
      if (isLogin) {
        // --- REAL LOGIN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        if (data.user) {
          isSuccess = true;
          // استفاده از window.location برای انتقال قطعی و شناسایی کوکی‌ها در کل اپلیکیشن
          window.location.href = '/dashboard'; 
        }
      } else {
        // --- REAL SIGNUP LOGIC ---
        // ۱. ساخت کاربر در سیستم احراز هویت Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        if (data.user) {
          // ۲. ذخیره اطلاعات تکمیلی در جدول profiles (استفاده از upsert)
          const { error: profileError } = await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone_number: formData.phone,
              date_of_birth: formData.dob || null,
              country: formData.country,
              credit_balance: 50, // کریدت اولیه هدیه
            }
          ]);

          if (profileError) throw profileError;

          isSuccess = true;
          alert('Account successfully created! Welcome to Safi AI.');
          window.location.href = '/dashboard';
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'An error occurred during authentication.');
    } finally {
      // اگر عملیات موفق بود، اسپینر را قطع نمی‌کنیم تا صفحه کامل عوض شود
      if (!isSuccess) {
        setIsLoading(false);
      }
    }
  };

  // ==========================================
  // منطق ایموجی انسان: تغییر قیافه بر اساس وضعیت
  // ==========================================
  const getAvatarEmoji = () => {
    if (activeField === 'password') {
      return showPassword ? '😌' : '🧐';
    }
    if (activeField !== 'none') {
      return '🧐';
    }
    return '👨‍💻';
  };

  // ==========================================
  // منطق حرکت سر ایموجی به سمت فیلدها
  // ==========================================
  const getAvatarTransform = () => {
    switch (activeField) {
      case 'firstName': return { x: 30, y: -40, rotate: 10, scale: 1.1 };
      case 'lastName': return { x: 45, y: -40, rotate: 15, scale: 1.1 };
      case 'phone': return { x: 30, y: -10, rotate: 5, scale: 1.1 };
      case 'dob': return { x: 45, y: -10, rotate: 10, scale: 1.1 };
      case 'country': return { x: 35, y: 15, rotate: 5, scale: 1.1 };
      case 'email': return { x: 35, y: 0, rotate: 5, scale: 1.1 };
      case 'password': return { x: 30, y: 40, rotate: -10, scale: 1.1 };
      default: return { x: 0, y: 0, rotate: 0, scale: 1 };
    }
  };

  return (
    <main className="relative min-h-screen bg-[#020202] text-white overflow-hidden flex items-center justify-center p-4 lg:p-10">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#D4AF37]/5 mix-blend-screen z-10" />
        <div className="absolute top-1/2 left-1/2 w-0 h-0">
          <div className="absolute -left-[600px] -top-[600px] w-[1200px] h-[1200px] bg-[#ff7b00]/10 rounded-full blur-[200px]" />
          <div className="absolute -left-[300px] -top-[300px] w-[600px] h-[600px] bg-[#ffdd00]/15 rounded-full blur-[100px]" />
          
          <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-[80px] -top-[80px] w-[160px] h-[160px] rounded-full" style={{ background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #ffdd00 20%, #ff5e00 60%, #cc0000 90%)', boxShadow: '0 0 80px #ff5e00, 0 0 150px #ffdd00, inset -10px -10px 30px rgba(150,0,0,0.8)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full mix-blend-overlay opacity-60" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 4px)', backgroundSize: '12px 12px' }} />
          </motion.div>

          {SOLAR_SYSTEM.map((planet) => (
            <motion.div key={planet.name} animate={{ rotate: 360 }} transition={{ duration: planet.speed, repeat: Infinity, ease: "linear" }} className="absolute border border-white/[0.03] rounded-full" style={{ width: planet.orbit, height: planet.orbit, left: -(planet.orbit / 2), top: -(planet.orbit / 2), transformStyle: 'preserve-3d' }}>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-1/2 rounded-full" style={{ width: planet.size, height: planet.size, background: planet.gradient, marginLeft: -(planet.size / 2), marginTop: -(planet.size / 2), boxShadow: 'inset -4px -4px 10px rgba(0,0,0,0.9), 0 0 15px rgba(255,255,255,0.1)' }}>
                {planet.hasRing && <div className="absolute top-1/2 left-1/2 w-[220%] h-[30%] border-[3px] border-[#ead6b8]/50 rounded-[50%] -translate-x-1/2 -translate-y-1/2 rotate-[20deg] shadow-[0_0_10px_rgba(234,214,184,0.3)]" />}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.1 }}></div>
      </div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-[#FAD961] transition-colors z-50">
        <ArrowLeft className="w-4 h-4" /> Back to Universe
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl bg-[#0A0A0A]/70 backdrop-blur-3xl border border-[#FAD961]/20 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col lg:flex-row min-h-[700px]"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FAD961] to-transparent opacity-80 z-20" />

        {/* LEFT SIDE: EMOJI */}
        <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#111111] to-[#000000] border-r border-white/5 items-center justify-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FAD961]/15 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              animate={getAvatarTransform()}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="text-[180px] drop-shadow-[0_0_50px_rgba(250,217,97,0.5)] select-none pointer-events-none"
            >
              {getAvatarEmoji()}
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-10 right-10 text-center">
            <h3 className="text-2xl font-black italic text-white drop-shadow-md">SAFI AI ASSISTANT</h3>
            <p className="text-gray-400 text-sm font-light mt-2">I am watching over your secure authentication process.</p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full lg:w-1/2 p-10 md:p-16 flex flex-col relative z-20">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-black border border-[#FAD961]/40 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(250,217,97,0.2)] overflow-hidden p-1">
              <img src="/logo.png" alt="Safi AI Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] to-[#D4AF37]">
              SAFI AI
            </span>
          </div>

          <div className="flex bg-black/60 p-1.5 rounded-full border border-white/10 mb-10">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setActiveField('none'); }}
              className={`flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-full transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black shadow-[0_0_20px_rgba(250,217,97,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setActiveField('none'); }}
              className={`flex-1 py-3 text-xs font-black tracking-widest uppercase rounded-full transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black shadow-[0_0_20px_rgba(250,217,97,0.3)]' : 'text-gray-500 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500" />
              {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-5">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                        <input 
                          type="text" name="firstName" required placeholder="First Name"
                          value={formData.firstName} onChange={handleChange}
                          onFocus={() => setActiveField('firstName')} onBlur={() => setActiveField('none')}
                          className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                        <input 
                          type="text" name="lastName" required placeholder="Last Name"
                          value={formData.lastName} onChange={handleChange}
                          onFocus={() => setActiveField('lastName')} onBlur={() => setActiveField('none')}
                          className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                        <input 
                          type="tel" name="phone" required placeholder="Phone Number"
                          value={formData.phone} onChange={handleChange}
                          onFocus={() => setActiveField('phone')} onBlur={() => setActiveField('none')}
                          className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all text-sm"
                        />
                      </div>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                        <input 
                          type="date" name="dob" required
                          value={formData.dob} onChange={handleChange}
                          onFocus={() => setActiveField('dob')} onBlur={() => setActiveField('none')}
                          className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-400 focus:text-white focus:outline-none focus:border-[#FAD961] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                      <select 
                        name="country" required
                        value={formData.country} onChange={handleChange}
                        onFocus={() => setActiveField('country')} onBlur={() => setActiveField('none')}
                        className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-400 focus:text-white focus:outline-none focus:border-[#FAD961] appearance-none transition-all text-sm"
                      >
                        <option value="" disabled>Select your country</option>
                        <option value="Afghanistan">Afghanistan</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Germany">Germany</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                  <input 
                    type="email" name="email" required placeholder="Email Address"
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setActiveField('email')} onBlur={() => setActiveField('none')}
                    className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all text-sm"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#FAD961] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" required placeholder="Secure Password"
                    value={formData.password} onChange={handleChange}
                    onFocus={() => setActiveField('password')} onBlur={() => setActiveField('none')}
                    className="w-full bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961] focus:ring-1 focus:ring-[#FAD961] transition-all text-sm tracking-widest"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#FAD961] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <Link href="#" className="text-xs text-gray-400 hover:text-[#FAD961] transition-colors">
                      Recover Password?
                    </Link>
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-start gap-3 pt-2">
                    <div className="mt-0.5 rounded bg-white/5 border border-[#FAD961]/30 p-0.5">
                      <ShieldCheck className="w-4 h-4 text-[#FAD961]" />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-light">
                      By proceeding, I agree to the <Link href="#" className="text-[#FAD961] font-medium hover:underline">Terms of Service</Link> and confirm that I have read Safi AI's <Link href="#" className="text-[#FAD961] font-medium hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-10 bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black font-black tracking-[0.2em] uppercase py-5 rounded-2xl flex items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(250,217,97,0.5)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Authenticate' : 'Initialize Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}