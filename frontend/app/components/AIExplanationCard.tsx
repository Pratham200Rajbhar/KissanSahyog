"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIExplanationCardProps {
  explanation: string;
  title?: string;
}

export const AIExplanationCard = ({ explanation, title = "Kissan Mitra AI Insights" }: AIExplanationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  
  // Simple typewriter effect to make it feel premium
  useEffect(() => {
    if (!explanation) return;
    
    let index = 0;
    setDisplayedText("");
    
    // We only animate if it's not too long to avoid performance issues
    if (explanation.length > 1000) {
      setDisplayedText(explanation);
      return;
    }

    const timer = setInterval(() => {
      setDisplayedText((prev) => explanation.slice(0, index + 1));
      index++;
      if (index >= explanation.length) clearInterval(timer);
    }, 15);

    return () => clearInterval(timer);
  }, [explanation]);

  if (!explanation) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-8 overflow-hidden rounded-[2rem] border border-primary/20 bg-[#0b1326]/40 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-primary/40 group"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between p-6 bg-gradient-to-r from-primary/10 via-transparent to-transparent hover:from-primary/15 transition-all duration-500"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-white flex items-center gap-2 text-lg">
              {title}
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </h3>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Expert breakdown of your results</p>
          </div>
        </div>
        <div className="rounded-full p-2 bg-white/5 hover:bg-white/10 transition-colors">
          {isExpanded ? <ChevronUp className="h-5 w-5 text-white/50" /> : <ChevronDown className="h-5 w-5 text-white/50" />}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="p-8 pt-2">
              <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed font-label space-y-4 text-base">
                {displayedText.split('\n\n').map((para, i) => (
                  <div key={i} className="mb-4">
                    {para.split('\n').map((line, j) => {
                       // Improved markdown-ish rendering for bolding, lists, headings, and rules
                       const formattedLine = line
                        .replace(/^### (.*)/, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
                        .replace(/^## (.*)/, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                        .replace(/^# (.*)/, '<h1 class="text-2xl font-black text-white mt-8 mb-4">$1</h1>')
                        .replace(/^\s*[\*\-]\s+(.*)/, '<div class="flex gap-3 ml-4 mb-2 items-start text-slate-300/90"><span class="text-primary font-black mt-1">•</span><span>$1</span></div>')
                        .replace(/^\d\.\s+(.*)/, '<div class="flex gap-3 ml-2 mb-2 items-start"><span class="text-primary font-black mt-1 text-sm">$&</span></div>')
                        .replace(/^\s*---\s*$/, '<hr class="border-white/10 my-6" />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-black">$1</strong>');
                        
                      return <div key={j} className="animate-in fade-in slide-in-from-left-2 duration-500" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
                    })}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-primary/70 font-black border-t border-white/5 pt-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Powered by Gemini 2.5 Flash Agricultural Engine
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
