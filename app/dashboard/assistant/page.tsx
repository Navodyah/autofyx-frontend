"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User, Loader2, Plus, MessageSquare, Car, Clock } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type ChatSession = { sessionId: string; title: string; messages: Message[]; updatedAt: string };

export default function AssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  };

  const loadSession = (sessionId: string) => {
    const sess = sessions.find(s => s.sessionId === sessionId);
    if (sess) {
      setCurrentSessionId(sessionId);
      setMessages(sess.messages);
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
      // Update local sessions state
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

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 p-6">
      {/* Sidebar for History */}
      <div className="w-80 bg-[#0f0f13] border border-white/10 rounded-3xl p-4 flex flex-col shadow-xl">
        <button
          onClick={startNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] mb-6"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        <div className="flex items-center gap-2 mb-4 px-2 text-zinc-400">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Chat History</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
          {sessions.map((sess) => (
            <button
              key={sess.sessionId}
              onClick={() => loadSession(sess.sessionId)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 ${
                currentSessionId === sess.sessionId
                  ? "bg-white/10 border border-white/5 shadow-md"
                  : "hover:bg-white/5 border border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === sess.sessionId ? 'text-blue-400' : ''}`} />
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{sess.title}</p>
                <p className="text-[10px] opacity-60 mt-0.5">
                  {new Date(sess.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[#0f0f13] border border-white/10 rounded-3xl shadow-xl flex flex-col overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="bg-[#1c1c21]/80 backdrop-blur-md border-b border-white/5 p-5 flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">AutoFyx Assistant AI</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-xs text-zinc-400">Powered by Llama 3 & RAG</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                msg.role === "user" ? "bg-zinc-800 border border-white/5" : "bg-blue-600"
              }`}>
                {msg.role === "user" ? <User className="w-5 h-5 text-zinc-300" /> : <Car className="w-5 h-5 text-white" />}
              </div>
              <div className={`max-w-[80%] px-5 py-4 text-sm leading-relaxed rounded-2xl shadow-md ${
                msg.role === "user" 
                  ? "bg-zinc-800 text-zinc-100 rounded-tr-none border border-white/5" 
                  : "bg-[#1c1c21] text-zinc-200 rounded-tl-none border border-white/5"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div className="px-5 py-4 bg-[#1c1c21] rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-5 bg-[#1c1c21]/80 backdrop-blur-md border-t border-white/5 relative z-10">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about vehicle recommendations, prices, or specs..."
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none h-[56px] overflow-hidden leading-tight scrollbar-hide shadow-inner transition-all"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
