"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Loader2, Plus, MessageSquare, Car, Clock, X, ChevronLeft } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type ChatSession = { sessionId: string; title: string; messages: Message[]; updatedAt: string };

// Light Palette
const L = {
  bg: "#F0F4FF", cardBg: "#FFFFFF", primary: "#155dfc", primaryText: "#FFFFFF",
  text: "#030304", muted: "#6B7280", border: "#DBEAFE", glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21, 93, 252, 0.06), 0 0 3px rgba(21,93,252,0.04)",
  hoverShadow: "0 12px 24px -4px rgba(21,93,252,0.12)",
  userMsgBg: "#EFF6FF", userMsgText: "#030304",
  aiMsgBg: "#FFFFFF", aiMsgBorder: "#E5E7EB",
  inputBg: "#F9FAFB", inputBorder: "#E5E7EB",
  itemHover: "rgba(21, 93, 252, 0.05)", itemActive: "rgba(21, 93, 252, 0.1)"
};

// Dark Palette
const D = {
  bg: "transparent", cardBg: "#0F111A", primary: "#155dfc", primaryText: "#FFFFFF",
  text: "#FFFFFF", muted: "#8B949E", border: "rgba(21, 93, 252, 0.2)", glow: "rgba(21, 93, 252, 0.25)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  hoverShadow: "0 12px 30px -4px rgba(0,0,0,0.5), 0 0 25px rgba(21,93,252,0.12)",
  userMsgBg: "#27272A", userMsgText: "#F4F4F5",
  aiMsgBg: "#18181B", aiMsgBorder: "rgba(255,255,255,0.05)",
  inputBg: "#0a0a0c", inputBorder: "rgba(255,255,255,0.1)",
  itemHover: "rgba(255,255,255,0.05)", itemActive: "rgba(255,255,255,0.1)"
};

