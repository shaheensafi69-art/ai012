"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Image as ImageIcon, Code2, Globe, 
  User, Bot, Loader2, ArrowLeft, Terminal, MessageSquare, Plus, Menu, X, PanelLeftClose, PanelLeft, Download, Paperclip, MoreVertical, Trash2, Edit2, Pin, CheckCircle2
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
  imageUrls?: string[]; 
  created_at?: number;
}

interface ChatSession {
  id: string;
  title: string;
  is_pinned?: boolean;
  updatedAt: number;
}

export default function NeuralChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // 🟢 استیت مجزا برای پیام‌ها جهت خواندن از دیتابیس
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const [aiModels, setAiModels] = useState<any[]>([]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'code' | 'image' | 'search'>('chat');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🟢 استیت‌های جدید برای منوی 3 نقطه
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => scrollToBottom(), [messages, isTyping]);

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
  // FETCH CHAT SESSIONS
  // ==========================================
  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        const { data: pricingData } = await supabase.from('ai_pricing').select('*').eq('is_active', true);
        if (pricingData) setAiModels(pricingData);

        const { data: savedSessions, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('is_pinned', { ascending: false }) // مرتب‌سازی پین‌ها
          .order('updated_at', { ascending: false });

        if (error) console.error("Error fetching sessions:", error);

        if (savedSessions && savedSessions.length > 0) {
          const formattedSessions: ChatSession[] = savedSessions.map(dbSession => ({
            id: dbSession.id,
            title: dbSession.title,
            is_pinned: dbSession.is_pinned,
            updatedAt: dbSession.updated_at
          }));
          setSessions(formattedSessions);
          setActiveSessionId(formattedSessions[0].id);
        } else {
          const newSessionId = `session_${Date.now()}`;
          const initialSession: ChatSession = {
            id: newSessionId,
            title: 'New Conversation',
            updatedAt: Date.now(),
            is_pinned: false
          };
          setSessions([initialSession]);
          setActiveSessionId(initialSession.id);
          
          await supabase.from('chat_sessions').insert({
            id: initialSession.id,
            user_id: user.id,
            title: initialSession.title,
            updated_at: initialSession.updatedAt
          });
        }
      }
      setIsLoadingChats(false);
    };

    initializeChat();
  }, []);

  // ==========================================
  // 🟢 FETCH MESSAGES WHEN SESSION CHANGES
  // ==========================================
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) return;
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as Role,
          content: msg.content,
          type: msg.type as MessageType,
          imageUrls: msg.image_urls || [],
          created_at: msg.created_at
        })));
      } else {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeSessionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not a valid image.`);
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-chat-img-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error } = await supabase.storage.from('ai_assets').upload(fileName, file);
        if (error) throw error;

        const { data: publicData } = supabase.storage.from('ai_assets').getPublicUrl(fileName);
        return publicData.publicUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...newImageUrls]);
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ==========================================
  // 🟢 Session Management (Create, Delete, Rename, Pin)
  // ==========================================
  const createNewChat = async () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Conversation',
      updatedAt: Date.now(),
      is_pinned: false
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    if (userId) {
      await supabase.from('chat_sessions').insert({
        id: newSession.id,
        user_id: userId,
        title: newSession.title,
        updated_at: newSession.updatedAt
      });
    }
  };

  const deleteChat = async (id: string) => {
    await supabase.from('chat_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id || '');
    setDropdownOpenId(null);
  };

  const togglePinChat = async (id: string, currentPinStatus: boolean) => {
    const newStatus = !currentPinStatus;
    await supabase.from('chat_sessions').update({ is_pinned: newStatus }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: newStatus } : s).sort((a, b) => Number(b.is_pinned || 0) - Number(a.is_pinned || 0) || b.updatedAt - a.updatedAt));
    setDropdownOpenId(null);
  };

  const saveRename = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingSessionId(null);
    setDropdownOpenId(null);
  };

  // ==========================================
  // 🟢 SEND MESSAGE & SAVE TO DB
  // ==========================================
  const handleSendMessage = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isTyping || !activeSessionId) return;

    const currentTime = Date.now();
    const userMsgId = currentTime.toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: input || 'Uploaded an image',
      type: 'text',
      imageUrls: uploadedImages.length > 0 ? [...uploadedImages] : []
    };

    // اضافه کردن به استیت پیام‌ها
    setMessages(prev => [...prev, newUserMessage]);
    
    // 🟢 ثبت پیام کاربر در دیتابیس
    await supabase.from('chat_messages').insert({
      id: userMsgId,
      session_id: activeSessionId,
      role: 'user',
      content: newUserMessage.content,
      type: 'text',
      image_urls: newUserMessage.imageUrls,
      created_at: currentTime
    });

    // آپدیت عنوان چت در اولین پیام
    let autoTitle = '';
    if (messages.length === 0 && input) {
      autoTitle = input.length > 25 ? input.substring(0, 25) + '...' : input;
    }
    
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updatedAt: currentTime, title: autoTitle || s.title } : s).sort((a, b) => Number(b.is_pinned || 0) - Number(a.is_pinned || 0) || b.updatedAt - a.updatedAt));
    await supabase.from('chat_sessions').update({ updated_at: currentTime, ...(autoTitle && { title: autoTitle }) }).eq('id', activeSessionId);

    const payloadImageUrls = [...uploadedImages];
    setInput('');
    setUploadedImages([]);
    setIsMenuOpen(false);
    setIsTyping(true);

    try {
      let categoryToSearch = 'text';
      if (activeMode === 'image') categoryToSearch = 'image';
      
      const targetModelConfig = aiModels.find(m => m.category.toLowerCase() === categoryToSearch);
      
      if (!targetModelConfig) {
        throw new Error(`The AI Engine for ${categoryToSearch} mode was not found in your database. Please check your DB settings.`);
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'anonymous', 
          pricingId: targetModelConfig.id,
          inputData: { prompt: newUserMessage.content, aspectRatio: '16:9', imageUrls: payloadImageUrls }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Processing Error');
      }

      const botTime = Date.now();
      const botMsgId = botTime.toString();
      let messageType: MessageType = 'text';
      if (activeMode === 'image') messageType = 'image';
      if (activeMode === 'code') messageType = 'code';

      const botMessage: Message = {
        id: botMsgId,
        role: 'assistant',
        content: data.outputUrl || data.text || 'Operation completed successfully.',
        type: messageType
      };

      setMessages(prev => [...prev, botMessage]);

      // 🟢 ثبت پیام هوش مصنوعی در دیتابیس
      await supabase.from('chat_messages').insert({
        id: botMsgId,
        session_id: activeSessionId,
        role: 'assistant',
        content: botMessage.content,
        type: botMessage.type,
        created_at: botTime
      });

    } catch (error: any) {
      const errorTime = Date.now();
      let finalErrorMessage = "An unexpected error occurred.";
      const rawError = (error.message || "").toLowerCase();

      if (rawError.includes('x.ai') || rawError.includes('credits or licenses') || rawError.includes('permission') || rawError.includes('403')) {
        finalErrorMessage = "A system error has occurred. Please try again in a few moments.";
      } else if (rawError.includes('insufficient') || rawError.includes('plan') || rawError.includes('quota') || rawError.includes('balance')) {
        finalErrorMessage = "You do not have an active plan. Please upgrade to continue.";
      } else {
        finalErrorMessage = error.message;
      }

      const errorMsg: Message = { id: errorTime.toString(), role: 'assistant', content: `⚠️ ${finalErrorMessage}`, type: 'text' };
      setMessages(prev => [...prev, errorMsg]);
      
      await supabase.from('chat_messages').insert({
        id: errorMsg.id, session_id: activeSessionId, role: 'assistant', content: errorMsg.content, type: 'text', created_at: errorTime
      });
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
      
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />

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
          {sessions.map(session => (
            <div key={session.id} className="relative group/item">
              {editingSessionId === session.id ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl m-1 border border-white/5">
                  <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveRename(session.id)} className="bg-transparent text-white w-full outline-none text-[13px]" />
                  <button onClick={() => saveRename(session.id)} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 className="w-4 h-4" /></button>
                </div>
              ) : (
                <button
                  onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-3 rounded-2xl text-sm flex items-center justify-between transition-all group ${
                    activeSessionId === session.id 
                      ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden pr-6">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeSessionId === session.id ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                      {session.is_pinned ? <Pin className="w-3.5 h-3.5 text-white" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span className="truncate text-[13px] font-medium">{session.title}</span>
                  </div>
                </button>
              )}
              
              {/* 🟢 دکمه ۳ نقطه در منوی کناری */}
              {editingSessionId !== session.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button onClick={() => setDropdownOpenId(dropdownOpenId === session.id ? null : session.id)} className="p-1.5 text-neutral-400 hover:text-white bg-[#0A051A]/80 rounded-full backdrop-blur-md">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {dropdownOpenId === session.id && (
                    <div className="absolute right-0 mt-2 w-36 bg-[#0A051A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                      <button onClick={() => { setEditTitle(session.title); setEditingSessionId(session.id); }} className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-white/10 flex items-center gap-2.5"><Edit2 className="w-3.5 h-3.5" /> Rename</button>
                      <button onClick={() => togglePinChat(session.id, session.is_pinned || false)} className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-white/10 flex items-center gap-2.5"><Pin className="w-3.5 h-3.5" /> {session.is_pinned ? 'Unpin' : 'Pin'}</button>
                      <button onClick={() => deleteChat(session.id)} className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-[100dvh] relative z-10 bg-transparent min-w-0" onClick={() => setDropdownOpenId(null)}>
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
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 px-4 text-center pointer-events-none pb-[10dvh]">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center mb-5 border border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.2)]">
                <Bot className="w-10 h-10 text-fuchsia-400" />
              </div>
              <h2 className="text-2xl font-black tracking-wider text-white mb-2">How can I help?</h2>
              <p className="text-sm font-medium text-neutral-400 max-w-sm">I am your highly advanced AI assistant. Ask me anything, generate images, or upload photos to analyze.</p>
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
                    
                    {msg.imageUrls && msg.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.imageUrls.map((img, idx) => (
                          <img key={idx} src={img} alt="User Upload" className="max-w-[180px] w-full h-auto rounded-xl object-cover border border-white/20 shadow-md" />
                        ))}
                      </div>
                    )}

                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap leading-relaxed text-[13px] md:text-sm">{msg.content}</p>
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
                
                {/* 🟢 پریویو زمان ساخت عکس */}
                {activeMode === 'image' ? (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm p-4 shadow-xl flex flex-col items-center justify-center animate-pulse min-w-[200px] h-28">
                    <ImageIcon className="w-7 h-7 text-fuchsia-500/50 mb-2" />
                    <span className="text-[10px] font-bold text-fuchsia-400 tracking-widest uppercase">Generating Image...</span>
                  </div>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm px-5 py-4 flex items-center gap-1.5 shadow-xl h-12">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
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
                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />} Upload Images
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
              
              <AnimatePresence>
                {uploadedImages.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-12 pt-1 pb-1">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative inline-block shrink-0">
                          <img src={img} alt={`Preview ${index}`} className="h-14 w-auto rounded-lg object-cover border border-white/10 shadow-sm" />
                          <button onClick={() => removeUploadedImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    "Type a message or attach images..."
                  }
                  className="w-full max-h-32 min-h-[40px] bg-transparent text-white px-3 py-2.5 resize-none focus:outline-none custom-scrollbar text-[13px] md:text-sm leading-relaxed"
                  rows={1}
                  dir="auto"
                />
                
                <div className="pb-0.5 pr-0.5 shrink-0">
                  <button
                    onClick={handleSendMessage}
                    disabled={(!input.trim() && uploadedImages.length === 0) || isTyping}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      (input.trim() || uploadedImages.length > 0) && !isTyping
                        ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:scale-105'
                        : 'bg-white/5 text-neutral-600 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-3 hidden md:block opacity-70">
              <p className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">
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