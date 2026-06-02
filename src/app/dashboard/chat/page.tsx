"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Image as ImageIcon, Code2, Globe, 
  User, Bot, Loader2, ArrowLeft, Terminal, MessageSquare, Plus, Menu, X, PanelLeftClose, PanelLeft
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase'; // مسیر اتصال به سوپابیس خود را چک کنید

type MessageType = 'text' | 'image' | 'code';
type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  type: MessageType;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export default function NeuralChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'code' | 'image' | 'search'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // ==========================================
  // FETCH CHATS FROM SUPABASE ON MOUNT
  // ==========================================
  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        // دریافت چت‌های قبلی از دیتابیس
        const { data: savedSessions, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (savedSessions && savedSessions.length > 0) {
          // تبدیل دیتای دیتابیس به فرمت استیت کلاینت
          const formattedSessions: ChatSession[] = savedSessions.map(dbSession => ({
            id: dbSession.id,
            title: dbSession.title,
            messages: dbSession.messages || [],
            updatedAt: dbSession.updated_at
          }));
          setSessions(formattedSessions);
          setActiveSessionId(formattedSessions[0].id);
        } else {
          // اگر کاربر جدید بود و چتی نداشت، یک چت خالی برایش می‌سازیم
          const newSessionId = `session_${Date.now()}`;
          const initialSession: ChatSession = {
            id: newSessionId,
            title: 'New Conversation',
            messages: [],
            updatedAt: Date.now()
          };
          setSessions([initialSession]);
          setActiveSessionId(initialSession.id);
          
          await supabase.from('chat_sessions').insert({
            id: initialSession.id,
            user_id: user.id,
            title: initialSession.title,
            messages: initialSession.messages,
            updated_at: initialSession.updatedAt
          });
        }
      }
      setIsLoadingChats(false);
    };

    initializeChat();
  }, []);

  // ==========================================
  // CREATE NEW CHAT SESSION
  // ==========================================
  const createNewChat = async () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      updatedAt: Date.now()
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    // ذخیره سشن جدید در دیتابیس
    if (userId) {
      await supabase.from('chat_sessions').insert({
        id: newSession.id,
        user_id: userId,
        title: newSession.title,
        messages: newSession.messages,
        updated_at: newSession.updatedAt
      });
    }
  };

  // ==========================================
  // UPDATE SESSION & SAVE TO DB
  // ==========================================
  const updateActiveSession = async (newMessages: Message[], autoTitle?: string) => {
    if (!activeSession) return;
    
    const timestamp = Date.now();
    // اگر چت تازه شروع شده، تایتل را بر اساس پرامپت کاربر تغییر می‌دهیم
    const newTitle = (autoTitle && activeSession.messages.length === 0) ? autoTitle : activeSession.title;

    const updatedSession: ChatSession = {
      ...activeSession,
      messages: newMessages,
      title: newTitle,
      updatedAt: timestamp
    };

    // آپدیت UI
    setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));

    // آپدیت Database (از upsert استفاده می‌کنیم تا جلوی خطاهای احتمالی را بگیریم)
    if (userId) {
      await supabase.from('chat_sessions').upsert({
        id: updatedSession.id,
        user_id: userId,
        title: updatedSession.title,
        messages: updatedSession.messages,
        updated_at: updatedSession.updatedAt
      });
    }
  };

  // ==========================================
  // SEND MESSAGE LOGIC
  // ==========================================
  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: input,
      type: 'text'
    };

    const updatedMessages = [...messages, newUserMessage];
    const autoTitle = input.length > 25 ? input.substring(0, 25) + '...' : input;
    
    // ذخیره پیام کاربر
    await updateActiveSession(updatedMessages, autoTitle);
    
    setInput('');
    setIsTyping(true);

    try {
      const targetModel = activeMode === 'image' ? 'grok-imagine-image' : 'grok-4.3';

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous', 
          modelName: targetModel,
          inputData: { prompt: newUserMessage.content, aspectRatio: '16:9' }
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Processing Error');

      const botMsgId = (Date.now() + 1).toString();
      
      let messageType: MessageType = 'text';
      if (activeMode === 'image') messageType = 'image';
      if (activeMode === 'code') messageType = 'code';

      // ذخیره پاسخ هوش مصنوعی در دیتابیس
      await updateActiveSession([...updatedMessages, {
        id: botMsgId,
        role: 'assistant',
        content: data.outputUrl || data.text || 'Operation completed successfully.',
        type: messageType
      }]);

    } catch (error: any) {
      // ذخیره ارور به عنوان پیام سیستم
      await updateActiveSession([...updatedMessages, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ System Alert: ${error.message}`,
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

  const modes = [
    { id: 'chat', icon: <Sparkles className="w-4 h-4" />, label: 'Neural Chat' },
    { id: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Code Engine' },
    { id: 'image', icon: <ImageIcon className="w-4 h-4" />, label: 'Imagine' },
    { id: 'search', icon: <Globe className="w-4 h-4" />, label: 'Web Search' },
  ];

  if (isLoadingChats) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020202]">
        <Sparkles className="w-12 h-12 text-[#FAD961] animate-pulse mb-4" />
        <p className="text-neutral-500 text-sm font-bold tracking-[0.2em] uppercase">Loading Neural Links...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#020202] text-slate-100 font-sans selection:bg-[#FAD961] selection:text-black overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#FAD961]/5 rounded-full blur-[120px]" />
      </div>

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <aside 
        className={`absolute md:relative z-40 h-full bg-[#050505]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 overflow-hidden border-none'
        }`}
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center min-w-[18rem]">
          <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button onClick={createNewChat} className="flex-1 ml-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 text-white text-sm font-medium py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
            <Plus className="w-4 h-4 text-[#FAD961]" /> New Chat
          </button>
          
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-2 p-2 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-w-[18rem]">
          <h3 className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest pl-2 mb-3 mt-2">Chat History</h3>
          {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
            <button
              key={session.id}
              onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full text-left px-3 py-3 rounded-xl text-sm flex items-center gap-3 transition-all truncate ${
                activeSessionId === session.id 
                  ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] text-white shadow-inner' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeSessionId === session.id ? 'text-[#FAD961]' : ''}`} />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ==========================================
          MAIN CHAT AREA
      ========================================== */}
      <div className="flex-1 flex flex-col h-full relative z-10 bg-transparent">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#0A0A0A]/60 backdrop-blur-md border-b border-white/5 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 hidden md:block" /> : <PanelLeft className="w-5 h-5 hidden md:block" />}
              <Menu className="w-6 h-6 md:hidden" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2">
                SAFI <span className="text-[#D4AF37]">Neural</span> Chat
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Core Online
              </p>
            </div>
          </div>
        </header>

        {/* MESSAGES */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth custom-scrollbar relative z-10">
          
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60">
              <Sparkles className="w-20 h-20 text-[#D4AF37] mb-6 animate-pulse" />
              <h2 className="text-2xl font-black tracking-widest text-white uppercase">SAFI AI</h2>
              <p className="text-sm font-medium text-neutral-400 mt-2">How can I assist you today?</p>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 relative z-20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-[#FAD961] to-[#D4AF37] border-[#FFF8D6]/50 text-black' 
                      : 'bg-[#111] border-white/10 text-[#FAD961]'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                  </div>

                  <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-5 shadow-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#151515] border border-white/10 text-white rounded-tr-none'
                      : 'bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#D4AF37]/20 text-neutral-200 rounded-tl-none'
                  }`}>
                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                    )}

                    {msg.type === 'code' && (
                      <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden font-mono text-sm mt-3 shadow-inner">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-neutral-400">
                          <span className="flex items-center gap-2"><Terminal className="w-4 h-4"/> Snippet</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-emerald-400">
                          <code>{msg.content}</code>
                        </pre>
                      </div>
                    )}

                    {msg.type === 'image' && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#050505] shadow-lg">
                        <img src={msg.content} alt="SAFI AI Generated" className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/10 text-[#FAD961] flex items-center justify-center shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl rounded-tl-none p-5 flex items-center gap-2 shadow-2xl">
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
        <footer className="p-4 md:p-6 bg-gradient-to-t from-[#020202] via-[#020202] to-transparent z-20">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                    activeMode === mode.id
                      ? 'bg-[#FAD961] text-black border-[#FAD961] shadow-[0_0_15px_rgba(250,217,97,0.3)]'
                      : 'bg-[#111] text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-end bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl focus-within:border-[#D4AF37]/50 focus-within:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all overflow-hidden group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeMode === 'chat' ? "Type your message here..." :
                  activeMode === 'code' ? "What should I code for you?..." :
                  activeMode === 'image' ? "Describe your imagination..." :
                  "Search the web..."
                }
                className="w-full max-h-48 min-h-[60px] bg-transparent text-white p-5 pr-16 resize-none focus:outline-none custom-scrollbar text-sm md:text-base leading-relaxed"
                rows={1}
                dir="auto"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className={`absolute bottom-3 right-3 p-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  input.trim() && !isTyping
                    ? 'bg-gradient-to-br from-[#FAD961] to-[#D4AF37] text-black shadow-lg hover:scale-105'
                    : 'bg-white/5 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 mr-0.5" />
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
                SAFI Neural Engine V4.0 • Processed in Secure Environment
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}