"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Wand2, Image as ImageIcon, Download, Copy, Check, 
  Maximize2, RefreshCw, Sliders, ArrowLeft, Loader2, Zap, 
  Layers, ShieldAlert, Cpu, Eye, ExternalLink, Palette, Compass
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import TechBackground from '@/components/TechBackground';

// ============================================================================
// PRESETS & CONFIGURATION
// ============================================================================
const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', desc: 'Instagram & Avatars', icon: '■' },
  { id: '16:9', label: '16:9 Cinema', desc: 'Desktop & YouTube', icon: '▬' },
  { id: '9:16', label: '9:16 Vertical', desc: 'TikTok & Stories', icon: '▮' },
  { id: '4:3', label: '4:3 Standard', desc: 'Classic Display', icon: '▭' },
  { id: '3:4', label: '3:4 Portrait', desc: 'Editorial & Headshots', icon: '▯' },
];

const STYLE_PRESETS = [
  { id: 'photoreal', name: 'Photorealistic', promptSuffix: ', ultra-realistic 8k photography, 35mm lens, high fidelity, sharp details' },
  { id: 'cinematic', name: 'Cinematic Movie', promptSuffix: ', cinematic movie still, anamorphic lens, 8k resolution, dramatic volumetric lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', promptSuffix: ', cyberpunk aesthetic, neon reflections, rain soaked obsidian streets, futuristic tech atmosphere' },
  { id: 'anime', name: 'Anime Masterpiece', promptSuffix: ', Makoto Shinkai style, vibrant colors, pristine studio anime art, masterwork illustration' },
  { id: '3d-render', name: 'Octane 3D', promptSuffix: ', 3D Octane Render, ray-tracing, soft ambient occlusion, glossy materials, Behance trending' },
  { id: 'gold-luxury', name: 'Safi Gold Luxury', promptSuffix: ', luxury black and gold aesthetic, obsidian glass, brushed titanium, prestigious executive lighting' }
];

const LIGHTING_OPTIONS = [
  'Natural Daylight', 'Studio Softbox', 'Volumetric Neon', 'Golden Hour', 'Moody Dark Chiaroscuro'
];

interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  createdAt: string;
}

