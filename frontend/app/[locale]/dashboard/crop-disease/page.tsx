"use client";

import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, ShieldCheck, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { AIExplanationCard } from "@/app/components/AIExplanationCard";
import clsx from "clsx";

interface Prediction {
  class: string;
  confidence: number;
}

export default function CropDiseaseDetection() {
  const t = useTranslations("crop_disease_page");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Prediction[] | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setAiInsights(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setAiInsights(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("/api/crop-disease/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t("error_upload"));
      }

      const data = await response.json();
      setResults(data.predictions);
      setAiInsights(data.ai_insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_upload"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResults(null);
    setAiInsights(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-4 sm:mt-6 animate-fade-in pb-12 overflow-x-hidden">
      <div className="mb-10 px-1">
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
          Machine Intelligence
        </span>
        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{t("title")}</h2>
        <p className="mt-3 text-slate-400 max-w-2xl leading-relaxed text-sm sm:text-base font-label">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel relative rounded-3xl border border-white/10 shadow-2xl overflow-hidden min-h-[450px] flex flex-col group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

            <div className="relative flex-1 flex flex-col p-6 sm:p-8">
              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-5 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group/upload"
                >
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-slate-400 group-hover/upload:text-primary group-hover/upload:scale-110 transition-all duration-500 shadow-xl border border-white/5">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="text-center px-4">
                    <h4 className="text-xl font-bold text-white mb-2">{t("upload_title")}</h4>
                    <p className="text-sm text-slate-400 font-label">{t("upload_desc")}</p>
                  </div>
                  <button className="mt-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">
                    {t("select_btn")}
                  </button>
                </div>
              ) : (
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900/50 flex items-center justify-center">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-[380px] w-auto object-contain transition-transform duration-700 hover:scale-105"
                  />
                  
                  {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <motion.div 
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(78,222,163,0.8)] z-10"
                        />
                      </div>
                      <p className="text-primary font-bold text-lg animate-pulse tracking-wide">{t("scanning")}</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {!loading && !results && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6 z-10"
                      >
                        <button 
                          onClick={reset}
                          className="flex-1 py-3.5 rounded-2xl bg-surface-container-high/90 backdrop-blur-md border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleAnalyze}
                          className="flex-1 py-3.5 rounded-2xl liquid-pill text-surface font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <ImageIcon className="w-4 h-4" />
                          {t("scan_btn")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex items-start gap-4 shadow-lg group">
            <div className="mt-1 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Encrypted speciman analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-label max-w-sm">
                Specimen images are processed in a temporary secure memory and are not stored permanently to protect your farm data.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Results Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className={clsx(
            "glass-panel rounded-3xl border shadow-xl transition-all duration-700 overflow-hidden min-h-[530px] flex flex-col relative",
            results ? "border-primary/20 bg-primary/[0.02]" : "border-white/5"
          )}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <h3 className="font-bold text-xl text-white flex items-center gap-3 font-headline">
                <AnimatePresence mode="wait">
                  {results ? (
                    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} key="done">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key="search">
                      <ImageIcon className="w-6 h-6 text-slate-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {t("results_title")}
              </h3>
              {results && (
                <button onClick={reset} className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition-colors">
                  Reset
                </button>
              )}
            </div>

            <div className="flex-1 p-6 sm:p-8 relative z-10">
              {results ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t("top_prediction")}</p>
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 relative group text-center overflow-hidden shadow-[0_0_40px_rgba(78,222,163,0.03)]">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                       <h4 className="text-3xl font-black text-white tracking-tight mb-2 capitalize leading-tight font-headline">
                         {results[0].class}
                       </h4>
                       <div className="flex items-center justify-center gap-3">
                          <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${results[0].confidence * 100}%` }}
                               transition={{ duration: 1.5, ease: "circOut" }}
                               className="h-full bg-primary shadow-[0_0_10px_rgba(78,222,163,0.5)]"
                            />
                          </div>
                          <span className="text-primary font-black text-xl tabular-nums">{(results[0].confidence * 100).toFixed(1)}%</span>
                       </div>
                    </div>
                  </div>

                   {results.length > 1 && (
                    <div className="space-y-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">{t("other_possibilities")}</p>
                      <div className="space-y-3">
                        {results.slice(1, 4).map((res, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group/item">
                             <span className="text-sm font-medium text-slate-300 capitalize group-hover/item:text-white transition-colors">{res.class}</span>
                             <span className="text-sm font-bold text-primary tabular-nums">{(res.confidence * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiInsights && (
                    <AIExplanationCard 
                      explanation={aiInsights} 
                      title={`${results[0].class} - AI Details`} 
                    />
                  )}

                  <div className="p-5 rounded-2xl bg-surface-container-high border border-white/5 flex gap-4 mt-4">
                     <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 border border-secondary/10">
                       <Info className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h5 className="font-bold text-white text-[13px]">{t("prevention")}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed font-label">
                          {t("prevention_desc")}
                        </p>
                     </div>
                  </div>
                  
                  <button 
                    onClick={reset}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                   Scan New Specimen
                  </button>
                </motion.div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-error/10 border border-error/20 flex items-center justify-center text-error mb-6">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-error font-headline font-bold text-xl mb-2">Analysis Interrupted</h4>
                  <p className="text-slate-400 text-sm max-w-xs mb-8">{error}</p>
                  <button onClick={reset} className="text-sm py-3 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">
                    Dismiss and Retry
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center text-white/5 mb-8 relative z-10">
                     <div className="absolute inset-0 rounded-full animate-pulse-slow bg-primary/10 blur-xl opacity-30" />
                     <ImageIcon className="w-10 h-10 opacity-20" />
                  </div>
                  <h4 className="text-slate-400 font-headline font-bold mb-2 z-10">Awaiting Specimen</h4>
                  <p className="text-slate-500 font-label text-xs leading-relaxed max-w-[220px] mx-auto z-10 opacity-70">
                    {t("no_image")}
                  </p>
                  
                  <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-primary/5 blur-[80px] rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
