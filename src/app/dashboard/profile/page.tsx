"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, CreditCard, Settings as SettingsIcon, 
  Activity, ArrowLeft, Zap, LogOut, Shield, 
  Image as ImageIcon, Video, Edit3, CheckCircle2, AlertCircle, KeyRound, Loader2
} from 'lucide-react';
import Link from 'next/link';
// تغییر بسیار مهم: استفاده از Browser Client برای مدیریت خودکار کوکی‌ها هنگام خروج
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// Initialize Supabase Browser Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  plan_name: string;
  images_used: number;
  images_total: number;
  videos_used: number;
  videos_total: number;
  avatar_url: string;
}

export default function CommandCenterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'settings'>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // States for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Fetch Real Data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) throw new Error("کاربر لاگین نیست");

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        
        if (data) setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile({
          id: 'error_state',
          first_name: 'Safi',
          last_name: 'Member',
          email: 'Please log in to view data',
          phone_number: '',
          plan_name: 'Free',
          images_used: 0,
          images_total: 0,
          videos_used: 0,
          videos_total: 0,
          avatar_url: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // هندل کردن خروج قطعی کاربر و پاک کردن کوکی‌ها
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      // استفاده از window.location.href برای ریلود کامل و پاکسازی کش Next.js
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  // هندل کردن تغییر رمز عبور با اعتبارسنجی رمز فعلی
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'رمز عبور جدید و تکرار آن مطابقت ندارند.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile!.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("رمز عبور فعلی اشتباه است.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setPasswordMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر یافت.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message || 'خطا در تغییر رمز عبور.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Quotas', icon: <Activity className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Plans', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'settings', label: 'Preferences & Security', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const availablePlans = [
    { name: 'Basic', price: 10, images: 50, videos: 0, desc: 'Perfect for text & image generation.' },
    { name: 'Creator', price: 19, images: 200, videos: 10, desc: 'Ideal for content creators and marketers.', isPopular: true },
    { name: 'Pro', price: 35, images: 600 , videos: 30, desc: 'Maximum capacity for studio professionals.' }
  ];

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const imageUsagePercent = profile.images_total > 0 ? (profile.images_used / profile.images_total) * 100 : 0;
  const videoUsagePercent = profile.videos_total > 0 ? (profile.videos_used / profile.videos_total) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-[#FAD961] selection:text-black pb-20 pt-28 px-6 lg:px-16">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#D4AF37]/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[75rem] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <Link href="/dashboard" className="p-3 bg-[#0A0A0A] border border-white/10 hover:border-[#FAD961]/50 hover:bg-white/5 rounded-2xl transition-all shadow-lg">
            <ArrowLeft className="w-5 h-5 text-neutral-400 hover:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Command Center
            </h1>
            <p className="text-xs font-bold tracking-[0.15em] text-neutral-500 uppercase mt-1">
              Manage your SAFI AI Workspace
            </p>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:col-span-3 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-l-2 border-[#D4AF37] text-white shadow-inner'
                    : 'bg-[#0A0A0A] border border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full mt-8 flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {isSigningOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              
              {/* ==========================================
                  OVERVIEW TAB
              ========================================== */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* PROFILE CARD */}
                  <div className="bg-[#070707]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                    
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FAD961] to-[#D4AF37] p-1 flex-shrink-0">
                        {/* نمایش آواتار در صورت وجود، در غیر این صورت آیکون یوزر */}
                        <div className="w-full h-full rounded-full bg-[#0A0A0A] border-4 border-[#0A0A0A] overflow-hidden flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-[#FAD961]" />
                          )}
                        </div>
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-white">{profile.first_name} {profile.last_name}</h2>
                        <p className="text-neutral-400 text-sm font-medium">{profile.email}</p>
                        {profile.phone_number && <p className="text-neutral-500 text-xs mt-1">{profile.phone_number}</p>}
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#FAD961] text-xs font-bold uppercase tracking-wider">
                            <Shield className="w-4 h-4" /> {profile.plan_name} Plan
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href="/dashboard/profile/edit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </Link>
                  </div>

                  {/* QUOTAS SECTION */}
                  {profile.plan_name !== 'Free' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/5 rounded-xl text-neutral-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">Image Synthesis</h3>
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Monthly Quota</p>
                            </div>
                          </div>
                          <span className="text-2xl font-black text-[#FAD961]">
                            {Math.max(0, profile.images_total - profile.images_used)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FAD961] to-[#D4AF37] rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, imageUsagePercent)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-neutral-400">
                          <span>{profile.images_used} Used</span>
                          <span>{profile.images_total} Total</span>
                        </div>
                      </div>

                      <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/5 rounded-xl text-neutral-300">
                              <Video className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">Cinematic Video</h3>
                              <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Max 10s per clip</p>
                            </div>
                          </div>
                          <span className="text-2xl font-black text-[#FAD961]">
                             {Math.max(0, profile.videos_total - profile.videos_used)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FAD961] to-[#D4AF37] rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, videoUsagePercent)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-medium text-neutral-400">
                          <span>{profile.videos_used} Generated</span>
                          <span>{profile.videos_total} Total</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-[2rem] p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <div>
                          <h3 className="font-bold text-white text-lg">No Active Plan</h3>
                          <p className="text-sm text-neutral-400">Please select a plan from the billing tab to unlock generations.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('billing')} className="px-6 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold rounded-xl transition-colors">
                        View Plans
                      </button>
                    </div>
                  )}

                  {/* UNLIMITED CHAT BANNER */}
                  {profile.plan_name !== 'Free' && (
                    <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20 rounded-[2rem] p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-[#D4AF37]/30 shadow-lg">
                          <Zap className="w-6 h-6 text-[#FAD961]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">Neural Chat & Code</h3>
                          <p className="text-sm text-neutral-400">Your current plan includes unlimited chat interactions.</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-black uppercase tracking-widest rounded-full">Unlimited</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ==========================================
                  BILLING TAB
              ========================================== */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-[#070707] border border-white/5 rounded-[2rem] p-8 text-center">
                    <h2 className="text-2xl font-black text-white mb-2">
                      {profile.plan_name === 'Free' ? 'Choose a Plan' : `Current Plan: ${profile.plan_name}`}
                    </h2>
                    <p className="text-neutral-400 max-w-lg mx-auto">
                      Select the perfect plan for your creative needs. Upgrade or downgrade at any time.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availablePlans.map((plan) => (
                      <div key={plan.name} className={`relative bg-[#0A0A0A] border rounded-[2rem] p-8 flex flex-col ${plan.isPopular ? 'border-[#D4AF37]/50 shadow-[0_0_30px_rgba(212,175,55,0.1)]' : 'border-white/5'}`}>
                        {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full">
                            Most Popular
                          </div>
                        )}
                        <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-4xl font-black text-[#FAD961]">${plan.price}</span>
                          <span className="text-sm text-neutral-500">/mo</span>
                        </div>
                        <p className="text-sm text-neutral-400 mb-6 flex-1">{plan.desc}</p>
                        
                        <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-3 text-sm text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> {plan.images} Images / mo
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> {plan.videos} Videos / mo
                          </div>
                          <div className="flex items-center gap-3 text-sm text-neutral-300">
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> Unlimited Chat
                          </div>
                        </div>

                        <Link href={`/dashboard/checkout?plan=${plan.name.toLowerCase()}`} className={`w-full py-3 rounded-xl font-bold transition-all text-center ${
                          profile.plan_name === plan.name 
                            ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/5'
                            : plan.isPopular
                              ? 'bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black hover:scale-105 shadow-lg'
                              : 'bg-white/10 text-white hover:bg-white/20'
                        }`}>
                          {profile.plan_name === plan.name ? 'Current Plan' : 'Select Plan'}
                        </Link>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ==========================================
                  SETTINGS & SECURITY TAB
              ========================================== */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-[#070707] border border-white/5 rounded-[2rem] p-8">
                    <h2 className="text-xl font-black text-white mb-6">Account Preferences</h2>
                    <div className="space-y-4">
                      {['Email Notifications', 'Dark Mode Enforcement', 'Two-Factor Authentication'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-xl">
                          <span className="text-sm font-medium text-neutral-300">{item}</span>
                          <div className="w-12 h-6 bg-[#D4AF37]/20 rounded-full relative cursor-pointer border border-[#D4AF37]/50">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-[#FAD961] rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr className="border-white/5 my-8" />

                    {/* SECURITY SECTION */}
                    <div className="mb-6 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                      <h2 className="text-xl font-black text-white">Security & Password</h2>
                    </div>
                    
                    <form onSubmit={handlePasswordChange} className="bg-[#0A0A0A] border border-white/5 rounded-[1.5rem] p-6 space-y-4 max-w-xl">
                      
                      {passwordMessage.text && (
                        <div className={`p-3 rounded-lg text-sm font-bold ${passwordMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Current Password</label>
                        <input 
                          type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">New Password</label>
                        <input 
                          type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Confirm New Password</label>
                        <input 
                          type="password" required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                          placeholder="••••••••"
                        />
                      </div>

                      <button 
                        type="submit" disabled={isUpdatingPassword}
                        className="w-full py-3 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </main>
  );
}