export default function AssistantPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Theme Sync
  useEffect(() => {
    const stored = localStorage.getItem('autofyx_theme') === 'dark';
    if (stored) setIsDarkMode(true);
    const handler = (e: any) => setIsDarkMode(e.detail);
    window.addEventListener('themeSync', handler);
    return () => window.removeEventListener('themeSync', handler);
  }, []);

  const P = isDarkMode ? D : L;

  // Load user
  useEffect(() => {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUserId(parsed.user_id || parsed.email);
      } catch (e) {}
    }
  }, []);

  // Fetch history
  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?userId=${userId}`);
        const data = await res.json();
        if (data.chats && data.chats.length > 0) {
          setSessions(data.chats);
          setCurrentSessionId(data.chats[0].sessionId);
          setMessages(data.chats[0].messages);
        } else {
          startNewChat();
        }
      } catch (e) {
        console.error("Error fetching history", e);
      }
    };
    fetchHistory();
  }, [userId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    const newSessionId = "sess_" + Math.random().toString(36).substring(2, 15);
    setCurrentSessionId(newSessionId);
    setMessages([{ role: "assistant", content: "Hi! I'm the AutoFyx Assistant. How can I help you find your perfect vehicle today?" }]);
    setMobileSidebarOpen(false);
  };

  const loadSession = (sessionId: string) => {
    const sess = sessions.find(s => s.sessionId === sessionId);
    if (sess) {
      setCurrentSessionId(sessionId);
      setMessages(sess.messages);
      setMobileSidebarOpen(false);
    }
  };

  const saveToDb = async (sessionId: string, newMessages: Message[], title: string) => {
    if (!userId) return;
    try {
      await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, sessionId, messages: newMessages, title })
      });
      setSessions(prev => {
        const existing = prev.findIndex(s => s.sessionId === sessionId);
        const updatedSess = { sessionId, title, messages: newMessages, updatedAt: new Date().toISOString() };
        if (existing >= 0) {
          const newSessions = [...prev];
          newSessions[existing] = updatedSess;
          return newSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        return [updatedSess, ...prev];
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    let sessionTitle = "New Chat";
    if (messages.length <= 1) {
      sessionTitle = userMsg.substring(0, 30) + (userMsg.length > 30 ? "..." : "");
    } else {
      const sess = sessions.find(s => s.sessionId === currentSessionId);
      if (sess) sessionTitle = sess.title;
    }

    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error("Failed");
      
      const data = await res.json();
      const finalMessages: Message[] = [...newMessages, { role: "assistant", content: data.reply }];
      setMessages(finalMessages);
      await saveToDb(currentSessionId, finalMessages, sessionTitle);
    } catch (error) {
      const finalMessages: Message[] = [...newMessages, { role: "assistant", content: "Error connecting to AI." }];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Shared sidebar content rendered in both desktop panel and mobile drawer
  const SidebarContent = () => (
    <>
      <button
        onClick={startNewChat}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 mb-6 shadow-lg"
        style={{ background: P.primary, color: P.primaryText, boxShadow: `0 8px 20px -4px ${P.glow}` }}
      >
        <Plus className="w-4 h-4" />
        New Chat
      </button>

      <div className="flex items-center gap-2 mb-4 px-2">
        <Clock className="w-4 h-4" style={{ color: P.muted }} />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: P.muted }}>Chat History</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {sessions.map((sess) => (
          <button
            key={sess.sessionId}
            onClick={() => loadSession(sess.sessionId)}
            className="w-full text-left px-4 py-3 rounded-2xl transition-all flex items-center gap-3 group"
            style={{
              background: currentSessionId === sess.sessionId ? P.itemActive : "transparent",
              color: currentSessionId === sess.sessionId ? P.text : P.muted
            }}
            onMouseEnter={(e) => {
              if (currentSessionId !== sess.sessionId) e.currentTarget.style.background = P.itemHover;
            }}
            onMouseLeave={(e) => {
              if (currentSessionId !== sess.sessionId) e.currentTarget.style.background = "transparent";
            }}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: currentSessionId === sess.sessionId ? P.primary : P.muted }} />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: P.text }}>{sess.title}</p>
              <p className="text-[10px] opacity-60 mt-0.5">
                {new Date(sess.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
  );

  return (
    <div 
      className="flex h-[calc(100vh-100px)] m-1 sm:m-3 gap-4 sm:gap-6 p-3 sm:p-4 xl:p-6 transition-colors duration-500 rounded-[32px] relative"
      style={{ background: P.bg }}
    >

      {/* ── Mobile Sidebar Overlay (hidden on sm+) ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Slide-in sidebar */}
            <motion.div
              key="mobile-sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="sm:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col p-5"
              style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
            >
              {/* Close button */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="self-end mb-4 w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
                style={{ color: P.muted, background: P.itemHover }}
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop Sidebar (hidden below sm) ── */}
      <div
        className="hidden sm:flex w-80 rounded-[32px] p-5 flex-col transition-all duration-500 flex-shrink-0"
        style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
      >
        <SidebarContent />
      </div>

      {/* Main Chat Area */}
      <div
        className="flex-1 rounded-[32px] flex flex-col overflow-hidden relative transition-all duration-500 min-w-0"
        style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
      >
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-500" style={{ background: P.glow }} />

        {/* Header */}
        <div
          className="backdrop-blur-md p-4 sm:p-5 flex items-center gap-3 sm:gap-4 relative z-10 transition-colors duration-500"
          style={{ borderBottom: `1px solid ${P.border}`, background: isDarkMode ? "rgba(15,17,26,0.8)" : "rgba(255,255,255,0.8)" }}
        >
          {/* Mobile: open history drawer button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors"
            style={{ background: P.itemHover, color: P.muted, border: `1px solid ${P.border}` }}
            aria-label="Open chat history"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: P.primary, color: P.primaryText }}>
            <Car className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-wide transition-colors duration-500 truncate" style={{ color: P.text }}>AutoFyx Assistant AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-medium transition-colors duration-500" style={{ color: P.muted }}>Powered by Llama 3 &amp; RAG</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin relative z-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                style={{
                  background: msg.role === "user" ? (isDarkMode ? P.inputBg : "#F3F4F6") : P.primary,
                  color: msg.role === "user" ? P.text : P.primaryText,
                  border: msg.role === "user" ? `1px solid ${P.border}` : "none"
                }}
              >
                {msg.role === "user" ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Car className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[80%] px-4 sm:px-5 py-3 sm:py-4 text-sm leading-relaxed rounded-[24px] shadow-sm transition-colors duration-500 ${
                  msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
                }`}
                style={{
                  background: msg.role === "user" ? P.userMsgBg : P.aiMsgBg,
                  color: msg.role === "user" ? P.userMsgText : P.text,
                  border: msg.role === "user" ? "none" : `1px solid ${P.aiMsgBorder}`
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 flex-row">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: P.primary, color: P.primaryText }}>
                <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div
                className="px-4 sm:px-5 py-3 sm:py-4 rounded-[24px] rounded-tl-none flex items-center gap-2 shadow-sm transition-colors duration-500"
                style={{ background: P.aiMsgBg, border: `1px solid ${P.aiMsgBorder}` }}
              >
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: P.primary }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: P.primary, animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: P.primary, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          className="p-3 sm:p-5 backdrop-blur-md relative z-10 transition-colors duration-500"
          style={{ borderTop: `1px solid ${P.border}`, background: isDarkMode ? "rgba(15,17,26,0.8)" : "rgba(255,255,255,0.8)" }}
        >
          <div className="relative flex items-center max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vehicle recommendations, prices, or specs..."
              className="w-full rounded-[24px] pl-4 sm:pl-6 pr-14 py-3 sm:py-4 text-sm focus:outline-none resize-none h-[52px] sm:h-[56px] overflow-hidden leading-tight scrollbar-hide shadow-inner transition-colors duration-500"
              style={{
                background: P.inputBg,
                border: `1px solid ${P.inputBorder}`,
                color: P.text,
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 sm:p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              style={{ background: P.primary, color: P.primaryText }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
