"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Image as ImageIcon, Code2, Globe, 
  User, Bot, Loader2, ArrowLeft, Terminal, MessageSquare, Plus, Menu, X, PanelLeftClose, PanelLeft, Download, Paperclip
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

type MessageType = 'text' | 'image' | 'code';
type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  type: MessageType;
  imageUrl?: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'code' | 'image' | 'search'>('chat');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  // ==========================================
  // FETCH CHATS FROM SUPABASE (کاملاً سینک شده با دیتابیس)
  // ==========================================
  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        const { data: savedSessions, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (savedSessions && savedSessions.length > 0) {
          const formattedSessions: ChatSession[] = savedSessions.map(dbSession => ({
            id: dbSession.id,
            title: dbSession.title,
            messages: dbSession.messages || [],
            updatedAt: dbSession.updated_at
          }));
          setSessions(formattedSessions);
          setActiveSessionId(formattedSessions[0].id);
        } else {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload a valid image file.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-chat-img-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('ai_assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from('ai_assets')
        .getPublicUrl(fileName);

      setUploadedImage(publicData.publicUrl);
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  const updateActiveSession = async (newMessages: Message[], autoTitle?: string) => {
    if (!activeSession) return;
    
    const timestamp = Date.now();
    const newTitle = (autoTitle && activeSession.messages.length === 0) ? autoTitle : activeSession.title;

    const updatedSession: ChatSession = {
      ...activeSession,
      messages: newMessages,
      title: newTitle,
      updatedAt: timestamp
    };

    setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));

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

  const handleSendMessage = async () => {
    if ((!input.trim() && !uploadedImage) || isTyping) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: input || 'Uploaded an image',
      type: 'text',
      imageUrl: uploadedImage || undefined
    };

    const updatedMessages = [...messages, newUserMessage];
    const autoTitle = input.length > 25 ? input.substring(0, 25) + '...' : (input || 'Image Analysis');
    
    await updateActiveSession(updatedMessages, autoTitle);
    
    const payloadImageUrl = uploadedImage;
    setInput('');
    setUploadedImage(null);
    setIsMenuOpen(false);
    setIsTyping(true);

    try {
      // انتخاب مدل سرور بر اساس قابلیتی که کاربر انتخاب کرده است
      const targetModel = activeMode === 'image' ? 'grok-imagine-image' : 'grok-4.3';

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous', 
          modelName: targetModel,
          inputData: { prompt: newUserMessage.content, aspectRatio: '16:9', imageUrl: payloadImageUrl }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Processing Error');
      }

      const botMsgId = (Date.now() + 1).toString();
      let messageType: MessageType = 'text';
      if (activeMode === 'image') messageType = 'image';
      if (activeMode === 'code') messageType = 'code';

      await updateActiveSession([...updatedMessages, {
        id: botMsgId,
        role: 'assistant',
        content: data.outputUrl || data.text || 'Operation completed successfully.',
        type: messageType
      }]);

    } catch (error: any) {
      let finalErrorMessage = "An unexpected error occurred.";
      const rawError = (error.message || "").toLowerCase();

      if (rawError.includes('x.ai') || rawError.includes('credits or licenses') || rawError.includes('permission') || rawError.includes('403')) {
        finalErrorMessage = "A system error has occurred. Please try again in a few moments.";
      } else if (rawError.includes('insufficient') || rawError.includes('plan') || rawError.includes('quota') || rawError.includes('balance')) {
        finalErrorMessage = "You do not have an active plan. Please upgrade to continue.";
      } else {
        finalErrorMessage = error.message;
      }

      await updateActiveSession([...updatedMessages, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ ${finalErrorMessage}`,
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
    { id: 'chat', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Chat' },
    { id: 'code', icon: <Code2 className="w-3.5 h-3.5" />, label: 'Code' },
    { id: 'image', icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Image' },
    { id: 'search', icon: <Globe className="w-3.5 h-3.5" />, label: 'Search' },
  ];

  if (isLoadingChats) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050014]">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center animate-pulse mb-4 shadow-[0_0_40px_rgba(167,139,250,0.5)]">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-white text-xs font-bold tracking-[0.2em] uppercase">Initializing Core...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#050014] text-slate-100 font-sans selection:bg-fuchsia-500 selection:text-white h-[100dvh] overflow-hidden">
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      <aside className={`absolute md:relative z-40 h-full bg-[#0A051A]/95 backdrop-blur-2xl border-white/5 flex flex-col transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-hidden ${
          isSidebarOpen ? 'w-64 md:w-72 translate-x-0 border-r' : 'w-0 -translate-x-full md:translate-x-0 md:border-none'
        }`}>
        <div className="p-4 border-b border-white/5 flex justify-between items-center w-64 md:w-72 shrink-0">
          <Link href="/dashboard" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors border border-white/5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button onClick={createNewChat} className="flex-1 ml-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold py-2.5 px-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)]">
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-9 h-9 ml-2 bg-white/5 rounded-full flex items-center justify-center text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar w-64 md:w-72 shrink-0">
          <h3 className="text-[10px] font-black text-fuchsia-400/80 uppercase tracking-widest pl-2 mb-3 mt-2">Chat History</h3>
          {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
            <button
              key={session.id}
              onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full text-left px-3 py-3 rounded-2xl text-sm flex items-center gap-3 transition-all truncate group ${
                activeSessionId === session.id 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeSessionId === session.id ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <span className="truncate text-[13px] font-medium">{session.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-[100dvh] relative z-10 bg-transparent min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-3.5 bg-[#050014]/60 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 hidden md:block" /> : <PanelLeft className="w-4 h-4 hidden md:block" />}
              <Menu className="w-4 h-4 md:hidden" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-black tracking-wide text-white leading-tight">SAFI Neural</h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" /> Active
                </p>
              </div>
            </div>
          </div>
          
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all"
            >
              <Download className="w-3 h-3" /> Install App
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10 pb-4" onClick={() => setIsMenuOpen(false)}>
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 px-4 text-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center mb-5 border border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.2)]">
                <Bot className="w-10 h-10 text-fuchsia-400" />
              </div>
              <h2 className="text-2xl font-black tracking-wider text-white mb-2">How can I help?</h2>
              <p className="text-sm font-medium text-neutral-400 max-w-sm">I am your highly advanced AI assistant. Ask me anything, generate images, or upload a photo to analyze.</p>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-6 relative z-20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 border-white/20 text-white' 
                      : 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 border-white/20 text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                  </div>

                  <div className={`max-w-[85%] rounded-[1.5rem] p-4 shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600/90 to-violet-600/90 border border-white/10 text-white rounded-tr-sm'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-neutral-100 rounded-tl-sm'
                  }`}>
                    
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="User Upload" className="max-w-xs w-full h-auto rounded-xl mb-3 object-cover border border-white/20 shadow-md" />
                    )}

                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                    )}

                    {msg.type === 'code' && (
                      <div className="bg-[#03000A] rounded-xl border border-white/10 overflow-hidden font-mono text-xs mt-3 shadow-inner">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-neutral-400">
                          <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-fuchsia-400 font-bold"><Terminal className="w-3 h-3"/> Code Snippet</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-cyan-300">
                          <code>{msg.content}</code>
                        </pre>
                      </div>
                    )}

                    {msg.type === 'image' && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-[#03000A] shadow-md">
                        <img src={msg.content} alt="SAFI AI Generated" className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-white/20 text-white flex items-center justify-center shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-xl h-12">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-3 md:p-5 bg-gradient-to-t from-[#050014] via-[#050014] to-transparent z-20 shrink-0">
          <div className="max-w-3xl mx-auto relative w-full">
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-[4.5rem] left-2 bg-[#0A051A]/95 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-44 z-50"
                >
                  <button
                    onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all text-fuchsia-400 hover:bg-fuchsia-500/10 mb-1 pb-3 border-b border-white/5 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Upload Image
                  </button>
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => { setActiveMode(mode.id as any); setIsMenuOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all ${
                        activeMode === mode.id
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {mode.icon} {mode.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* نشانگر قابلیت بالای چت‌بار */}
            <AnimatePresence>
              {activeMode !== 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-10 left-3 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 text-fuchsia-300 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 backdrop-blur-md shadow-lg z-30"
                >
                  {modes.find(m => m.id === activeMode)?.icon}
                  {modes.find(m => m.id === activeMode)?.label} Mode Active
                  <button onClick={() => setActiveMode('chat')} className="ml-1 bg-black/30 rounded-full p-0.5 hover:bg-black/50 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex flex-col bg-[#0A051A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_30px_rgba(217,70,239,0.15)] transition-all group p-1.5">
              
              {/* پیش‌نمایش عکس آپلود شده (داخل کادر چت‌بار) */}
              <AnimatePresence>
                {uploadedImage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-12 pt-1 pb-1">
                    <div className="relative inline-block">
                      <img src={uploadedImage} alt="Preview" className="h-16 w-auto rounded-lg object-cover border border-white/10 shadow-sm" />
                      <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ردیف دکمه‌ها و کادر متن */}
              <div className="flex items-end w-full relative">
                <div className="pb-0.5 pl-0.5 shrink-0">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'bg-fuchsia-600 text-white rotate-45 shadow-[0_0_10px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activeMode === 'code' ? "Describe the code you need..." :
                    activeMode === 'image' ? "Describe the image to generate..." :
                    activeMode === 'search' ? "Search the web..." :
                    "Type a message or attach an image..."
                  }
                  className="w-full max-h-32 min-h-[40px] bg-transparent text-white px-3 py-2 resize-none focus:outline-none custom-scrollbar text-sm leading-relaxed"
                  rows={1}
                  dir="auto"
                />
                
                <div className="pb-0.5 pr-0.5 shrink-0">
                  <button
                    onClick={handleSendMessage}
                    disabled={(!input.trim() && !uploadedImage) || isTyping}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      (input.trim() || uploadedImage) && !isTyping
                        ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:scale-105'
                        : 'bg-white/5 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-3 hidden md:block">
              <p className="text-[9px] text-neutral-600 font-mono tracking-widest uppercase">
                Powered by SAFI Neural Engine • End-to-End Encrypted
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217,70,239,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}