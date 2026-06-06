"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Activity, CreditCard, Settings as SettingsIcon, LogOut, Loader2, UserCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard/profile/overview', icon: <Activity className="w-4 h-4 shrink-0" /> },
    { name: 'Billing', path: '/dashboard/profile/billing', icon: <CreditCard className="w-4 h-4 shrink-0" /> },
    { name: 'Security', path: '/dashboard/profile/settings', icon: <SettingsIcon className="w-4 h-4 shrink-0" /> },
    { name: 'Edit Profile', path: '/dashboard/profile/edit', icon: <UserCircle className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <main className="relative min-h-screen bg-[#080808] text-neutral-200 antialiased selection:bg-[#FAD961] selection:text-black pb-16 pt-24 px-4 sm:px-6 lg:px-8">
      
      {/* افکت نوری ملایم بک‌گراند */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[64rem] mx-auto space-y-6">
        
        {/* هدر بالایی - سبک ChatGPT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/60">
          <div className="flex items-center gap-3.5">
            <Link 
              href="/dashboard" 
              className="group flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-[#0d0d0d] text-neutral-400 transition-all hover:border-neutral-700 hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-100">Settings</h1>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5 uppercase tracking-wider">
                Safi AI Personal Workspace
              </p>
            </div>
          </div>
        </div>

        {/* 🟢 نوار ناوبری (ادغام شده در Layout) */}
        <div className="w-full mb-8">
          <div className="flex items-center overflow-x-auto scrollbar-hide gap-2 pb-2 sm:pb-0">
            {navItems.map((item) => {
              // تشخیص دقیق مسیر فعلی
              const isActive = pathname.includes(item.path);
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
            
            <div className="flex-1 min-w-[20px]" />
            
            <button 
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all whitespace-nowrap"
            >
              {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <LogOut className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* 🟢 محتوای تب‌ها در اینجا قرار می‌گیرد */}
        <div className="w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>

      </div>
    </main>
  );
}