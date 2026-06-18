"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Zap, Sliders, Eye, Download, RefreshCw, 
  History, CheckCircle2, Upload, Cpu, ArrowLeft, Film, AlertTriangle, ShieldAlert,
  Monitor
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const LOADING_MESSAGES = [
  "Connecting to SAFI Neural Core...",
  "Injecting Motion Architecture...",
  "Analyzing Reference Geometry...",
  "Synthesizing Frame Interpolation...",
  "Applying Cinematic Volumetric Light...",
  "Rendering AI Visual Assets...",
  "Finalizing Container Packaging..."
];

const ASPECT_RATIOS = [
  '1:1', '3:4', '4:3', '9:16', '16:9', '2:3', '3:2', 
  '9:19.5', '19.5:9', '9:20', '20:9', '1:2', '2:1'
];

export default function VideoGeneratorPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string>('Free');
  const [videosTotal, setVideosTotal] = useState<number>(0);
  const [videosUsed, setVideosUsed] = useState<number>(0);
  
  const [videoModels, setVideoModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const [videoMode, setVideoMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // ================= پارامترهای جدید و آپدیت شده =================
  const [motionStrength, setMotionStrength] = useState(50);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [renderDuration, setRenderDuration] = useState(5); // ۱ الی ۱۵ ثانیه
  const [resolution, setResolution] = useState<'480p' | '720p'>('720p'); // کیفیت ویدیو

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  
  const [canRegenerate, setCanRegenerate] = useState(true);

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
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

  useEffect(() => {
    let msgInterval: NodeJS.Timeout;
    if (isRendering && !renderComplete) {
      msgInterval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(msgInterval);
  }, [isRendering, renderComplete]);

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

      const { error } = await supabase.storage.from('ai_assets').upload(fileName, file);
      if (error) throw error;

      const { data: publicData } = supabase.storage.from('ai_assets').getPublicUrl(fileName);
      setImageUrl(publicData.publicUrl);
    } catch (err: any) {
      setUiError(`Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

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
          setOutputVideoUrl(statusData.outputUrl); // اطمینان از استفاده نام درست متغیر
          setIsRendering(false);
          setRenderComplete(true);
          
          setHistoryData(prev => [
            { input_params: { prompt: prompt || 'Image to Video Conversion' }, credits_used: '1 Video' },
            ...prev
          ].slice(0, 5));
        } else if (statusData.status === 'failed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setUiError(statusData.errorDetails || "Video generation failed at the AI core. Please try again.");
          setIsRendering(false);
        }
      } catch (err) {
        console.error("Polling instance failure:", err);
      }
    }, 6000); 
  };

  const executeGeneration = async (isRegen: boolean = false) => {
    setUiError(null);

    if (videosTotal === 0) return setUiError(`Your current plan (${planName}) does not support video generation. Please upgrade.`);
    if (videosUsed >= videosTotal) return setUiError("You have reached your maximum video quota. Please upgrade your plan.");
    if (!selectedModel) return setUiError("Please select a synthesis engine.");
    if (videoMode === 'text' && !prompt.trim()) return setUiError("Prompt description is required.");
    if (videoMode === 'image' && !imageUrl) return setUiError("Base image is required for Image-to-Video.");

    setCanRegenerate(!isRegen);
    setIsRendering(true);
    setRenderComplete(false);
    setProgress(0);
    setLoadingMsgIndex(0);

    const visualProgress = setInterval(() => {
      setProgress(p => (p < 88 ? Math.floor(p + Math.random() * 6) : 88));
    }, 900);

    try {
      // 🟢 سینک کامل با بک‌اند جدید
      const payloadInputData = {
        prompt,
        aspectRatio,
        resolution,
        imageUrl: videoMode === 'image' ? imageUrl : null 
      };

      const response = await fetch('/api/ai/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pricingId: selectedModel.id,
          durationInSeconds: renderDuration,
          inputData: payloadInputData
        })
      });

      const data = await response.json();
      clearInterval(visualProgress);

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize compilation sequence.");
      }

      setVideosUsed(prev => prev + 1);

      if (data.status === 'processing') {
        const actualTaskId = data.taskId || data.outputUrl.replace('pending_task_', '');
        pollTaskStatus(actualTaskId);
      } else {
        setProgress(100);
        setOutputVideoUrl(data.outputUrl);
        setIsRendering(false);
        setRenderComplete(true);
      }
    } catch (error: any) {
      clearInterval(visualProgress);
      setIsRendering(false);
      
      let finalErrorMessage = "An unexpected error occurred.";
      const rawError = (error.message || "").toLowerCase();

      if (rawError.includes('x.ai') || rawError.includes('credits or licenses') || rawError.includes('permission') || rawError.includes('403')) {
        finalErrorMessage = "A system error has occurred. Please try again in a few moments.";
      } else if (rawError.includes('insufficient') || rawError.includes('plan') || rawError.includes('quota') || rawError.includes('balance')) {
        finalErrorMessage = "You do not have an active plan. Please upgrade to continue.";
      } else {
        finalErrorMessage = error.message;
      }
      
      setUiError(finalErrorMessage);
    }
  };

  const handleDownloadVideo = async (url: string) => {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to fetch video asset');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Safi-AI-Video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Direct video download failed, attempting fallback:', error);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Safi-AI-Video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleInitializeGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeGeneration(false);
  };

  const isQuotaExceeded = videosTotal === 0 || videosUsed >= videosTotal;
  const videosRemaining = Math.max(0, videosTotal - videosUsed);

  return (
    <main className="relative min-h-screen text-slate-100 overflow-hidden pb-16 pt-24 md:pt-32 px-4 sm:px-6 lg:px-16 selection:bg-fuchsia-500 selection:text-white bg-[#050014]">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileUpload} />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#050014]" />
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 mt-4 md:mt-0">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-fuchsia-400 transition-colors uppercase tracking-widest mb-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <ArrowLeft className="w-4 h-4" /> Command Center
            </Link>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">Cinematic Studio</h1>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-lg w-full md:w-auto">
            <div className={`p-2 rounded-full border flex-shrink-0 ${isQuotaExceeded ? 'bg-red-500/10 border-red-500/20' : 'bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.2)]'}`}>
              <Film className={`w-5 h-5 ${isQuotaExceeded ? 'text-red-400' : 'text-fuchsia-400'}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-400 font-sans text-[10px] font-bold uppercase tracking-wider">{planName} Plan</span>
              <span className={`font-black text-sm ${isQuotaExceeded ? 'text-red-400' : 'text-white'}`}>
                {videosRemaining} <span className="text-xs text-neutral-500 font-medium">/ {videosTotal} Videos Left</span>
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isQuotaExceeded && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-bold mb-8 shadow-lg">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 shrink-0" /> 
                <span className="leading-relaxed">Your video quota is depleted or not supported on the {planName} plan.</span>
              </div>
              <Link href="/dashboard/checkout" className="sm:ml-auto w-full sm:w-auto text-center bg-red-500/20 hover:bg-red-500/30 text-white px-5 py-2.5 rounded-full transition-colors text-xs uppercase tracking-wider">Upgrade Plan</Link>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7 bg-[#0A051A]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative">
            <form onSubmit={handleInitializeGeneration} className="space-y-7">
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-[0.2em] text-fuchsia-400 uppercase flex items-center gap-2 ml-2">
                  <Cpu className="w-4 h-4" /> Synthesis Engine
                </label>
                <select 
                  disabled={isQuotaExceeded}
                  className="w-full bg-[#03000A] border border-white/10 rounded-3xl p-4 md:p-5 text-sm text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50 transition-all appearance-none cursor-pointer font-bold shadow-inner disabled:opacity-50"
                  value={selectedModel?.id || ''}
                  onChange={(e) => setSelectedModel(videoModels.find(m => String(m.id) === String(e.target.value)))}
                >
                  {videoModels.length === 0 && <option>Loading core configs...</option>}
                  {videoModels.map((model) => (
                    <option key={model.id} value={model.id} className="bg-[#03000A] text-white">
                      {model.model_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex bg-[#03000A] border border-white/10 p-1.5 rounded-full shadow-inner">
                <button type="button" disabled={isQuotaExceeded} onClick={() => setVideoMode('text')} className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300 ${videoMode === 'text' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>Text to Video</button>
                <button type="button" disabled={isQuotaExceeded} onClick={() => setVideoMode('image')} className={`flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300 ${videoMode === 'image' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}>Image to Video</button>
              </div>

              <AnimatePresence>
                {videoMode === 'image' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <div onClick={() => !isUploading && !isRendering && !isQuotaExceeded && fileInputRef.current?.click()} className={`border-2 ${imageUrl ? 'border-fuchsia-500/50 bg-fuchsia-500/5' : 'border-dashed border-white/10 bg-[#03000A]'} hover:border-fuchsia-500/40 rounded-[2rem] p-8 text-center transition-all group relative mt-2 ${isUploading || isRendering || isQuotaExceeded ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      {isUploading ? (
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-fuchsia-400 animate-spin" />
                      ) : (
                        <Upload className={`w-8 h-8 mx-auto mb-3 transition-transform group-hover:-translate-y-1 ${imageUrl ? 'text-fuchsia-400' : 'text-neutral-500'}`} />
                      )}
                      <p className="text-sm font-bold text-white">
                        {isUploading ? 'Streaming asset securely...' : imageUrl ? 'Base Frame Loaded' : 'Upload First-Frame Image'}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-widest">Max 5MB • JPG/PNG High-Res</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-[0.2em] text-fuchsia-400 uppercase ml-2">Prompt Architecture</label>
                <textarea 
                  disabled={isQuotaExceeded}
                  value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
                  placeholder={videoMode === 'text' ? "Describe the cinematic sequence, camera pan, color grading..." : "Describe the motion execution applied to your base frame..."}
                  className="w-full bg-[#03000A] border border-white/10 rounded-3xl p-5 text-[15px] text-white focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50 transition-colors font-medium leading-relaxed resize-none shadow-inner placeholder:text-neutral-600 disabled:opacity-50"
                />
              </div>

              {/* پنل تنظیمات پیشرفته و جدید */}
              <div className="border-t border-white/10 pt-7 space-y-6">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <div className="flex items-center gap-2 text-neutral-300 ml-2"><Sliders className="w-4 h-4 text-fuchsia-400" /> Advanced Parameters</div>
                  <span className="text-white bg-white/10 border border-white/10 px-4 py-2 rounded-full font-bold">Cost: 1 Video</span>
                </div>

                <div className="bg-[#03000A] border border-white/10 p-5 rounded-3xl space-y-6 shadow-inner">
                  
                  {/* Aspect Ratio & Resolution Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                      <select 
                        disabled={isQuotaExceeded}
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500 appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {ASPECT_RATIOS.map((ratio) => (
                          <option key={ratio} value={ratio} className="bg-[#03000A] text-white">{ratio}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Monitor className="w-3 h-3" /> Quality
                      </label>
                      <div className="grid grid-cols-2 bg-white/5 rounded-full p-1 border border-white/10">
                        {['480p', '720p'].map((res) => (
                          <button 
                            type="button" disabled={isQuotaExceeded} key={res} 
                            onClick={() => setResolution(res as '480p' | '720p')} 
                            className={`py-2 text-xs font-black rounded-full transition-colors ${resolution === res ? 'bg-white/15 text-white shadow-md' : 'text-neutral-500 hover:text-white'} disabled:opacity-50`}
                          >
                            {res.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Duration Slider (1 to 15s) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-bold text-neutral-400">
                      <span>Video Duration</span>
                      <span className="font-mono text-fuchsia-400">{renderDuration} Seconds</span>
                    </div>
                    <input 
                      type="range" disabled={isQuotaExceeded} min="1" max="15" 
                      value={renderDuration} 
                      onChange={(e) => setRenderDuration(parseInt(e.target.value))} 
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-fuchsia-500 disabled:opacity-50" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-neutral-600 px-1">
                      <span>1s</span>
                      <span>15s</span>
                    </div>
                  </div>
                  
                </div>
              </div>

              <AnimatePresence>
                {uiError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-3xl flex items-start gap-3 text-sm font-bold overflow-hidden">
                    <AlertTriangle className="w-5 h-5 shrink-0" /> {uiError}
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={isRendering || isUploading || !selectedModel || isQuotaExceeded} 
                className={`w-full py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isQuotaExceeded 
                    ? 'bg-white/5 text-neutral-500 cursor-not-allowed border border-white/10' 
                    : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(217,70,239,0.5)]'
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

          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="w-full bg-[#0A051A]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-2xl min-h-[400px]">
              
              <AnimatePresence mode="wait">
                {isRendering && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#050014]/95 backdrop-blur-md p-8 z-30 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-fuchsia-500/50 animate-[spin_8s_linear_infinite] flex items-center justify-center mb-6 relative shadow-[0_0_40px_rgba(217,70,239,0.15)]">
                      <div className="absolute inset-3 bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 rounded-full animate-pulse" />
                      <Film className="w-12 h-12 text-fuchsia-400" />
                    </div>
                    <p className="text-6xl font-black font-mono tracking-tighter text-white mb-4 drop-shadow-lg">{progress}%</p>
                    <motion.p key={loadingMsgIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-xs font-bold tracking-[0.15em] text-fuchsia-400 uppercase h-6 drop-shadow px-4 leading-relaxed">
                      {LOADING_MESSAGES[loadingMsgIndex]}
                    </motion.p>
                    <div className="w-full bg-[#03000A] border border-white/10 h-2.5 rounded-full mt-8 overflow-hidden max-w-[200px] shadow-inner">
                      <motion.div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500" style={{ width: `${progress}%` }} />
                    </div>
                  </motion.div>
                )}

                {renderComplete && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-[#0A051A]/95 backdrop-blur-xl p-6 z-30 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 drop-shadow-[0_0_30px_rgba(52,211,153,0.4)] shrink-0 mt-4" />
                    <h3 className="text-2xl font-black text-white mb-6 tracking-tight shrink-0">Render Complete</h3>
                    
                    <div className={`relative bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center shrink-0 ${
                      aspectRatio.includes('16') && aspectRatio.startsWith('9') ? 'aspect-[9/16] max-h-[45vh] w-auto mx-auto' : 'aspect-video w-full'
                    }`}>
                      {outputVideoUrl ? (
                        <video src={outputVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-600 font-bold uppercase tracking-widest">Asset Not Found</div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-8 pb-4 shrink-0">
                      <button onClick={() => setRenderComplete(false)} className="flex-1 min-w-[100px] py-3.5 rounded-full border border-white/10 text-xs font-black uppercase text-neutral-400 transition-colors hover:bg-white/5 hover:text-white">
                        Dismiss
                      </button>

                      {canRegenerate && (
                        <button 
                          onClick={() => executeGeneration(true)} 
                          className="flex-1 min-w-[130px] py-3.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" /> Regenerate
                        </button>
                      )}

                      {outputVideoUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadVideo(outputVideoUrl)}
                          className="flex-1 min-w-[130px] py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-black uppercase flex items-center justify-center gap-2 hover:scale-[1.02] shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isRendering && !renderComplete && (
                <div className="space-y-6 text-center px-4">
                  <div className="w-28 h-28 bg-[#03000A] border border-white/5 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Eye className="w-12 h-12 text-neutral-700" />
                  </div>
                  <h4 className="text-sm font-black tracking-[0.2em] text-neutral-300 uppercase">Asset Preview Monitor</h4>
                  <p className="text-xs text-neutral-500 max-w-[240px] mx-auto font-medium leading-relaxed">Initialize a compilation sequence on the deployment core to monitor output.</p>
                </div>
              )}
            </div>

            <div className="bg-[#0A051A]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex-1 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-black text-fuchsia-400 uppercase tracking-widest mb-6 ml-2">
                <History className="w-4 h-4" /> Output Archive
              </div>
              <div className="space-y-3 overflow-y-auto max-h-[180px] pr-2 custom-scrollbar">
                {historyData.length === 0 ? (
                  <p className="text-xs text-neutral-600 text-center py-8 font-bold uppercase tracking-widest bg-[#03000A] rounded-3xl border border-white/5">No recent records.</p>
                ) : (
                  historyData.map((history, idx) => (
                    <div key={idx} className="p-4 bg-[#03000A] border border-white/5 rounded-3xl flex justify-between items-center text-xs transition-colors hover:border-white/10 group">
                      <span className="font-bold text-neutral-300 truncate max-w-[140px] sm:max-w-[200px]">{history.input_params?.prompt || 'Image to Video Pipeline'}</span>
                      <span className="font-mono font-bold text-white bg-white/10 px-3 py-1.5 rounded-full shadow-inner group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-400 transition-colors">-1 Video</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217,70,239,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </main>
  );
}