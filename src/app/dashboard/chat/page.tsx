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
  // FETCH CHATS FROM SUPABASE
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

  // ==========================================
  // IMAGE UPLOAD LOGIC
  // ==========================================
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
    { id: 'chat', icon: <Sparkles className="w-4 h-4" />, label: 'Chat' },
    { id: 'code', icon: <Code2 className="w-4 h-4" />, label: 'Code' },
    { id: 'image', icon: <ImageIcon className="w-4 h-4" />, label: 'Image' },
    { id: 'search', icon: <Globe className="w-4 h-4" />, label: 'Search' },
  ];

  if (isLoadingChats) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050014]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center animate-pulse mb-4 shadow-[0_0_40px_rgba(167,139,250,0.5)]">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <p className="text-white text-sm font-bold tracking-[0.2em] uppercase">Initializing Core...</p>
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
          isSidebarOpen ? 'w-72 md:w-80 translate-x-0 border-r' : 'w-0 -translate-x-full md:translate-x-0 border-none'
        }`}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center w-72 md:w-80 shrink-0">
          <Link href="/dashboard" className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors border border-white/5 text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button onClick={createNewChat} className="flex-1 ml-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(167,139,250,0.3)] hover:shadow-[0_0_30px_rgba(167,139,250,0.5)]">
            <Plus className="w-4 h-4" /> New Chat
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-10 h-10 ml-2 bg-white/5 rounded-full flex items-center justify-center text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar w-72 md:w-80 shrink-0">
          <h3 className="text-[10px] font-black text-fuchsia-400/80 uppercase tracking-widest pl-2 mb-4 mt-2">Chat History</h3>
          {sessions.sort((a, b) => b.updatedAt - a.updatedAt).map(session => (
            <button
              key={session.id}
              onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm flex items-center gap-3 transition-all truncate group ${
                activeSessionId === session.id 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeSessionId === session.id ? 'bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="truncate font-medium">{session.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-[100dvh] relative z-10 bg-transparent min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#050014]/60 backdrop-blur-xl border-b border-white/5 z-20">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="w-10 h-10 flex items-center justify-center text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 hidden md:block" /> : <PanelLeft className="w-5 h-5 hidden md:block" />}
              <Menu className="w-5 h-5 md:hidden" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-black tracking-wide text-white">SAFI Neural</h1>
                <p className="text-[10px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" /> Active
                </p>
              </div>
            </div>
          </div>
          
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all"
            >
              <Download className="w-3 h-3" /> Install App
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar relative z-10 pb-4" onClick={() => setIsMenuOpen(false)}>
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 px-4 text-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 flex items-center justify-center mb-6 border border-fuchsia-500/30 shadow-[0_0_50px_rgba(217,70,239,0.2)]">
                <Bot className="w-12 h-12 text-fuchsia-400" />
              </div>
              <h2 className="text-3xl font-black tracking-wider text-white mb-2">How can I help?</h2>
              <p className="text-sm font-medium text-neutral-400 max-w-md">I am your highly advanced AI assistant. Ask me anything, generate images, or upload a photo to analyze.</p>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 relative z-20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl border ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 border-white/20 text-white' 
                      : 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 border-white/20 text-white'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                  </div>

                  <div className={`max-w-[85%] md:max-w-[75%] rounded-[2rem] p-5 shadow-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600/90 to-violet-600/90 border border-white/10 text-white rounded-tr-sm'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-neutral-100 rounded-tl-sm'
                  }`}>
                    
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="User Upload" className="max-w-xs w-full h-auto rounded-xl mb-4 object-cover border border-white/20 shadow-md" />
                    )}

                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    )}

                    {msg.type === 'code' && (
                      <div className="bg-[#03000A] rounded-2xl border border-white/10 overflow-hidden font-mono text-sm mt-3 shadow-inner">
                        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/5 text-neutral-400">
                          <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-fuchsia-400 font-bold"><Terminal className="w-4 h-4"/> Code Snippet</span>
                        </div>
                        <pre className="p-5 overflow-x-auto text-cyan-300">
                          <code>{msg.content}</code>
                        </pre>
                      </div>
                    )}

                    {msg.type === 'image' && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 bg-[#03000A] shadow-lg">
                        <img src={msg.content} alt="SAFI AI Generated" className="w-full h-auto object-cover" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-white/20 text-white flex items-center justify-center shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] rounded-tl-sm px-6 py-5 flex items-center gap-2 shadow-2xl h-14">
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="p-4 md:p-6 bg-gradient-to-t from-[#050014] via-[#050014] to-transparent z-20 shrink-0">
          <div className="max-w-4xl mx-auto relative w-full">
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-[4.5rem] left-2 bg-[#0A051A]/95 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 w-48 z-50"
                >
                  <button
                    onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-widest transition-all text-fuchsia-400 hover:bg-fuchsia-500/10 mb-1 pb-3 border-b border-white/5 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />} Upload Image
                  </button>
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => { setActiveMode(mode.id as any); setIsMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-widest transition-all ${
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
              {uploadedImage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-[4.5rem] left-16 bg-[#0A051A]/95 backdrop-blur-2xl border border-fuchsia-500/30 p-1.5 rounded-2xl shadow-2xl z-40">
                  <div className="relative">
                    <img src={uploadedImage} alt="Preview" className="h-16 w-auto rounded-xl object-cover" />
                    <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-end bg-[#0A051A]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_40px_rgba(217,70,239,0.15)] transition-all group p-2">
              
              <div className="absolute bottom-3 left-3 flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'bg-fuchsia-600 text-white rotate-45 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeMode === 'chat' ? "Type a message or attach an image..." :
                  activeMode === 'code' ? "Describe the code you need..." :
                  activeMode === 'image' ? "Describe the image to generate..." :
                  "Search the web..."
                }
                className="w-full max-h-32 min-h-[50px] bg-transparent text-white pl-16 pr-16 py-4 resize-none focus:outline-none custom-scrollbar text-[15px] leading-relaxed"
                rows={1}
                dir="auto"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={(!input.trim() && !uploadedImage) || isTyping}
                className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  (input.trim() || uploadedImage) && !isTyping
                    ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:scale-105'
                    : 'bg-white/5 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
            
            <div className="text-center mt-4 hidden md:block">
              <p className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
                Powered by SAFI Neural Engine • End-to-End Encrypted
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217,70,239,0.5); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}