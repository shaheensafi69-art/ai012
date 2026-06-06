"use client";

import React, { useState, useEffect } from 'react';
import { KeyRound, Loader2, Bell, ShieldCheck, Moon } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // فقط دریافت ایمیل برای تاییدیه تغییر رمز عبور
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setUserEmail(user.email);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'رمز عبور جدید و تکرار آن مطابقت ندارند.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }
    if (!userEmail) {
      setMessage({ type: 'error', text: 'خطا در احراز هویت. لطفاً مجدداً وارد شوید.' });
      return;
    }

    setIsUpdating(true);
    try {
      // 1. بررسی درستی رمز عبور فعلی
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) throw new Error("رمز عبور فعلی اشتباه است.");

      // 2. تنظیم رمز عبور جدید
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر یافت.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'خطا در تغییر رمز عبور.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const preferences = [
    { id: 'email', title: 'Email Notifications', desc: 'Receive updates on your generations and account.', icon: <Bell className="w-4 h-4" /> },
    { id: 'theme', title: 'Dark Mode Enforcement', desc: 'Force dark mode across all workspaces.', icon: <Moon className="w-4 h-4" /> },
    { id: '2fa', title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account.', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10">
      
      {/* 🟢 بخش تنظیمات عمومی (Preferences) */}
      <section>
        <h2 className="text-lg font-semibold text-neutral-200 mb-4">Account Preferences</h2>
        <div className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 overflow-hidden">
          {preferences.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-5 sm:px-6 ${index !== preferences.length - 1 ? 'border-b border-neutral-800/60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 text-neutral-500">{item.icon}</div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-200">{item.title}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
                </div>
              </div>
              {/* Toggle Button (UI Only) */}
              <button className="relative w-11 h-6 rounded-full bg-neutral-800 border border-neutral-700 transition-colors focus:outline-none shrink-0">
                <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-[#FAD961] shadow-sm" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 🟢 بخش تغییر رمز عبور (Security) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-200">Security & Password</h2>
        </div>
        
        <form onSubmit={handlePasswordChange} className="rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 p-5 sm:p-6 space-y-5">
          
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Current Password</label>
              <input 
                type="password" 
                required 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                placeholder="Enter current password"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  required 
                  minLength={6} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Confirm New Password</label>
                <input 
                  type="password" 
                  required 
                  minLength={6} 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:border-neutral-600 transition-colors"
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={isUpdating} 
              className="w-full sm:w-auto px-6 py-2.5 bg-neutral-100 text-neutral-900 hover:bg-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}