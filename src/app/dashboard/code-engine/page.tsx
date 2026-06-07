"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Terminal, Code2, Loader2, ArrowLeft, Plus, Menu, 
  X, PanelLeftClose, PanelLeft, Copy, Check, FileCode2,
  Cpu, LayoutTemplate, Braces, Pin, Trash2, MoreVertical, Sparkles, Code
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

const programmingLanguages = [
  { id: 'Auto', label: 'Auto Detect' },
  { id: 'Flutter', label: 'Flutter / Dart' },
  { id: 'Next.js', label: 'Next.js / React' },
  { id: 'TypeScript', label: 'TypeScript' },
  { id: 'Python', label: 'Python' },
  { id: 'Node.js', label: 'Node.js' },
  { id: 'PHP', label: 'PHP / Laravel' },
  { id: 'Go', label: 'Go (Golang)' },
];

const SyntaxCodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-blue-800/30 bg-[#050505] shadow-[0_8px_30px_rgb(0,0,0,0.5)] font-mono text-sm group/code relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0c10] border-b border-blue-900/40">
        <span className="flex items-center gap-2 text-[11px] font-black text-blue-400 uppercase tracking-widest">
          <FileCode2 className="w-4 h-4"/> {language || 'Code'}
        </span>
        <button 
          onClick={handleCopy} 
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-all text-xs active:scale-95"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-5 overflow-x-auto text-blue-50 bg-[#020408] custom-scrollbar">
        <pre className="m-0 leading-relaxed text-[13px] md:text-[14px]">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );
};

const MessageContent = ({ content }: { content: string }) => {
  const parts = content.split(/(\x60\x60\x60[\w-]*\n?[\s\S]*?\x60\x60\x60)/g);

  return (
    <div className="text-[14px] md:text-[15px] leading-relaxed font-sans">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/\x60\x60\x60([\w-]*)\n?([\s\S]*?)\x60\x60\x60/);
          if (match) {
            const language = match[1];
            const code = match[2];
            return <SyntaxCodeBlock key={index} language={language} code={code} />;
          }
          return <SyntaxCodeBlock key={index} language="" code={part.replace(/\x60\x60\x60/g, '')} />;
        }
        return (
          <span key={index} className="whitespace-pre-wrap leading-loose">
            {part}
          </span>
        );
      })}
    </div>
  );
};

