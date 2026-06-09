"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Terminal, Globe, Loader2, ArrowLeft, Plus, Menu, 
  X, PanelLeftClose, PanelLeft, Copy, Check, ShieldAlert,
  Search, Compass, Cpu, Layers, Radio, ExternalLink, MessageSquare, Trash2, MoreVertical, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  is_pinned?: boolean;
  updatedAt: string;
}

// 🟢 موتور تجزیه متن مارک‌داون برای نمایش زیبای گزارش‌ها
const SearchReportContent = ({ content }: { content: string }) => {
  return (
    <div className="text-[14px] md:text-[15px] leading-relaxed font-sans text-slate-200 space-y-4">
      <span className="whitespace-pre-wrap leading-loose">{content}</span>
    </div>
  );
};

export default function SearchAgentPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]); 
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  // 🟢 استیت‌های مربوط به پاپ‌آپ وضعیت ایجنت (Agent Processing Modals)
  const [agentStep, setAgentStep] = useState<number>(0);
  const [showAgentConsole, setShowAgentConsole] = useState<boolean>(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    
    const initializeSearchAgent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // دریافت سشن‌های قبلی
        const { data: savedSessions } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        const newSessionId = `search_session_${Date.now()}`;
        const nowISO = new Date().toISOString();
        const initialSession = { id: newSessionId, title: 'Deep Web Scan', updatedAt: nowISO, is_pinned: false };
        
        let formattedSessions: ChatSession[] = [];
        if (savedSessions && savedSessions.length > 0) {
          formattedSessions = savedSessions.map(dbSession => ({ 
            id: dbSession.id, title: dbSession.title, is_pinned: dbSession.is_pinned, updatedAt: dbSession.updated_at 
          }));
        }

        setSessions([initialSession, ...formattedSessions]);
        setActiveSessionId(initialSession.id);
      }
      setIsLoadingChats(false);
    };
    initializeSearchAgent();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) return;
      setMessages([]); 
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true });
        
      if (data && !error) {
        setMessages(data.map(msg => ({ 
          id: msg.id, role: msg.role as Role, content: msg.content, created_at: msg.created_at 
        })));
      }
    };
    fetchMessages();
  }, [activeSessionId]);

  const createNewWorkspace = async () => {
    if (!userId) return;
    const nowISO = new Date().toISOString();
    const newSession = { id: `search_session_${Date.now()}`, title: 'Deep Web Scan', updatedAt: nowISO, is_pinned: false };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = async (id: string) => {
    await supabase.from('chat_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id || '');
    setDropdownOpenId(null);
  };

  // 🟢 هندلر ارایه اطلاعات و مدیریت استریمینگ بومی xAI
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || !userId || !activeSessionId) return;

    const currentTimeISO = new Date().toISOString();
    const userMsgId = `msg_${Date.now()}`;
    const currentInput = input;
    
    const newUserMessage: Message = { 
      id: userMsgId, role: 'user', content: currentInput, created_at: currentTimeISO
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    
    // ۱. شبیه‌سازی مراحل پاپ‌آپ ایجنت قبل از شروع استریم متن
    setShowAgentConsole(true);
    setAgentStep(1);
    setAgentLogs(["[SYSTEM] Initializing SAFI Neural Search Protocol..."]);
    
    setTimeout(() => {
      setAgentStep(2);
      setAgentLogs(prev => [...prev, "[AGENT] Deploying web crawlers to global networks...", "[SEARCH] Querying Google, Bing and X platform databases..."]);
    }, 1200);

    setTimeout(() => {
      setAgentStep(3);
      setAgentLogs(prev => [...prev, "[SCRAPE] Extracting raw HTML content from verified nodes...", "[ANALYZE] Deep parsing text matrices and removing telemetry noise..."]);
    }, 2600);

    setTimeout(() => {
      setAgentStep(4);
      setAgentLogs(prev => [...prev, "[SYNTHESIS] Cross-referencing citations...", "[SYSTEM] Siphoning data stream directly to workspace interface..."]);
    }, 4000);

    // ۲. ذخیره پیام کاربر در دیتابیس
    await supabase.from('chat_messages').insert({
      id: userMsgId,
      session_id: activeSessionId,
      role: 'user',
      content: currentInput,
      type: 'text'
    });

    let autoTitle = '';
    if (messages.length === 0) autoTitle = currentInput.length > 25 ? currentInput.substring(0, 25) + '...' : currentInput;
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updatedAt: currentTimeISO, title: autoTitle || s.title } : s));

    if (autoTitle) {
      await supabase.from('chat_sessions').upsert({
        id: activeSessionId,
        user_id: userId,
        title: autoTitle,
        updated_at: currentTimeISO
      });
    } else {
      await supabase.from('chat_sessions').update({ updated_at: currentTimeISO }).eq('id', activeSessionId);
    }

    const historyForAPI = messages.map(m => ({ role: m.role, content: m.content }));
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/generate/search', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          inputData: { prompt: currentInput, messages: historyForAPI } 
        })
      });

      if (!response.ok) throw new Error('API request failed');

      // پنهان کردن پاپ‌آپ ایجنت و باز کردن فضای نوشتن استریم
      setShowAgentConsole(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Stream reader not available");

      const botMsgId = `msg_${Date.now()}`;
      let accumulatedText = "";

      // ایجاد سطر خالی برای پیام هوش مصنوعی که پر خواهد شد
      setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: "", created_at: new Date().toISOString() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // پارس کردن پکت‌های ارسالی سیستم Event-Stream
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              const contentToken = parsed.choices[0]?.delta?.content || "";
              accumulatedText += contentToken;

              // آپدیت آنی و زنده پیام روی صفحه (سرعت نیم‌ثانیه‌ای)
              setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: accumulatedText } : m));
            } catch (e) {
              // در صورتی که تکه متنی خام باشد
              if (!dataStr.startsWith('{')) {
                accumulatedText += dataStr;
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: accumulatedText } : m));
              }
            }
          }
        }
      }

      // ۳. ثبت نهایی متن کامل استریم شده در دیتابیس پس از پایان پردازش
      await supabase.from('chat_messages').insert({
        id: botMsgId,
        session_id: activeSessionId,
        role: 'assistant',
        content: accumulatedText,
        type: 'text'
      });

    } catch (error: any) {
      setShowAgentConsole(false);
      const errorMsg: Message = { 
        id: `err_${Date.now()}`, role: 'assistant', content: `مشکل سیستم در پردازش درخواست، لطفاً لحظاتی دیگر تلاش کنید.`, 
        created_at: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMsg]);
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

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#030611] text-slate-100 font-sans selection:bg-blue-600/40 h-[100dvh] overflow-hidden">
      
      {/* امواج و هاله‌های نوری تم تمام آبی کهکشان */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-70">
        <div className="absolute w-[900px] h-[900px] bg-blue-600/10 rounded-full blur-[160px] top-[-30%] left-[-20%] animate-[pulse_7s_ease-in-out_infinite]" />
        <div className="absolute w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[140px] bottom-[-20%] right-[-10%] animate-[pulse_9s_ease-in-out_infinite]" />
      </div>

      {/* سایدبار کنترل تاریخچه سرچ‌ها */}
      <aside className={`absolute md:relative z-40 h-full bg-[#02040a]/95 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden border-r border-blue-950/40 shadow-2xl ${isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 border-none opacity-0'}`}>
        <div className="p-4 border-b border-blue-950/40 flex justify-between items-center w-[280px] shrink-0">
          <Link className="w-10 h-10 bg-blue-950/40 hover:bg-blue-900/40 rounded-xl flex items-center justify-center transition-colors border border-blue-900/30 text-blue-400" href="/dashboard">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <button onClick={createNewWorkspace} className="flex-1 ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(37,99,235,0.3)]">
            <Plus className="w-4 h-4"/> Deep Scan
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-10 h-10 ml-2 bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-400">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar w-[280px] shrink-0">
          <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-2 mb-4 mt-2">Search Archives</h3>
          {sessions.map(session => (
            <div key={session.id} className="relative group/item">
              <button 
                onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
                className={`w-full text-left px-3 py-3.5 rounded-xl text-sm flex items-center justify-between transition-all duration-300 group ${activeSessionId === session.id ? 'bg-gradient-to-r from-blue-950/70 to-blue-900/30 text-blue-100 border border-blue-800/50' : 'text-neutral-500 hover:bg-blue-950/20 border border-transparent'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${activeSessionId === session.id ? 'bg-blue-500 text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-neutral-500'}`}>
                    <Search className="w-4 h-4"/>
                  </div>
                  <span className="truncate text-[12.5px] font-medium">{session.title}</span>
                </div>
              </button>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                <button onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === session.id ? null : session.id); }} className="p-2 text-blue-400 bg-[#02040a] rounded-lg border border-blue-900/50">
                  <MoreVertical className="w-4 h-4"/>
                </button>
                {dropdownOpenId === session.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-[#02040a] border border-blue-900/50 rounded-xl shadow-2xl py-2 z-[60]">
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5">
                      <Trash2 className="w-3.5 h-3.5"/> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* باکس چت اصلی محیط سرچ */}
      <div className="flex-1 flex flex-col h-[100dvh] relative z-10 min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#030611]/80 backdrop-blur-2xl border-b border-blue-950/40 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-10 h-10 flex items-center justify-center text-blue-400 bg-blue-950/30 rounded-xl border border-blue-900/30 active:scale-95">
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 hidden md:block"/> : <PanelLeft className="w-5 h-5 hidden md:block"/>}
              <Menu className="w-5 h-5 md:hidden"/>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Globe className="w-5 h-5 text-white animate-spin-slow"/>
              </div>
              <div>
                <h1 className="text-[15px] md:text-[16px] font-black tracking-wide text-white leading-tight">SAFI Web Agent</h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-blue-400 uppercase flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]" /> Live Crawling Engine
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar relative z-10 pb-6">
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90 px-4 text-center pointer-events-none pb-[10dvh]">
              <div className="w-24 h-24 rounded-full bg-blue-950/40 flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)] relative">
                <Compass className="w-12 h-12 text-blue-400 relative z-10 animate-pulse"/>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">Deep Web Reconnaissance</h2>
              <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">Enter any query or website domain. The agent will crawl global intelligence matrixes from 0 to 100.</p>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 relative z-20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-md ${msg.role === 'user' ? 'bg-neutral-800 text-neutral-300' : 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}>
                      {msg.role === 'user' ? 'U' : <Sparkles className="w-3.5 h-3.5"/>}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-neutral-400' : 'text-blue-400'}`}>{msg.role === 'user' ? 'You' : 'SAFI Web Agent'}</span>
                  </div>
                  <div className={`pl-[3.25rem] pr-4 ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-100 bg-blue-950/10 border border-blue-900/20 p-5 rounded-2xl backdrop-blur-sm'}`}>
                    <SearchReportContent content={msg.content} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && !showAgentConsole && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">Streaming Intelligence Network Data...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        {/* 🟢 پاپ‌آپ وضعیت اجرای ایجنت فوق‌حرفه‌ای (Agent Console Overlay) */}
        <AnimatePresence>
          {showAgentConsole && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="w-full max-w-xl bg-[#050914] border border-blue-900/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-[pulse_2s_infinite]" />
                
                <div className="flex items-center gap-3 mb-6">
                  <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
                  <h3 className="text-md font-black font-mono uppercase tracking-widest text-white">Neural Web Scrutiny Console</h3>
                </div>

                {/* استپ‌ها */}
                <div className="space-y-4 mb-6">
                  {[
                    { step: 1, label: "Analyzing Target Scope & Directives", icon: <Cpu/> },
                    { step: 2, label: "Querying Multi-Index Cloud Arrays", icon: <Search/> },
                    { step: 3, label: "Scraping Raw Data Matrix Blocks", icon: <Layers/> },
                    { step: 4, label: "Synthesizing Core Executive Summary", icon: <Sparkles/> }
                  ].map((s) => (
                    <div key={s.step} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 ${agentStep >= s.step ? 'bg-blue-950/30 border-blue-800/60 text-white' : 'bg-transparent border-neutral-900 text-neutral-600'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agentStep === s.step ? 'bg-blue-500 text-black animate-spin-slow' : agentStep > s.step ? 'bg-blue-950 text-blue-400' : 'bg-neutral-900'}`}>
                        {agentStep > s.step ? <Check className="w-4 h-4"/> : React.cloneElement(s.icon, { className: "w-4 h-4" })}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider font-mono">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* بخش لایو ترمینال لاگ */}
                <div className="bg-black/60 rounded-xl p-4 font-mono text-[11px] text-blue-400 h-32 overflow-y-auto space-y-1 custom-scrollbar border border-neutral-900">
                  {agentLogs.map((log, idx) => <div key={idx} className="leading-relaxed">{log}</div>)}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="p-4 md:p-6 bg-[#030611] border-t border-blue-950/40 z-20 shrink-0">
          <div className="max-w-4xl mx-auto w-full relative">
            <div className="flex flex-col bg-[#060a17] border border-blue-900/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 rounded-2xl transition-all duration-300 overflow-hidden">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder="Enter a complex topic, question, or website URL..." 
                className="w-full max-h-64 min-h-[56px] bg-transparent text-white px-5 py-4 resize-none focus:outline-none custom-scrollbar text-sm leading-relaxed placeholder:text-neutral-600 font-sans" 
                rows={1} 
                dir="auto" 
              />
              <div className="flex justify-between items-center px-4 pb-3 pt-1 bg-[#060a17]">
                <span className="text-[10px] text-blue-800 font-black tracking-widest uppercase font-mono">
                  Deep Agent Search Modality Active
                </span>
                <button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isTyping} 
                  className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${input.trim() && !isTyping ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 active:scale-95 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-neutral-800'}`}
                >
                  Scan Web <Send className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}