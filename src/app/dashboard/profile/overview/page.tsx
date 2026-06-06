"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Video, Zap, User, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function OverviewPage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) setProfile(data);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
      </div>
    );
  }

  // محاسبات نوار پیشرفت
  const imgPercent = profile.images_total > 0 ? Math.min((profile.images_used / profile.images_total) * 100, 100) : 0;
  const vidPercent = profile.videos_total > 0 ? Math.min((profile.videos_used / profile.videos_total) * 100, 100) : 0;
  const isFreePlan = !profile.plan_name || profile.plan_name.toLowerCase() === 'free';

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* 🟢 بخش پروفایل کاربر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-neutral-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">{profile.first_name} {profile.last_name}</h2>
            <p className="text-sm text-neutral-400 mt-1">{profile.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#FAD961]/20 bg-[#FAD961]/10 text-[#FAD961] text-xs font-semibold uppercase tracking-wider">
              {profile.plan_name} PLAN
            </div>
          </div>
        </div>
        
        <Link 
          href="/dashboard/profile/edit" 
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 hover:bg-white text-sm font-medium rounded-lg transition-all w-full sm:w-auto"
        >
          <Edit2 className="w-4 h-4 shrink-0" />
          Edit Profile
        </Link>
      </div>

      {/* 🟢 بخش سهمیه‌ها (Quota) */}
      {!isFreePlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* کارت عکس */}
          <div className="p-6 rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-200">Image Generation</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Monthly Limit</p>
                </div>
              </div>
              <span className="text-2xl font-semibold text-neutral-100">
                {Math.max(0, profile.images_total - profile.images_used)} <span className="text-sm text-neutral-500 font-normal">left</span>
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-neutral-300 rounded-full transition-all duration-1000" style={{ width: `${imgPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs font-medium text-neutral-500">
              <span>{profile.images_used} used</span>
              <span>{profile.images_total} total</span>
            </div>
          </div>

          {/* کارت ویدیو */}
          <div className="p-6 rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-200">Cinematic Video</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Monthly Limit</p>
                </div>
              </div>
              <span className="text-2xl font-semibold text-neutral-100">
                {Math.max(0, profile.videos_total - profile.videos_used)} <span className="text-sm text-neutral-500 font-normal">left</span>
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#FAD961] rounded-full transition-all duration-1000" style={{ width: `${vidPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs font-medium text-neutral-500">
              <span>{profile.videos_used} used</span>
              <span>{profile.videos_total} total</span>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 بخش امکانات نامحدود */}
      {!isFreePlan && (
        <div className="p-5 rounded-2xl border border-neutral-800/60 bg-[#0d0d0d]/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900 text-[#FAD961]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-200 text-sm">Neural Chat & Code</h3>
              <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">Unlimited access to advanced reasoning models.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-bold uppercase tracking-widest rounded-md">
            Unlimited
          </span>
        </div>
      )}
    </div>
  );
}