"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "./LocationContext";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "bot";
  content: string;
}

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Namaste! I am **Kissan Mitra**. How can I help you with your farming decisions today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const { location } = useLocation();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            ...location,
            currentPage: pathname,
          },
        }),
      });

      if (!response.ok) throw new Error("Chatbot failed to respond");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", content: "I'm having trouble connecting to the server. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-on-primary rounded-full shadow-2xl hover:scale-110 transition-all z-50 group"
        title="Chat with Kissan Mitra"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 bg-surface-container-high text-on-surface text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-outline/10">
          Chat with Kissan Mitra
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-16 w-64' : 'h-[500px] w-80 md:w-96'} bg-surface-container-high/80 backdrop-blur-xl border border-outline/10 rounded-2xl shadow-2xl overflow-hidden`}>
      {/* Header */}
      <div className="p-4 bg-primary/10 border-b border-outline/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-lg">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-sm text-on-surface">Kissan Mitra AI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-on-surface/10 rounded transition-colors">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-error/10 hover:text-error rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-1.5 rounded-lg h-fit ${msg.role === 'user' ? 'bg-primary/20' : 'bg-surface-container-highest'}`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface-container-lowest text-on-surface border border-outline/5 rounded-tl-none'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-lowest border border-outline/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-on-surface/60 italic">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-surface-container-highest/50 border-t border-outline/10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask agricultural advice..."
                className="w-full bg-surface-container-low border border-outline/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-all text-on-surface"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-1.5 bg-primary text-on-primary rounded-lg disabled:opacity-50 disabled:grayscale hover:scale-105 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
