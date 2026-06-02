"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Sliders, Eye, Download, RefreshCw, 
  History, CheckCircle2, Upload, Cpu, ArrowLeft, Film, AlertTriangle, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const LOADING_MESSAGES = [
  "Connecting to Neural Core...",
  "Injecting Prompt Architecture...",
  "Analyzing Geometry & Keyframes...",
  "Synthesizing Motion Fields...",
  "Applying Cinematic Volumetric Lighting...",
  "Rendering Complex Visual Assets...",
  "Finalizing Container Packaging..."
];

export default function VideoGeneratorPage() {
  // Global States (Updated for Quota System)
  const [userId, setUserId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>('Free');
  const [videosTotal, setVideosTotal] = useState<number>(0);
  const [videosUsed, setVideosUsed] = useState<number>(0);
  
  const [videoModels, setVideoModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Configuration States
  const [videoMode, setVideoMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [motionStrength, setMotionStrength] = useState(50);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [renderDuration, setRenderDuration] = useState(10); // ثابت روی ۱۰ ثانیه بر اساس پلن

  // Status & Safety States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);

  // 1. Initial Data Fetching (Quota System)
  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // دریافت سهمیه و پلن کاربر
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_name, videos_total, videos_used')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setPlanName(profile.plan_name || 'Free');
          setVideosTotal(profile.videos_total || 0);
          setVideosUsed(profile.videos_used || 0);
        }

        const { data: history } = await supabase.from('ai_generations')
          .select('*')
          .eq('user_id', user.id)
          .ilike('generation_type', '%video%')
          .order('created_at', { ascending: false })
          .limit(5);
        if (history) setHistoryData(history);
      }

      const { data: pricing } = await supabase.from('ai_pricing')
        .select('*')
        .eq('is_active', true)
        .ilike('category', '%video%');
      
      if (pricing && pricing.length > 0) {
        setVideoModels(pricing);
        setSelectedModel(pricing[0]);
      }
    }
    loadStudioData();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // 2. Cycle Loading Messages During Render
  useEffect(() => {
    let msgInterval: NodeJS.Timeout;
    if (isRendering && !renderComplete) {
      msgInterval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(msgInterval);
  }, [isRendering, renderComplete]);

  // 3. Secure File Upload with Validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUiError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUiError("Image size must be under 5MB.");
      return;
    }
    if (!file.type.startsWith('image/')) {
      setUiError("Invalid file format. Please upload an image (JPG/PNG).");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-video-frame-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('ai_assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('ai_assets')
        .getPublicUrl(fileName);

      setImageUrl(publicData.publicUrl);
    } catch (err: any) {
      setUiError(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Polling Task Status
  const pollTaskStatus = async (taskIdStr: string) => {
    let attempts = 0;
    const maxAttempts = 100;

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      
      if (attempts > maxAttempts) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setUiError("Render timeout. The server took too long. We have paused polling, please check history later.");
        setIsRendering(false);
        return;
      }

      try {
        const res = await fetch(`/api/ai/status?taskId=${taskIdStr}`);
        const statusData = await res.json();

        if (statusData.success && statusData.status === 'completed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setProgress(100);
          setOutputVideoUrl(statusData.videoUrl);
          setIsRendering(false);
          setRenderComplete(true);
          
          setHistoryData(prev => [
            { input_params: { prompt: prompt || 'Image to Video Conversion' }, credits_used: '1 Video' },
            ...prev
          ].slice(0, 5));
        } else if (statusData.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setUiError("Generation failed at the AI core.");
          setIsRendering(false);
        }
      } catch (err) {
        console.error("Polling instance failure:", err);
      }
    }, 6000); 
  };

  // 5. Form Submission (Quota Logic)
  const handleInitializeGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);

    // بررسی سقف مجاز ویدیوها
    if (videosTotal === 0) return setUiError(`Your current plan (${planName}) does not support video generation. Please upgrade.`);
    if (videosUsed >= videosTotal) return setUiError("You have reached your maximum video quota. Please upgrade your plan.");

    if (!selectedModel) return setUiError("لطفاً یک موتور پردازشی انتخاب کنید.");
    if (videoMode === 'text' && !prompt.trim()) return setUiError("Prompt description is required.");
    if (videoMode === 'image' && !imageUrl) return setUiError("Base image is required for Image-to-Video.");

    setIsRendering(true);
    setRenderComplete(false);
    setProgress(0);
    setLoadingMsgIndex(0);

    const visualProgress = setInterval(() => {
      setProgress(p => (p < 88 ? Math.floor(p + Math.random() * 6) : 88));
    }, 900);

    try {
      // توجه: بک‌اند شما در مسیر '/api/ai/generate' باید به جای کریدت، فیلد videos_used را +1 کند.
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pricingId: selectedModel.id,
          durationInSeconds: renderDuration,
          inputData: { prompt, motionStrength, aspectRatio, imageUrl, first_frame_image: imageUrl }
        })
      });

      const data = await response.json();
      clearInterval(visualProgress);

      if (response.ok && data.success) {
        // آپدیت کردن سهمیه در فرانت‌اند
        setVideosUsed(prev => prev + 1);

        if (data.status === 'processing') {
          const actualTaskId = data.outputUrl.replace('pending_task_', '');
          pollTaskStatus(actualTaskId);
        } else {
          setProgress(100);
          setOutputVideoUrl(data.outputUrl);
          setIsRendering(false);
          setRenderComplete(true);
        }
      } else {
        throw new Error(data.error || "Failed to initialize compilation sequence.");
      }
    } catch (error: any) {
      clearInterval(visualProgress);
      setIsRendering(false);
      setUiError(`Core Error: ${error.message}`);
    }
  };

  const isQuotaExceeded = videosTotal === 0 || videosUsed >= videosTotal;
  const videosRemaining = Math.max(0, videosTotal - videosUsed);

  return (
    <main className="relative min-h-screen text-slate-100 overflow-hidden pb-16 pt-32 px-6 lg:px-16 selection:bg-[#FAD961] selection:text-black">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} />

      {/* LUXURY GALAXY BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#020202]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#FAD961]/5 rounded-full blur-[150px]" />
        
        {[...Array(25)].map((_, i) => (
          <div key={i} className="absolute bg-[#FAD961] rounded-full animate-pulse opacity-20" style={{
            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 2 + 2}s`
          }} />
        ))}
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto">
        
        {/* HEADER SECTION (Quota Display) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-[#FAD961] transition-colors uppercase tracking-widest mb-2">
              <ArrowLeft className="w-4 h-4" /> Return to Command Center
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Cinematic Studio</h1>
          </div>

          <div className="flex items-center gap-4 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
            <div className={`p-2 rounded-xl border ${isQuotaExceeded ? 'bg-red-500/10 border-red-500/20' : 'bg-[#D4AF37]/10 border-[#D4AF37]/20'}`}>
              <Film className={`w-6 h-6 ${isQuotaExceeded ? 'text-red-400' : 'text-[#FAD961]'}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 font-sans text-[10px] font-bold uppercase tracking-wider">{planName} Plan</span>
              <span className={`font-black text-sm ${isQuotaExceeded ? 'text-red-400' : 'text-white'}`}>
                {videosRemaining} <span className="text-xs text-neutral-500 font-medium">/ {videosTotal} Videos Left</span>
              </span>
            </div>
          </div>
        </div>

        {/* QUOTA WARNING BANNER */}
        <AnimatePresence>
          {isQuotaExceeded && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-4 text-sm font-bold mb-8 shadow-lg">
              <ShieldAlert className="w-6 h-6 shrink-0" /> 
              Your video quota is depleted or not supported on the {planName} plan. Upgrade to Creator or Pro to generate cinematic videos.
              <Link href="/dashboard/checkout" className="ml-auto bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-lg transition-colors text-xs uppercase tracking-wider">Upgrade Plan</Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================== */}
          {/* LEFT: CONTROLS PANEL           */}
          {/* ============================== */}
          <div className="lg:col-span-7 bg-[#070707]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FAD961]/30 to-transparent" />
            
            <form onSubmit={handleInitializeGeneration} className="space-y-7">
              
              {/* Engine Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-[0.2em] text-[#FAD961] uppercase flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Synthesis Engine
                </label>
                <select 
                  disabled={isQuotaExceeded}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none cursor-pointer font-bold shadow-inner disabled:opacity-50"
                  value={selectedModel?.id || ''}
                  onChange={(e) => setSelectedModel(videoModels.find(m => String(m.id) === String(e.target.value)))}
                >
                  {videoModels.length === 0 && <option>Loading core configs...</option>}
                  {videoModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.model_name} • {model.resolution} (High Quality)
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggles */}
              <div className="flex bg-[#0A0A0A] border border-white/10 p-1.5 rounded-xl shadow-inner">
                <button type="button" disabled={isQuotaExceeded} onClick={() => setVideoMode('text')} className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${videoMode === 'text' ? 'bg-[#D4AF37]/20 text-[#FAD961] border border-[#D4AF37]/30 shadow-lg' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>Text to Video</button>
                <button type="button" disabled={isQuotaExceeded} onClick={() => setVideoMode('image')} className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${videoMode === 'image' ? 'bg-[#D4AF37]/20 text-[#FAD961] border border-[#D4AF37]/30 shadow-lg' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>Image to Video</button>
              </div>

              {/* Secure Upload Area */}
              <AnimatePresence>
                {videoMode === 'image' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div onClick={() => !isUploading && !isRendering && !isQuotaExceeded && fileInputRef.current?.click()} className={`border-2 ${imageUrl ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' : 'border-dashed border-white/10 bg-[#0A0A0A]'} hover:border-[#D4AF37]/40 rounded-2xl p-8 text-center transition-all group relative mt-2 ${isUploading || isRendering || isQuotaExceeded ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      {isUploading ? (
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-[#FAD961] animate-spin" />
                      ) : (
                        <Upload className={`w-8 h-8 mx-auto mb-3 transition-transform group-hover:-translate-y-1 ${imageUrl ? 'text-[#FAD961]' : 'text-neutral-500'}`} />
                      )}
                      <p className="text-sm font-bold text-white">
                        {isUploading ? 'Streaming asset securely...' : imageUrl ? 'Base Frame Loaded' : 'Upload First-Frame Image'}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">Max 5MB • JPG/PNG High-Res</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-[0.2em] text-[#FAD961] uppercase">Prompt Architecture</label>
                <textarea 
                  disabled={isQuotaExceeded}
                  value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
                  placeholder={videoMode === 'text' ? "Describe the cinematic sequence, camera pan, color grading..." : "Describe the motion execution applied to your base frame..."}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors font-medium leading-relaxed resize-none shadow-inner placeholder:text-neutral-600 disabled:opacity-50"
                />
              </div>

              {/* Parameter Settings */}
              <div className="border-t border-white/10 pt-7 space-y-6">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-neutral-300"><Sliders className="w-4 h-4 text-[#FAD961]" /> Parameters</div>
                  <span className="text-[#FAD961] bg-[#D4AF37]/10 border border-[#D4AF37]/20 font-mono px-3 py-1.5 rounded-md">Cost: 1 Video</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-neutral-400">
                    <span>Motion Dynamics</span>
                    <span className="font-mono text-[#FAD961] bg-[#0A0A0A] px-2 py-0.5 rounded border border-white/5">{motionStrength}%</span>
                  </div>
                  <input type="range" disabled={isQuotaExceeded} min="1" max="100" value={motionStrength} onChange={(e) => setMotionStrength(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] disabled:opacity-50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 bg-[#0A0A0A] rounded-xl p-1.5 border border-white/10 shadow-inner">
                    {['16:9', '9:16'].map((ratio) => (
                      <button type="button" disabled={isQuotaExceeded} key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 text-xs font-black rounded-lg transition-colors ${aspectRatio === ratio ? 'bg-white/10 text-[#FAD961] shadow' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>{ratio}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 bg-[#0A0A0A] rounded-xl p-1.5 border border-white/10 shadow-inner">
                    {[5, 10].map((sec) => (
                      <button type="button" disabled={isQuotaExceeded} key={sec} onClick={() => setRenderDuration(sec)} className={`py-2 text-xs font-black rounded-lg transition-colors ${renderDuration === sec ? 'bg-white/10 text-[#FAD961] shadow' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>{sec}s</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* UI Error Display */}
              <AnimatePresence>
                {uiError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-bold">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> {uiError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button 
                type="submit" 
                disabled={isRendering || isUploading || !selectedModel || isQuotaExceeded} 
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isQuotaExceeded 
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5' 
                    : 'bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isQuotaExceeded ? (
                  <><ShieldAlert className="w-5 h-5" /> Quota Exhausted</>
                ) : isRendering ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Compiling Output...</>
                ) : (
                  'Initialize Generation'
                )}
              </button>
            </form>
          </div>

          {/* ============================== */}
          {/* RIGHT: MONITOR & ARCHIVE       */}
          {/* ============================== */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Monitor */}
            <div className="aspect-[4/5] w-full bg-[#070707]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl">
              
              <AnimatePresence mode="wait">
                {isRendering && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#020202]/95 backdrop-blur-md p-8 z-30 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-[#FAD961] shadow-[0_0_30px_#FAD961] animate-pulse" />
                    
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#FAD961]/50 animate-[spin_8s_linear_infinite] flex items-center justify-center mb-6 relative shadow-[0_0_40px_rgba(250,217,97,0.1)]">
                      <div className="absolute inset-2 bg-gradient-to-tr from-[#FAD961]/10 to-transparent rounded-full animate-pulse" />
                      <Film className="w-10 h-10 text-[#FAD961]" />
                    </div>
                    <p className="text-5xl font-black font-mono tracking-tighter text-white mb-3 drop-shadow-lg">{progress}%</p>
                    
                    <motion.p key={loadingMsgIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-[11px] font-black tracking-[0.15em] text-[#FAD961] uppercase h-6 drop-shadow">
                      {LOADING_MESSAGES[loadingMsgIndex]}
                    </motion.p>
                    
                    <div className="w-full bg-[#0A0A0A] border border-white/5 h-2 rounded-full mt-6 overflow-hidden max-w-xs">
                      <motion.div className="h-full bg-gradient-to-r from-[#FAD961] to-[#D4AF37]" style={{ width: `${progress}%` }} />
                    </div>
                  </motion.div>
                )}

                {renderComplete && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-[#070707]/95 backdrop-blur-md p-6 z-30 flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="w-16 h-16 text-[#FAD961] mb-3 drop-shadow-[0_0_30px_rgba(250,217,97,0.4)]" />
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Render Complete</h3>
                    
                    <div className="w-full aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
                      {outputVideoUrl ? (
                        <video src={outputVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-600 font-bold uppercase tracking-widest">Asset Not Found</div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mt-8">
                      <button onClick={() => setRenderComplete(false)} className="py-4 rounded-xl border border-white/10 text-xs font-black uppercase text-neutral-400 transition-colors hover:bg-white/5 hover:text-white">Dismiss</button>
                      {outputVideoUrl && <a href={outputVideoUrl} download target="_blank" rel="noreferrer" className="py-4 rounded-xl bg-gradient-to-r from-[#FAD961] to-[#D4AF37] text-black text-xs font-black uppercase flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"><Download className="w-4 h-4" /> Download</a>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isRendering && !renderComplete && (
                <div className="space-y-5 text-center px-4">
                  <div className="w-24 h-24 bg-[#0A0A0A] border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Eye className="w-10 h-10 text-neutral-600" />
                  </div>
                  <h4 className="text-sm font-black tracking-[0.15em] text-neutral-300 uppercase">Asset Preview Monitor</h4>
                  <p className="text-xs text-neutral-500 max-w-[220px] mx-auto font-medium leading-relaxed">Initialize a compilation sequence on the deployment core to monitor output.</p>
                </div>
              )}
            </div>

            {/* Local Archives */}
            <div className="bg-[#070707]/80 backdrop-blur-lg border border-white/10 rounded-[2rem] p-6 flex-1 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-black text-neutral-300 uppercase tracking-widest mb-4">
                <History className="w-4 h-4 text-[#FAD961]" /> Output Archive
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                {historyData.length === 0 ? (
                  <p className="text-xs text-neutral-600 text-center py-6 font-bold uppercase tracking-widest">No recent records.</p>
                ) : (
                  historyData.map((history, idx) => (
                    <div key={idx} className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl flex justify-between items-center text-xs transition-colors hover:border-[#D4AF37]/30">
                      <span className="font-bold text-neutral-300 truncate max-w-[160px]">{history.input_params?.prompt || 'Image to Video Pipeline'}</span>
                      <span className="font-mono font-bold text-[#FAD961] bg-[#D4AF37]/10 px-2.5 py-1 rounded shadow-inner">-1 Video</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}