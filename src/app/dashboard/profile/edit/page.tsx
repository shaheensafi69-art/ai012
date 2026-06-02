"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Save, User, Mail, Phone, MapPin, 
  Calendar, Camera, Loader2, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  country: string;
  avatar_url: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    country: '',
    avatar_url: ''
  });

  // ۱. خواندن اطلاعات از دیتابیس هنگام لود شدن صفحه
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // دریافت کاربر فعلی از سیستم Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        // اگر کاربر لاگین نبود، برای تست یک آیدی فرضی می‌گذاریم
        const currentUserId = user?.id || 'user_123'; 
        setUserId(currentUserId);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone_number: data.phone_number || '',
            date_of_birth: data.date_of_birth || '',
            country: data.country || '',
            avatar_url: data.avatar_url || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ۲. هندل کردن تغییرات فرم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ۳. آپلود عکس پروفایل (نیاز به ساخت باکت 'avatars' در Storage سوپابیس دارد)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file || !userId) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading image. Make sure 'avatars' bucket exists in Supabase Storage.");
    } finally {
      setIsUploading(false);
    }
  };

  // ۴. ذخیره اطلاعات در دیتابیس
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          country: formData.country,
          avatar_url: formData.avatar_url
          // خط updated_at از اینجا حذف شد تا با دیتابیس شما هماهنگ شود
        })
        .eq('id', userId);

      if (error) {
        console.error("Supabase Update Error:", error);
        throw error;
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/dashboard/profile');
      }, 2000);

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020202] text-slate-100 font-sans selection:bg-[#FAD961] selection:text-black pb-20 pt-28 px-6 lg:px-16">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[50rem] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/profile" className="p-3 bg-[#0A0A0A] border border-white/10 hover:border-[#FAD961]/50 hover:bg-white/5 rounded-2xl transition-all shadow-lg">
            <ArrowLeft className="w-5 h-5 text-neutral-400 hover:text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Edit Profile</h1>
            <p className="text-xs font-bold tracking-[0.15em] text-neutral-500 uppercase mt-1">
              Update your personal information
            </p>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#070707]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md flex flex-col items-center justify-center rounded-[2rem]"
              >
                <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-[#FAD961]" />
                </div>
                <h2 className="text-2xl font-black text-white">Profile Updated!</h2>
                <p className="text-neutral-400 mt-2">Redirecting to command center...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-8">
            
            {/* AVATAR UPLOAD SECTION */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-8 border-b border-white/5">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FAD961] to-[#D4AF37] p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#0A0A0A] overflow-hidden flex items-center justify-center border-4 border-[#0A0A0A]">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-neutral-600" />
                    )}
                  </div>
                </div>
                
                {/* Upload Overlay Button */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-1 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-4 border-transparent"
                >
                  {isUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="text-center sm:text-left mt-2">
                <h3 className="text-lg font-bold text-white">Profile Picture</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
                  Upload a high-resolution image. Recommended size is 256x256px.
                </p>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-colors"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* FORM FIELDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <User className="w-3 h-3" /> First Name
                </label>
                <input 
                  type="text" name="first_name" value={formData.first_name} onChange={handleChange} required
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                  placeholder="e.g. Shaheen"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <User className="w-3 h-3" /> Last Name
                </label>
                <input 
                  type="text" name="last_name" value={formData.last_name} onChange={handleChange} required
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                  placeholder="e.g. Safi"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
                </label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                  placeholder="user@safi-hub.com"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <input 
                  type="text" name="phone_number" value={formData.phone_number} onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date of Birth
                </label>
                <input 
                  type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all [color-scheme:dark]"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500 uppercase flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Country
                </label>
                <select 
                  name="country" value={formData.country} onChange={handleChange as any}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all appearance-none"
                >
                  <option value="">Select a country</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Turkey">Turkey</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  {/* در صورت نیاز می‌توانید لیست کامل کشورها را اضافه کنید */}
                </select>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/5">
              <Link 
                href="/dashboard/profile"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-neutral-400 hover:text-white transition-colors text-center"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black font-black uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </main>
  );
}