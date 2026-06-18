"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Image as ImageIcon, Globe, 
  User, Bot, Loader2, ArrowLeft, MessageSquare, Plus, Menu, 
  X, PanelLeftClose, PanelLeft, Download, Paperclip, MoreVertical, 
  Trash2, Edit2, Pin, CheckCircle2, Copy, Check, MousePointer2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

type MessageType = 'text' | 'image';
type Role = 'user' | 'assistant';

interface Message {
  id: string;
  role: Role;
  content: string;
  type: MessageType;
  imageUrls?: string[];
  mediaUrl?: string;
  mediaType?: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  is_pinned?: boolean;
  updatedAt: string;
}

export default function NeuralChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); 
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const [aiModels, setAiModels] = useState<any[]>([]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'search'>('chat');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // 🟢 استیت برای نمایش تمام‌صفحه عکس
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => scrollToBottom(), [messages, isTyping]);
  useEffect(() => { if (window.innerWidth < 768) setIsSidebarOpen(false); }, []);

  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: pricingData } = await supabase.from('ai_pricing').select('*').eq('is_active', true);
        if (pricingData) setAiModels(pricingData);

        const { data: savedSessions } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false });

        // 🟢 ایجاد یک سشن کاملاً جدید در هر بار ورود به صفحه
        const newSessionId = `session_${Date.now()}`;
        const nowISO = new Date().toISOString();
        const initialSession = { id: newSessionId, title: 'New Conversation', updatedAt: nowISO, is_pinned: false };
        
        let formattedSessions: ChatSession[] = [];
        if (savedSessions && savedSessions.length > 0) {
          formattedSessions = savedSessions.map(dbSession => ({ 
            id: dbSession.id, title: dbSession.title, is_pinned: dbSession.is_pinned, updatedAt: dbSession.updated_at 
          }));
        }

        // قرار دادن چت جدید در ابتدای لیست
        setSessions([initialSession, ...formattedSessions]);
        setActiveSessionId(initialSession.id);
      }
      setIsLoadingChats(false);
    };
    initializeChat();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) return;
      setMessages([]); 
      const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', activeSessionId).order('created_at', { ascending: true });
      if (data && !error) {
        setMessages(data.map(msg => ({ 
          id: msg.id,
          role: msg.role as Role,
          content: msg.content || '',
          type: msg.type as MessageType,
          imageUrls: msg.image_urls || [],
          mediaUrl: msg.media_url || (msg.type === 'image' ? msg.content : ''),
          mediaType: msg.media_type || (msg.type === 'image' ? 'image' : ''),
          created_at: msg.created_at
        })));
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
        if (!file.type.startsWith('image/')) throw new Error(`File ${file.name} is not a valid image.`);
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-chat-img-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage.from('ai_assets').upload(fileName, file);
        if (error) throw error;
        const { data: publicData } = supabase.storage.from('ai_assets').getPublicUrl(fileName);
        return publicData.publicUrl;
      });
      const newImageUrls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...newImageUrls]);
    } catch (err: any) { alert(`Upload Failed: ${err.message}`); } 
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const createNewChat = async () => {
    if (!userId) return;
    const nowISO = new Date().toISOString();
    const newSession = { id: `session_${Date.now()}`, title: 'New Conversation', updatedAt: nowISO, is_pinned: false };
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

  const togglePinChat = async (id: string, currentPinStatus: boolean) => {
    const newStatus = !currentPinStatus;
    await supabase.from('chat_sessions').update({ is_pinned: newStatus }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, is_pinned: newStatus } : s).sort((a, b) => Number(b.is_pinned || 0) - Number(a.is_pinned || 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setDropdownOpenId(null);
  };

  const saveRename = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', id);
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingSessionId(null); setDropdownOpenId(null);
  };

  // 🟢 لاجیک جدید و حرفه‌ای برای دانلود اجباری فایل (بدون باز شدن لینک جدید)
  const handleDownloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Safi-AI-Asset-${Date.now()}.png`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Direct download failed, attempting fallback:", error);
      // Fallback
      const link = document.createElement('a');
      link.href = url;
      link.download = `Safi-AI-Asset-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isTyping || !activeSessionId || !userId) return;

    const currentTimeISO = new Date().toISOString();
    const userMsgId = Date.now().toString();
    const payloadImageUrls = [...uploadedImages];
    
    const newUserMessage: Message = { 
      id: userMsgId, role: 'user', content: input || 'Uploaded image(s)', type: 'text', 
      imageUrls: payloadImageUrls, created_at: currentTimeISO
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    let autoTitle = '';
    if (messages.length === 0 && input) autoTitle = input.length > 25 ? input.substring(0, 25) + '...' : input;
    
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updatedAt: currentTimeISO, title: autoTitle || s.title } : s).sort((a, b) => Number(b.is_pinned || 0) - Number(a.is_pinned || 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

    const chatHistoryForAPI = [...messages, newUserMessage]
      .filter(m => m.type === 'text')
      .map(m => ({ role: m.role, content: m.content }));

    setInput(''); setUploadedImages([]); setIsMenuOpen(false); setIsTyping(true);

    try {
      let categoryToSearch = 'text';
      let targetApiEndpoint = '/api/ai/generate/chat';

      if (activeMode === 'image') {
        categoryToSearch = 'image';
        targetApiEndpoint = '/api/ai/generate/image';
      } else if (activeMode === 'search') {
        targetApiEndpoint = '/api/ai/generate/chat';
      }

      const targetModelConfig = aiModels.find(m => m.category.toLowerCase() === categoryToSearch);
      if (!targetModelConfig) throw new Error(`Model for ${categoryToSearch} not found.`);

      const response = await fetch(targetApiEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          pricingId: targetModelConfig.id, 
          inputData: { 
            prompt: newUserMessage.content, 
            aspectRatio: '16:9', 
            imageUrls: payloadImageUrls,
            messages: chatHistoryForAPI,
            sessionId: activeSessionId,
            sessionTitle: autoTitle || undefined,
            userMessageId: userMsgId,
            activeMode: activeMode
          } 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Processing Error');

      const botTimeISO = new Date().toISOString();
      const botMsgId = Date.now().toString();
      
      let messageType: MessageType = activeMode === 'image' ? 'image' : 'text';

      const botMessage: Message = { 
        id: botMsgId, role: 'assistant', content: data.outputUrl || data.text || 'Done.', 
        type: messageType, created_at: botTimeISO 
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error: any) {
      console.error("Chat Action Error:", error);
      const errorTimeISO = new Date().toISOString();
      const errorMsg: Message = { 
        id: Date.now().toString(), role: 'assistant', content: `⚠️ ${error.message}`, 
        type: 'text', created_at: errorTimeISO 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  // 🟢 گزینه‌های منو (بدون حالت Code)
  const modes = [
    { id: 'chat', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Chat' },
    { id: 'image', icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Image' },
    { id: 'search', icon: <Globe className="w-3.5 h-3.5" />, label: 'Search' },
  ];

  if (isLoadingChats) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050014]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center animate-pulse mb-6 shadow-[0_0_60px_rgba(167,139,250,0.4)]"><Sparkles className="w-7 h-7 text-white" /></div>
        <p className="text-white text-[11px] font-bold tracking-[0.3em] uppercase opacity-80">Initializing Neural Core...</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[100] flex bg-[#050014] text-slate-100 font-sans selection:bg-fuchsia-500 selection:text-white h-[100dvh] overflow-hidden text-[13px] md:text-sm">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
        
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px]" />
        </div>

        <AnimatePresence>{isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30" />}</AnimatePresence>

        <aside className={`absolute md:relative z-40 h-full bg-[#050014]/90 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${isSidebarOpen ? 'w-[280px] border-r border-white/5 shadow-2xl opacity-100' : 'w-0 border-none opacity-0'}`}>
          <div className="p-4 border-b border-white/5 flex justify-between items-center w-[280px] shrink-0">
            <Link href="/dashboard" className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/5 text-neutral-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></Link>
            <button onClick={createNewChat} className="flex-1 ml-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)]"><Plus className="w-4 h-4" /> New Chat</button>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-9 h-9 ml-2 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar w-[280px] shrink-0">
            <h3 className="text-[9px] font-black text-fuchsia-400/80 uppercase tracking-widest pl-2 mb-4 mt-2">Chat History</h3>
            {sessions.map(session => (
              <div key={session.id} className="relative group/item">
                {editingSessionId === session.id ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl m-1 border border-white/10 shadow-inner">
                    <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveRename(session.id)} className="bg-transparent text-white w-full outline-none text-[13px] font-medium" />
                    <button onClick={() => saveRename(session.id)} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-3 rounded-xl text-sm flex items-center justify-between transition-all group ${activeSessionId === session.id ? 'bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg border border-white/10' : 'text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>
                    <div className="flex items-center gap-3 overflow-hidden pr-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${activeSessionId === session.id ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                        {session.is_pinned ? <Pin className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                      </div>
                      <span className="truncate text-[13px] font-medium">{session.title}</span>
                    </div>
                  </button>
                )}
                {editingSessionId !== session.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                    <button onClick={() => setDropdownOpenId(dropdownOpenId === session.id ? null : session.id)} className="p-1.5 text-neutral-300 hover:text-white bg-[#0A051A]/90 rounded-lg backdrop-blur-md shadow-md border border-white/10"><MoreVertical className="w-4 h-4" /></button>
                    {dropdownOpenId === session.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-[#0A051A]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl py-2 z-[60]">
                        <button onClick={() => { setEditTitle(session.title); setEditingSessionId(session.id); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"><Edit2 className="w-3.5 h-3.5" /> Rename</button>
                        <button onClick={() => togglePinChat(session.id, session.is_pinned || false)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2.5 transition-colors"><Pin className="w-3.5 h-3.5" /> {session.is_pinned ? 'Unpin' : 'Pin'}</button>
                        <button onClick={() => deleteChat(session.id)} className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-[100dvh] relative z-10 bg-transparent min-w-0" onClick={() => setDropdownOpenId(null)}>
          <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#050014]/60 backdrop-blur-xl border-b border-white/5 z-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 active:scale-95">
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 hidden md:block" /> : <PanelLeft className="w-4 h-4 hidden md:block" />}
                <Menu className="w-4 h-4 md:hidden" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)]"><Sparkles className="w-4 h-4 text-white" /></div>
                <div>
                  <h1 className="text-[14px] md:text-[15px] font-black tracking-wide text-white leading-tight">SAFI Neural</h1>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" /> Active Engine</p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10 pb-4" onClick={() => setIsMenuOpen(false)}>
            {messages.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 px-4 text-center pointer-events-none pb-[10dvh]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600/10 to-fuchsia-500/10 flex items-center justify-center mb-6 border border-fuchsia-500/20 shadow-[0_0_50px_rgba(217,70,239,0.1)] relative">
                  <div className="absolute inset-2 bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 rounded-full animate-pulse" />
                  <Bot className="w-10 h-10 text-fuchsia-400 relative z-10" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-black tracking-wider text-white mb-3">How can I assist?</h2>
                <p className="text-sm font-medium text-neutral-400 max-w-sm leading-relaxed">I am Safi AI, your advanced neural engine. Ask complex questions, generate images, or analyze data.</p>
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6 relative z-20">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} key={msg.id} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border ${msg.role === 'user' ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 border-white/20 text-white' : 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 border-white/20 text-white'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-5 h-5 md:w-5 md:h-5" />}
                    </div>

                    <div className={`max-w-[88%] md:max-w-[80%] rounded-[1.5rem] p-4 md:p-5 shadow-xl relative group/text ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-600/90 to-blue-600/90 border border-white/10 text-white rounded-tr-sm' : 'bg-white/5 backdrop-blur-xl border border-white/10 text-neutral-100 rounded-tl-sm'}`}>
                      
                      {msg.imageUrls && msg.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {msg.imageUrls.map((img, idx) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt="User Upload" 
                              onClick={() => setFullscreenImage(img)}
                              className="max-w-[200px] w-full h-auto rounded-xl object-cover border border-white/20 shadow-md cursor-pointer hover:opacity-90 transition-opacity" 
                            />
                          ))}
                        </div>
                      )}

                      {msg.type === 'text' && (
                        <div className="relative">
                          <p className="whitespace-pre-wrap leading-relaxed text-[13.5px] md:text-[14.5px] font-medium">{msg.content}</p>
                          
                          {msg.role === 'assistant' && (
                            <div className="flex justify-end mt-3 opacity-0 group-hover/text:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleCopyText(msg.id, msg.content)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                              >
                                {copiedMessageId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="text-[10px] font-bold tracking-widest uppercase">{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 🟢 نمایش عکس تولید شده با قابلیت باز شدن */}
                      {msg.type === 'image' && (
                        <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10 bg-[#03000A] shadow-2xl group/img">
                          <img 
                            src={msg.mediaUrl || msg.content || msg.imageUrls?.[0]} 
                            alt="SAFI AI Generated" 
                            onClick={() => setFullscreenImage(msg.mediaUrl || msg.content || msg.imageUrls?.[0] || null)}
                            className="w-full h-auto object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" 
                          />
                          
                          <div className="absolute top-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const imageUrl = msg.mediaUrl || msg.content || msg.imageUrls?.[0];
                                if (imageUrl) handleDownloadImage(imageUrl);
                              }} 
                              className="bg-black/70 hover:bg-black/90 backdrop-blur-md p-3 rounded-xl text-white flex items-center justify-center transition-all shadow-xl border border-white/10 hover:scale-105 active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10 shadow-lg pointer-events-none">
                            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                            <span className="text-[9px] font-black tracking-widest text-white uppercase">Generated by SAFI AI</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 md:gap-4">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-white/20 text-white flex items-center justify-center shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  
                  {activeMode === 'search' ? (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm p-5 shadow-xl flex flex-col items-center justify-center min-w-[220px] h-32 relative overflow-hidden">
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute -inset-10 bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 blur-2xl" />
                      <Globe className="w-7 h-7 text-blue-400 mb-2 animate-pulse relative z-10" />
                      <span className="text-[10px] font-bold text-blue-300 tracking-widest uppercase mb-3 relative z-10">Scanning The Web...</span>
                      <div className="w-3/4 h-1.5 bg-black/50 rounded-full overflow-hidden relative z-10 shadow-inner">
                        <motion.div initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-1/2 h-full bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                      </div>
                      <motion.div initial={{ x: -30, y: 20 }} animate={{ x: 30, y: -10 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }} className="absolute text-white drop-shadow-lg z-20">
                        <MousePointer2 className="w-5 h-5 text-white fill-white/20" />
                      </motion.div>
                    </div>
                  ) : activeMode === 'image' ? (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm p-4 shadow-xl flex flex-col items-center justify-center animate-pulse min-w-[200px] h-28">
                      <ImageIcon className="w-7 h-7 text-fuchsia-500/50 mb-2" />
                      <span className="text-[10px] font-bold text-fuchsia-400 tracking-widest uppercase">Generating Image...</span>
                    </div>
                  ) : (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] rounded-tl-sm px-6 py-4 flex items-center gap-2 shadow-xl h-[52px]">
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

          <footer className="p-3 md:p-5 bg-gradient-to-t from-[#050014] via-[#050014]/90 to-transparent z-20 shrink-0">
            <div className="max-w-4xl mx-auto relative w-full">
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute bottom-[4.5rem] left-2 bg-[#0A051A]/95 backdrop-blur-3xl border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-44 z-50">
                    <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} disabled={isUploading} className="flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold tracking-wider transition-all text-fuchsia-400 hover:bg-fuchsia-500/10 mb-1 pb-3 border-b border-white/5 disabled:opacity-50">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />} Upload Media
                    </button>
                    {modes.map((mode) => (
                      <button key={mode.id} onClick={() => { setActiveMode(mode.id as any); setIsMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold tracking-wider transition-all ${activeMode === mode.id ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                        {mode.icon} {mode.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {activeMode !== 'chat' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-12 left-4 bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 border border-fuchsia-500/30 text-fuchsia-300 px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-2 backdrop-blur-md shadow-lg z-30">
                    {modes.find(m => m.id === activeMode)?.icon} {modes.find(m => m.id === activeMode)?.label} Mode Active
                    <button onClick={() => setActiveMode('chat')} className="ml-2 bg-black/40 rounded-full p-1 hover:bg-black/60 transition-colors"><X className="w-3 h-3" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative flex flex-col bg-[#0A051A]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_30px_rgba(217,70,239,0.15)] transition-all duration-300 group p-2">
                <AnimatePresence>
                  {uploadedImages.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-14 pt-2 pb-2">
                      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative inline-block shrink-0">
                            <img src={img} alt="preview" className="h-16 w-auto rounded-xl object-cover border border-white/10 shadow-md" />
                            <button onClick={() => removeUploadedImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-end w-full relative">
                  <div className="pb-1 pl-1 shrink-0">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'bg-fuchsia-600 text-white rotate-45 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}><Plus className="w-5 h-5" /></button>
                  </div>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={activeMode === 'image' ? "Describe the image to generate..." : activeMode === 'search' ? "Search the web..." : "Message Safi AI..."} className="w-full max-h-32 min-h-[44px] bg-transparent text-white px-4 py-3 resize-none focus:outline-none custom-scrollbar text-[14px] font-medium leading-relaxed placeholder:text-neutral-600" rows={1} dir="auto" />
                  <div className="pb-1 pr-1 shrink-0">
                    <button onClick={handleSendMessage} disabled={(!input.trim() && uploadedImages.length === 0) || isTyping} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${(input.trim() || uploadedImages.length > 0) && !isTyping ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105 active:scale-95' : 'bg-white/5 text-neutral-600 cursor-not-allowed border border-white/5'}`}><Send className="w-4 h-4 ml-0.5" /></button>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-3 hidden md:block opacity-60 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
                  Powered by SAFI Neural Engine <span className="w-1 h-1 rounded-full bg-neutral-600" /> End-to-End Encrypted
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* 🟢 مُدال (پنجره پاپ‌آپ) نمایش تمام‌صفحه عکس */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setFullscreenImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors z-50"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.img 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={fullscreenImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownloadImage(fullscreenImage); }}
              className="absolute bottom-8 right-8 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 active:scale-95 text-white px-5 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all z-50"
            >
              <Download className="w-5 h-5" /> Download Asset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}