export default function ImageStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, deformed, low quality, artifacts, watermark, grainy, distorted');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('photoreal');
  const [selectedLighting, setSelectedLighting] = useState('Studio Softbox');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedAsset | null>(null);
  const [gallery, setGallery] = useState<GeneratedAsset[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pricingId, setPricingId] = useState<string>('4e738086-cf3c-49e6-9d36-c502c9887ec5');

  // Load user profile & session
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('credit_balance')
            .eq('id', user.id)
            .single();
          if (profile) setUserCredits(profile.credit_balance);
        }

        // Fetch image pricing model
        const { data: pricing } = await supabase
          .from('ai_pricing')
          .select('id')
          .eq('category', 'image')
          .eq('is_active', true)
          .single();
        if (pricing) setPricingId(pricing.id);
      } catch (err) {
        console.error('Session load error:', err);
      }
    }
    loadUser();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);

    const styleObj = STYLE_PRESETS.find(s => s.id === selectedStyle);
    const fullPrompt = `${prompt.trim()}${styleObj ? styleObj.promptSuffix : ''}, lighting: ${selectedLighting}`;

    try {
      const response = await fetch('/api/ai/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'demo_user',
          pricingId: pricingId,
          inputData: {
            prompt: fullPrompt,
            negativePrompt,
            aspectRatio: aspectRatio,
            category: 'image'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to render image with Google AI Studio Imagen 3.');
      }

      if (data.outputUrl) {
        const newAsset: GeneratedAsset = {
          id: `img_${Date.now()}`,
          url: data.outputUrl,
          prompt: prompt,
          aspectRatio,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setCurrentImage(newAsset);
        setGallery(prev => [newAsset, ...prev]);
        if (data.remainingCredits !== undefined) {
          setUserCredits(data.remainingCredits);
        }
      } else {
        throw new Error('No image URL returned from AI Studio.');
      }
    } catch (err: any) {
      console.error('Image Generation Error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `safi-imagen3-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-white flex flex-col font-sans selection:bg-[#FAD961] selection:text-black">
      <TechBackground variant="default" />

      {/* TOP EXECUTIVE BAR */}
      <header className="relative z-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 hover:text-[#FAD961] transition-colors uppercase"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAD961]/10 border border-[#FAD961]/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-[#FAD961]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide flex items-center gap-2">
                Safi Vision Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                  Google Imagen 3
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-gray-300">
            <Cpu className="w-3.5 h-3.5 text-[#FAD961]" />
            <span className="text-gray-400">Project:</span>
            <span className="font-mono text-[11px] text-[#FAD961]">591020899859</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAD961]/10 border border-[#FAD961]/30 text-xs font-bold text-[#FAD961]">
            <Zap className="w-3.5 h-3.5" />
            <span>{userCredits !== null ? `${userCredits} Credits` : 'Pro Engine Active'}</span>
          </div>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT CONTROL PANEL (5 COLS) */}
        <div className="lg:col-span-5 border-r border-white/5 bg-[#040404]/60 backdrop-blur-md p-6 lg:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-73px)]">
          <div className="space-y-6">
            
            {/* PROMPT INPUT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-widest text-[#FAD961] uppercase flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Creative Prompt
                </label>
                <span className="text-[10px] text-gray-500 font-mono">{prompt.length}/1000</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe your vision with exquisite detail (e.g., A futuristic obsidian tower in Dubai at twilight with gold bioluminescent lines, photorealistic, 8k)..."
                className="w-full bg-[#080808] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FAD961]/60 focus:ring-1 focus:ring-[#FAD961]/60 transition-all resize-none font-light leading-relaxed shadow-inner"
              />
            </div>

            {/* STYLE PRESETS */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-[#FAD961]" /> Aesthetic Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedStyle === style.id
                        ? 'bg-[#FAD961]/15 border-[#FAD961] text-[#FAD961] shadow-[0_0_15px_rgba(250,217,97,0.15)]'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ASPECT RATIOS */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#FAD961]" /> Canvas Ratio
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      aspectRatio === ratio.id
                        ? 'bg-[#FAD961]/15 border-[#FAD961] text-[#FAD961]'
                        : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    <span className="text-base leading-none mb-1">{ratio.icon}</span>
                    <span className="text-[10px] font-bold">{ratio.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LIGHTING & VOLUMETRICS */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#FAD961]" /> Lighting Environment
              </label>
              <div className="flex flex-wrap gap-2">
                {LIGHTING_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedLighting(opt)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all ${
                      selectedLighting === opt
                        ? 'bg-white/10 border-[#FAD961]/60 text-white font-medium'
                        : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* NEGATIVE PROMPT */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#FAD961]" /> Negative Exclusions
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to exclude from image..."
                className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-[#FAD961]/50 font-light"
              />
            </div>

          </div>

          {/* GENERATE ACTION BUTTON */}
          <div className="pt-6 border-t border-white/5 mt-6">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 flex items-start gap-2.5"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </motion.div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-[#FAD961] via-[#FFF8D6] to-[#D4AF37] text-black font-black tracking-[0.2em] uppercase py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(250,217,97,0.3)] hover:shadow-[0_0_50px_rgba(250,217,97,0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Synthesizing Canvas (Google Imagen 3)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-black" />
                  <span>Generate Masterpiece (5 Credits)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT PREVIEW & GALLERY CANVAS (7 COLS) */}
        <div className="lg:col-span-7 bg-[#020202] p-6 lg:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* ACTIVE PREVIEW AREA */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[420px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm">
                <div className="relative w-24 h-24 rounded-3xl bg-black border border-[#FAD961]/30 flex items-center justify-center shadow-[0_0_40px_rgba(250,217,97,0.2)]">
                  <div className="absolute inset-0 rounded-3xl border border-[#FAD961]/50 animate-ping opacity-20" />
                  <Loader2 className="w-10 h-10 text-[#FAD961] animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">Rendering via Google AI Studio</h3>
                  <p className="text-xs text-gray-500 mt-1">Applying Imagen 3 neural weights & volumetric lighting...</p>
                </div>
              </div>
            ) : currentImage ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-3xl overflow-hidden border border-white/10 bg-[#080808] shadow-2xl max-w-2xl w-full"
              >
                <img 
                  src={currentImage.url} 
                  alt={currentImage.prompt}
                  className="w-full h-auto object-cover max-h-[600px]"
                />
                
                {/* FLOATING ACTION OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setFullscreenImage(currentImage.url)}
                      className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#FAD961] hover:border-[#FAD961]/40 transition-all"
                      title="Fullscreen Lightbox"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyPrompt(currentImage.prompt, currentImage.id)}
                      className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:text-[#FAD961] hover:border-[#FAD961]/40 transition-all"
                      title="Copy Prompt"
                    >
                      {copiedId === currentImage.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDownload(currentImage.url)}
                      className="p-2.5 rounded-xl bg-[#FAD961] text-black font-bold hover:shadow-[0_0_20px_rgba(250,217,97,0.5)] transition-all"
                      title="Download Original High-Res PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FAD961]">
                      Ratio {currentImage.aspectRatio} • {currentImage.createdAt}
                    </span>
                    <p className="text-xs text-gray-200 mt-1 line-clamp-2 font-light">
                      {currentImage.prompt}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-sm font-bold text-white">Your Canvas is Ready</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  Enter your prompt on the left, choose your aspect ratio and style, and experience Google AI Studio's flagship Imagen 3 engine.
                </p>
              </div>
            )}
          </div>

          {/* SESSION GALLERY STRIP */}
          {gallery.length > 0 && (
            <div className="pt-6 border-t border-white/5 mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#FAD961]" /> Session History ({gallery.length})
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {gallery.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setCurrentImage(asset)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      currentImage?.id === asset.id
                        ? 'border-[#FAD961] ring-2 ring-[#FAD961]/30 scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 cursor-zoom-out"
          >
            <img 
              src={fullscreenImage} 
              alt="Fullscreen View" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}