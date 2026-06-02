"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Image as ImageIcon, Code2, Globe, 
  User, Bot, Loader2, ArrowLeft, Terminal
} from 'lucide-react';
import Link from 'next/link';

// انواع پیام‌ها
type MessageType = 'text' | 'image' | 'code';
type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  type: MessageType;
}

export default function NeuralChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'به SAFI Neural Chat خوش آمدید. من دستیار هوشمند شما هستم. آیا می‌خواهید کُد بنویسیم، متن تولید کنیم یا تصویر خلق کنیم؟',
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'code' | 'image' | 'search'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // اسکرول خودکار به پایین بعد از هر پیام جدید
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // هندل کردن ارسال پیام
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: input,
      type: 'text'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // در اینجا درخواست به بک‌اَند ارسال می‌شود (route.ts که قبلاً ساختیم)
      // category بر اساس activeMode تنظیم می‌شود تا بک‌اَند بفهمد باید چه مدلی را صدا بزند
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123', // این باید از سیستم احراز هویت (Auth) شما بیاید
          pricingId: activeMode === 'image' ? 'id_مدل_عکس' : 'id_مدل_متن', // آیدی مدل‌ها در دیتابیس
          inputData: { prompt: newUserMessage.content }
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'خطا در ارتباط با هسته SAFI');

      const botMsgId = (Date.now() + 1).toString();
      
      // تنظیم نوع خروجی بر اساس مود انتخابی
      let messageType: MessageType = 'text';
      if (activeMode === 'image') messageType = 'image';
      if (activeMode === 'code') messageType = 'code';

      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'assistant',
        content: data.outputUrl || data.text || 'پردازش با موفقیت انجام شد.',
        type: messageType
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ اخطار سیستمی: ${error.message}`,
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // حالت‌های مختلف ابزار
  const modes = [
    { id: 'chat', icon: <Sparkles className="w-4 h-4" />, label: 'Neural Chat' },
    { id: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Code Engine' },
    { id: 'image', icon: <ImageIcon className="w-4 h-4" />, label: 'Imagine' },
    { id: 'search', icon: <Globe className="w-4 h-4" />, label: 'Web Search' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#020202] text-slate-100 font-sans selection:bg-[#FAD961] selection:text-black">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
              SAFI <span className="text-[#D4AF37]">Neural</span> Chat
            </h1>
            <p className="text-xs font-bold tracking-widest text-neutral-500 uppercase">Powered by xAI Core</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 bg-[#111] border border-green-500/20 rounded-full text-xs font-mono text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> CORE ONLINE
          </span>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar relative">
        {/* Background Logo Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
          <Sparkles className="w-96 h-96 text-[#FAD961]" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#FAD961] to-[#D4AF37] border-[#FFF8D6]/50 text-black' 
                    : 'bg-[#111] border-white/10 text-[#FAD961]'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-5 shadow-xl ${
                  msg.role === 'user'
                    ? 'bg-[#111] border border-[#D4AF37]/20 text-white rounded-tr-none'
                    : 'bg-[#0A0A0A] border border-white/5 text-neutral-200 rounded-tl-none'
                }`}>
                  
                  {/* رندر کردن محتوا بر اساس نوع */}
                  {msg.type === 'text' && (
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                  )}

                  {msg.type === 'code' && (
                    <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden font-mono text-sm mt-2">
                      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-neutral-400">
                        <span className="flex items-center gap-2"><Terminal className="w-4 h-4"/> Snippet</span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-green-400">
                        <code>{msg.content}</code>
                      </pre>
                    </div>
                  )}

                  {msg.type === 'image' && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-[#050505]">
                      <img src={msg.content} alt="SAFI AI Generated" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 text-[#FAD961] flex items-center justify-center shadow-lg">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl rounded-tl-none p-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <footer className="p-4 md:p-6 bg-gradient-to-t from-[#020202] to-transparent z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Mode Selector */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeMode === mode.id
                    ? 'bg-[#FAD961] text-black border-[#FAD961] shadow-[0_0_15px_rgba(250,217,97,0.3)]'
                    : 'bg-[#111] text-neutral-400 border-white/5 hover:bg-white/5 hover:text-white'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="relative flex items-end bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl focus-within:border-[#D4AF37]/50 focus-within:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all overflow-hidden">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeMode === 'chat' ? "پیام خود را بنویسید..." :
                activeMode === 'code' ? "چه کدی برایتان بنویسم؟..." :
                activeMode === 'image' ? "تصویر دلخواه خود را توصیف کنید..." :
                "در وب جستجو کنید..."
              }
              className="w-full max-h-48 min-h-[60px] bg-transparent text-white p-5 pr-16 resize-none focus:outline-none custom-scrollbar text-sm md:text-base"
              rows={1}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className={`absolute bottom-3 right-3 p-3 rounded-2xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping
                  ? 'bg-gradient-to-br from-[#FAD961] to-[#D4AF37] text-black shadow-lg hover:scale-105'
                  : 'bg-white/5 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-[10px] text-neutral-600 font-mono">SAFI NEURAL ENGINE V4.0 - PROCESSED IN SECURE ENVIRONMENT</p>
          </div>
        </div>
      </footer>

      {/* اضافه کردن استایل‌های اسکرول بار داخل صفحه برای زیبایی */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}