export default function CodeEnginePage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]); 
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('Auto');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const { data: savedSessions } = await supabase
          .from('code_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        const newSessionId = `session_${Date.now()}`;
        const nowISO = new Date().toISOString();
        const initialSession = { id: newSessionId, title: 'New Workspace', updatedAt: nowISO, is_pinned: false };
        
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
    initializeChat();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeSessionId) return;
      setMessages([]); 
      const { data, error } = await supabase
        .from('code_messages')
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
    const newSession = { id: `session_${Date.now()}`, title: 'New Workspace', updatedAt: nowISO, is_pinned: false };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = async (id: string) => {
    await supabase.from('code_sessions').delete().eq('id', id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)?.id || '');
    setDropdownOpenId(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || !userId || !activeSessionId) return;

    const currentTimeISO = new Date().toISOString();
    const userMsgId = Date.now().toString();
    const currentInput = input;
    
    const newUserMessage: Message = { 
      id: userMsgId, role: 'user', content: currentInput, created_at: currentTimeISO
    };

    setMessages(prev => [...prev, newUserMessage]);
    
    // ثبت دقیق پیام در دیتابیس با نمایش ارور در کنسول مرورگر
    const { error: insertUserError } = await supabase.from('code_messages').insert({
      id: userMsgId,
      session_id: activeSessionId,
      role: 'user',
      content: currentInput,
    });
    if (insertUserError) console.error("DB Insert Error (User):", insertUserError);

    let autoTitle = '';
    if (messages.length === 0) autoTitle = currentInput.length > 25 ? currentInput.substring(0, 25) + '...' : currentInput;
    
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, updatedAt: currentTimeISO, title: autoTitle || s.title } : s));

    if (autoTitle) {
      const { error: upsertSessionError } = await supabase.from('code_sessions').upsert({
        id: activeSessionId,
        user_id: userId,
        title: autoTitle,
        updated_at: currentTimeISO
      });
      if (upsertSessionError) console.error("DB Upsert Error (Session):", upsertSessionError);
    } else {
      await supabase.from('code_sessions').update({ updated_at: currentTimeISO }).eq('id', activeSessionId);
    }

    const historyForAPI = messages.map(m => ({ role: m.role, content: m.content }));
    
    const finalPrompt = selectedLanguage !== 'Auto' 
      ? `[SYSTEM COMMAND: The user strictly requested the following algorithm/code to be written in **${selectedLanguage}**. Do not use any other language.]\n\n${currentInput}`
      : currentInput;

    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/generate/code', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId, 
          inputData: { 
            prompt: finalPrompt, 
            messages: historyForAPI
          } 
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate code');

      const botTimeISO = new Date().toISOString();
      const botMsgId = Date.now().toString();

      const botMessage: Message = { 
        id: botMsgId, 
        role: 'assistant', 
        content: data.text, 
        created_at: botTimeISO 
      };
      
      setMessages(prev => [...prev, botMessage]);

      const { error: insertBotError } = await supabase.from('code_messages').insert({
        id: botMsgId,
        session_id: activeSessionId,
        role: 'assistant',
        content: data.text,
      });
      if (insertBotError) console.error("DB Insert Error (Bot):", insertBotError);

    } catch (error: any) {
      console.error("Code Engine Error:", error);
      const errorMsg: Message = { 
        id: Date.now().toString(), role: 'assistant', content: `⚠️ **System Error:** ${error.message}\n\`\`\`bash\nConnection Refused\n\`\`\``, 
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

  if (isLoadingChats) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]">
        <div className="w-20 h-20 rounded-3xl bg-blue-900/20 flex items-center justify-center animate-pulse mb-6 shadow-[0_0_80px_rgba(59,130,246,0.3)] border border-blue-500/20">
          <Cpu className="w-10 h-10 text-blue-400"/>
        </div>
        <p className="text-blue-500 text-[11px] font-bold tracking-[0.4em] uppercase">Booting Neural Engine...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-[#030712] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-100 h-[100dvh] overflow-hidden" onClick={() => setDropdownOpenId(null)}>
      
      {/* بک‌گراند اختصاصی محیط آبی */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-70">
        <div className="absolute w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] top-[-20%] left-[-10%] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] bottom-[-20%] right-[-10%] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[url('[https://grainy-gradients.vercel.app/noise.svg](https://grainy-gradients.vercel.app/noise.svg)')] opacity-5 mix-blend-overlay"></div>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30" />
        )}
      </AnimatePresence>

      <aside className={`absolute md:relative z-40 h-full bg-[#02040a]/95 backdrop-blur-3xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden border-r border-blue-900/30 shadow-2xl ${isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 border-none opacity-0'}`}>
        <div className="p-4 border-b border-blue-900/30 flex justify-between items-center w-[280px] shrink-0">
          <Link className="w-10 h-10 bg-blue-950/30 hover:bg-blue-900/50 rounded-xl flex items-center justify-center transition-colors border border-blue-800/30 text-blue-400 hover:text-blue-300" href="/dashboard">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <button onClick={createNewWorkspace} className="flex-1 ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] active:scale-95 text-white text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Plus className="w-4 h-4"/> New Workspace
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden w-10 h-10 ml-2 bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-400">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar w-[280px] shrink-0">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-2 mb-4 mt-2">Workspaces</h3>
          {sessions.map(session => (
            <div key={session.id} className="relative group/item">
              <button 
                onClick={() => { setActiveSessionId(session.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }} 
                className={`w-full text-left px-3 py-3.5 rounded-xl text-sm flex items-center justify-between transition-all duration-300 group ${activeSessionId === session.id ? 'bg-gradient-to-r from-blue-950/60 to-indigo-900/20 text-blue-50 shadow-md border border-blue-700/50' : 'text-neutral-500 hover:bg-blue-950/20 hover:text-blue-200 border border-transparent'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-6">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${activeSessionId === session.id ? 'bg-blue-500 text-black shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-neutral-500 group-hover:text-blue-400'}`}>
                    {session.is_pinned ? <Pin className="w-4 h-4"/> : <Code className="w-4 h-4"/>}
                  </div>
                  <span className="truncate text-[12px] font-medium">{session.title}</span>
                </div>
              </button>
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
                <button onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === session.id ? null : session.id); }} className="p-2 text-blue-400 hover:text-white bg-[#02040a] rounded-lg shadow-lg border border-blue-800/50">
                  <MoreVertical className="w-4 h-4"/>
                </button>
                {dropdownOpenId === session.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-[#02040a] border border-blue-900/50 rounded-xl shadow-2xl py-2 z-[60] backdrop-blur-xl">
                    <button onClick={(e) => { e.stopPropagation(); deleteChat(session.id); }} className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors">
                      <Trash2 className="w-3.5 h-3.5"/> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-[100dvh] relative z-10 min-w-0">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-[#030712]/80 backdrop-blur-2xl border-b border-blue-900/30 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-10 h-10 flex items-center justify-center text-blue-400 hover:text-white bg-blue-950/30 hover:bg-blue-900/50 rounded-xl transition-all border border-blue-800/30 active:scale-95">
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 hidden md:block"/> : <PanelLeft className="w-5 h-5 hidden md:block"/>}
              <Menu className="w-5 h-5 md:hidden"/>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Terminal className="w-5 h-5 text-white"/>
              </div>
              <div>
                <h1 className="text-[15px] md:text-[16px] font-black tracking-wide text-white leading-tight">SAFI Code Engine</h1>
                <p className="text-[9px] font-bold tracking-[0.2em] text-blue-400 uppercase flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]" /> Engineering Protocol
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar relative z-10 pb-6 text-neutral-200">
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90 px-4 text-center pointer-events-none pb-[10dvh]">
              <div className="w-24 h-24 rounded-full bg-blue-950/40 flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)] relative">
                <div className="absolute inset-2 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full animate-pulse" />
                <Code2 className="w-12 h-12 text-blue-400 relative z-10"/>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4 drop-shadow-md">What are we building today?</h2>
              <div className="flex flex-wrap justify-center gap-4 mt-6 opacity-70">
                <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-900/50 px-4 py-2 rounded-full"><LayoutTemplate className="w-4 h-4 text-blue-400"/> <span className="text-[11px] font-bold uppercase tracking-wider">Architecture</span></div>
                <div className="flex items-center gap-2 bg-indigo-950/30 border border-indigo-900/50 px-4 py-2 rounded-full"><Braces className="w-4 h-4 text-indigo-400"/> <span className="text-[11px] font-bold uppercase tracking-wider">Refactoring</span></div>
                <div className="flex items-center gap-2 bg-sky-950/30 border border-sky-900/50 px-4 py-2 rounded-full"><Terminal className="w-4 h-4 text-sky-400"/> <span className="text-[11px] font-bold uppercase tracking-wider">Debugging</span></div>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-8 relative z-20">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={msg.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shadow-md ${msg.role === 'user' ? 'bg-gradient-to-tr from-neutral-700 to-neutral-600 text-white border border-neutral-500/50' : 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.4)]'}`}>
                      {msg.role === 'user' ? 'U' : <Sparkles className="w-3.5 h-3.5"/>}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-neutral-400' : 'text-blue-400 drop-shadow-md'}`}>{msg.role === 'user' ? 'You' : 'SAFI Engine'}</span>
                  </div>

                  <div className={`pl-[3.25rem] pr-4 ${msg.role === 'user' ? 'text-neutral-200' : 'text-neutral-100'}`}>
                    <MessageContent content={msg.content} /> 
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white border border-blue-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin"/>
                  </div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">Compiling Response...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        <footer className="p-4 md:p-6 bg-[#02040a] border-t border-blue-900/30 z-20 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto w-full relative">
            
            <div className="mb-3 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest shrink-0 mr-2">Language:</span>
              {programmingLanguages.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${selectedLanguage === lang.id ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-blue-900/50 hover:text-blue-500'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col bg-[#050812] border border-blue-900/40 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 rounded-2xl transition-all duration-300 overflow-hidden shadow-inner">
              <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder={selectedLanguage === 'Auto' ? "Describe the logic or paste code to debug..." : `Write instructions for ${selectedLanguage} code...`}
                className="w-full max-h-64 min-h-[56px] bg-transparent text-white px-5 py-4 resize-none focus:outline-none custom-scrollbar text-[14px] font-mono leading-relaxed placeholder:text-neutral-600" 
                rows={1} 
                dir="auto" 
              />
              <div className="flex justify-between items-center px-4 pb-3 pt-1 bg-[#050812]">
                <span className="text-[10px] text-blue-700/50 font-black tracking-widest uppercase">
                  Enter ↵ Submit &nbsp;•&nbsp; Shift+Enter ↵ Newline
                </span>
                <button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isTyping} 
                  className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${input.trim() && !isTyping ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 active:scale-95 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-neutral-900 text-neutral-700 cursor-not-allowed border border-neutral-800'}`}
                >
                  Execute <Send className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}