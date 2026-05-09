"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, X, Send, User, MessageSquare, Loader2, Minimize2 } from "lucide-react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AutoFyxAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("autofyx_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    } else {
      // Initial greeting
      setMessages([
        { role: "assistant", content: "Hi there! I'm the AutoFyx Assistant. How can I help you find your perfect vehicle today?" }
      ]);
    }
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("autofyx_chat_history", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Optionally, hide on specific pages if needed, but user said "Add it to the landing page and other pages. Add it to the dashboard." 
  // So it should be visible everywhere. We'll add a z-index of 9999 so it sits above everything.

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
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

  const clearHistory = () => {
    const initMsg: Message[] = [{ role: "assistant", content: "Hi there! I'm the AutoFyx Assistant. How can I help you find your perfect vehicle today?" }];
    setMessages(initMsg);
    localStorage.setItem("autofyx_chat_history", JSON.stringify(initMsg));
  };

  // Only show the chatbot on the landing, recommend, about, and contact pages
  const allowedPaths = ["/", "/recommend", "/about", "/contact"];
  if (!allowedPaths.includes(pathname)) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-toggle"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3 bg-[#1c1c21] border border-white/10 hover:border-blue-500/50 shadow-2xl rounded-full pl-3 pr-6 py-3 text-white transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center relative overflow-hidden">
              <Car className="w-5 h-5 relative z-10" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-semibold tracking-wide">AutoFyx Assistant</span>
              <span className="text-[10px] text-zinc-400">Ask vehicle questions</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1c1c21] border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm">AutoFyx Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-zinc-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearHistory} className="p-2 text-zinc-400 hover:text-white transition-colors text-xs" title="Clear History">
                  Clear
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-zinc-800" : "bg-blue-600"}`}>
                    {msg.role === "user" ? <User className="w-4 h-4 text-zinc-300" /> : <Car className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                      : "bg-[#1c1c21] text-zinc-200 rounded-tl-none border border-white/5"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 bg-[#1c1c21] rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#1c1c21] border-t border-white/5">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none h-[52px] overflow-hidden leading-tight scrollbar-hide"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
