"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Sparkles, Activity, AlertCircle, ArrowLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

// لیست صداهای استاندارد
const VOICES = [
  { id: 'nova', name: 'Nova', desc: 'Female • Natural' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Female • Clear' },
  { id: 'alloy', name: 'Alloy', desc: 'Neutral • Versatile' },
  { id: 'echo', name: 'Echo', desc: 'Male • Warm' },
  { id: 'fable', name: 'Fable', desc: 'Male • Expressive' },
  { id: 'onyx', name: 'Onyx', desc: 'Male • Deep' },
];

export default function NeuralVoicePage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user'|'ai', text: string}[]>([]);

  // برای ذخیره در دیتابیس
  const [userId, setUserId] = useState<string | null>(null);
  const [aiModels, setAiModels] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  // لود اطلاعات کاربر برای اتصال به دیتابیس چت
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: pricingData } = await supabase.from('ai_pricing').select('*').eq('is_active', true);
        if (pricingData) setAiModels(pricingData);
        setActiveSessionId(`session_voice_${Date.now()}`); // ایجاد نشست اختصاصی صوتی
      }
    };
    init();
    
    // متوقف کردن صدای ربات هنگام خروج از صفحه
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // شروع شنیدن صدای کاربر
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("مرورگر شما از میکروفون هوشمند پشتیبانی نمی‌کند. لطفاً از Google Chrome استفاده کنید.");
      return;
    }

    // قطع کردن صدای ربات در صورت شروع صحبت مجدد کاربر
    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);

    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR'; // پشتیبانی از فارسی و انگلیسی
    recognition.interimResults = true;
    recognition.continuous = false;
    
    let finalTranscript = '';

    recognition.onstart = () => {
      setIsUserSpeaking(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      finalTranscript = Array.from(event.results)
        .map((res: any) => res[0].transcript)
        .join('');
      // نمایش لایو متن روی صفحه
      setTranscript(prev => {
        const newLog = [...prev];
        if (newLog.length > 0 && newLog[newLog.length - 1].role === 'user' && isUserSpeaking) {
          newLog[newLog.length - 1].text = finalTranscript;
        } else {
          newLog.push({ role: 'user', text: finalTranscript });
        }
        return newLog;
      });
    };

    recognition.onend = () => {
      setIsUserSpeaking(false);
      if (finalTranscript.trim()) {
        handleAiProcessing(finalTranscript);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // توقف ضبط
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // پردازش هوشمند: ثبت در دیتابیس ➔ گرفتن جواب ➔ تولید صدا با موتور نیتیو
  const handleAiProcessing = async (userText: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const targetModelConfig = aiModels.find(m => m.category.toLowerCase() === 'text');
      if (!targetModelConfig) throw new Error("مدل پردازش یافت نشد.");

      // ۱. ارسال به API چت (تا در دیتابیس ذخیره شود و جواب متنی بگیریم)
      const chatRes = await fetch('/api/ai/generate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          pricingId: targetModelConfig.id, 
          inputData: { 
            prompt: userText, 
            sessionId: activeSessionId,
            sessionTitle: "Safi Voice Assistant",
            userMessageId: `voice_user_${Date.now()}`,
            activeMode: 'chat'
          } 
        })
      });

      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.error || 'خطا در پردازش متن');

      const aiTextResponse = chatData.outputUrl;
      setTranscript(prev => [...prev, { role: 'ai', text: aiTextResponse }]);

      // ۲. پخش صدای ربات با استفاده از Web Speech API (بدون نیاز به سرور و API Key)
      const synth = window.speechSynthesis;
      synth.cancel(); // پاک کردن صداهای در صف

      const utterance = new SpeechSynthesisUtterance(aiTextResponse);
      
      // تشخیص زبان برای لحن طبیعی‌تر
      const isPersian = /[\u0600-\u06FF]/.test(aiTextResponse);
      utterance.lang = isPersian ? 'fa-IR' : 'en-US';
      utterance.rate = 1.0; // سرعت طبیعی
      utterance.pitch = 1.0; 

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      synth.speak(utterance);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'خطا در پردازش. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050014] text-white flex flex-col items-center justify-between h-[100dvh] overflow-hidden selection:bg-fuchsia-500">
      
      {/* هاله نورانی پس‌زمینه */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <motion.div 
          animate={{ 
            scale: isAiSpeaking ? [1, 1.2, 1] : isUserSpeaking ? [1, 1.05, 1] : 1,
            opacity: (isAiSpeaking || isUserSpeaking) ? 0.3 : 0.1 
          }}
          transition={{ repeat: Infinity, duration: isAiSpeaking ? 1.5 : 2 }}
          className="absolute w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-fuchsia-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: isAiSpeaking ? [1, 1.5, 1] : isUserSpeaking ? [1, 1.1, 1] : 1,
            opacity: (isAiSpeaking || isUserSpeaking) ? 0.2 : 0.1 
          }}
          transition={{ repeat: Infinity, duration: isAiSpeaking ? 1 : 2, delay: 0.2 }}
          className="absolute w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] bg-violet-600/20 rounded-full blur-[100px]" 
        />
      </div>

      <header className="w-full p-6 flex justify-between items-center z-20">
        <Link href="/dashboard" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors border border-white/10 backdrop-blur-md">
          <ArrowLeft className="w-4 h-4 text-neutral-300" />
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${isAiSpeaking ? 'bg-fuchsia-500 animate-pulse' : isUserSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-neutral-500'}`} />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-neutral-300">
            {isConnecting ? 'Thinking...' : isAiSpeaking ? 'SAFI is Speaking' : 'Ready'}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center z-20 w-full px-6 relative">
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8">
          {(isAiSpeaking || isUserSpeaking) && (
            <>
              <motion.div 
                animate={{ scale: isAiSpeaking ? [1, 1.4, 1] : [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: isAiSpeaking ? 1 : 2 }}
                className={`absolute inset-0 border rounded-full ${isAiSpeaking ? 'border-fuchsia-500/30' : 'border-blue-500/30'}`} 
              />
              <motion.div 
                animate={{ scale: isAiSpeaking ? [1, 1.8, 1] : [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: isAiSpeaking ? 1.2 : 2.5, delay: 0.1 }}
                className={`absolute inset-0 border rounded-full ${isAiSpeaking ? 'border-violet-500/20' : 'border-blue-400/20'}`} 
              />
            </>
          )}

          <motion.div 
            animate={{ 
              boxShadow: isAiSpeaking 
                ? ['0 0 40px rgba(217,70,239,0.5)', '0 0 80px rgba(167,139,250,0.8)', '0 0 40px rgba(217,70,239,0.5)'] 
                : isUserSpeaking 
                ? ['0 0 20px rgba(59,130,246,0.4)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.4)'] 
                : '0 0 20px rgba(255,255,255,0.1)'
            }}
            transition={{ repeat: Infinity, duration: isAiSpeaking ? 0.8 : 2 }}
            className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center z-10 backdrop-blur-xl border ${
              isAiSpeaking ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 border-white/30' : isUserSpeaking ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 border-white/30' : 'bg-white/5 border-white/10'
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : isAiSpeaking ? (
              <Activity className="w-12 h-12 text-white animate-pulse" />
            ) : isUserSpeaking ? (
              <Mic className="w-10 h-10 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-10 h-10 text-neutral-400" />
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-40 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs max-w-sm text-center backdrop-blur-md">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* نمایش زیرنویس */}
        <div className="absolute bottom-40 w-full max-w-xl px-6 text-center h-24 flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {transcript.length > 0 && (
              <motion.div 
                key={transcript.length}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={`text-[15px] md:text-lg font-medium leading-relaxed drop-shadow-md ${transcript[transcript.length - 1].role === 'user' ? 'text-blue-300' : 'text-fuchsia-300'}`}
              >
                "{transcript[transcript.length - 1].text}"
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="w-full pb-8 pt-4 px-4 flex flex-col items-center z-20 bg-gradient-to-t from-[#050014] via-[#050014]/90 to-transparent">
        
        {/* انتخاب مدل صدا */}
        <AnimatePresence>
          {!isUserSpeaking && !isConnecting && !isAiSpeaking && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className="w-full max-w-2xl mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Select Voice Model</span>
              </div>
              <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-2 snap-x snap-mandatory">
                {VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`snap-center shrink-0 w-36 p-3 rounded-2xl border text-left transition-all duration-300 ${
                      selectedVoice === voice.id ? 'bg-white/10 border-fuchsia-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)]' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-bold ${selectedVoice === voice.id ? 'text-white' : 'text-neutral-300'}`}>{voice.name}</span>
                      {selectedVoice === voice.id && <Sparkles className="w-3 h-3 text-fuchsia-400 animate-pulse" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium block">{voice.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* دکمه میکروفون Walkie-Talkie */}
        <div className="flex justify-center w-full">
          {isUserSpeaking ? (
            <button 
              onClick={stopListening}
              className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center transition-all shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 animate-pulse"
            >
              <Square className="w-6 h-6 text-white fill-white" />
            </button>
          ) : (
            <button 
              onClick={startListening}
              disabled={isConnecting || isAiSpeaking}
              className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 relative group"
            >
              {isConnecting ? <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" /> : <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />}
              {!isConnecting && !isAiSpeaking && (
                <div className="absolute inset-0 rounded-full border border-fuchsia-500/50 animate-ping group-hover:hidden" />
              )}
            </button>
          )}
        </div>
        <p className="text-[10px] text-neutral-500 mt-4 tracking-widest uppercase font-mono">Tap to talk • Auto Saves to Chat</p>
      </footer>
    </div>
  );
}