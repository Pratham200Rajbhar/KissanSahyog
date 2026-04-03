"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileImage, ShieldCheck, AlertCircle, RefreshCw, Loader2, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useLocation } from "../../../components/LocationContext";
import { LocationDetector } from "../../../components/LocationDetector";
import { GpsIndicator } from "../../../components/GpsIndicator";
import { useTranslations } from "next-intl";

interface DetectionResult {
  disease: string;
  confidence: number;
  remedy: string;
}

const CROP_OPTIONS = [
  { id: "Brinjal", name: "Brinjal", icon: "🍆" },
  { id: "Castor", name: "Castor", icon: "🌿" },
  { id: "Cumin", name: "Cumin", icon: "🌱" },
  { id: "Guava", name: "Guava", icon: "🍏" },
  { id: "Papaya", name: "Papaya", icon: "🍈" }
];

export default function DiseaseDetection() {
  const { location } = useLocation();
  const t = useTranslations();
  const [selectedCrop, setSelectedCrop] = useState(CROP_OPTIONS[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("crop_type", selectedCrop);

    try {
      const apiUrl = "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/detect/disease`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Detection failed. Please check backend connection.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetDetection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-8 max-w-6xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center md:text-left"
        >
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("Computer Vision")}
          </span>
          <h2 className="font-headline text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t("AI Disease Detection")}
          </h2>
          <p className="text-slate-400 mt-3 text-lg leading-relaxed max-w-2xl">
            {t("Instantly identify pathogenic infections in your crops using our advanced neural analysis system.")}
          </p>
        </motion.div>
        <LocationDetector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls & Upload */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="glass-panel p-8 rounded-2xl border border-white/5 bg-surface-container-low shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10" />
            
            <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              {t("Configure Analysis")}
              <GpsIndicator isVisible={!!location.latitude} />
            </h3>

            {/* Crop Selection */}
            <div className="mb-8">
              <label className="block text-xs font-label text-slate-500 uppercase tracking-wider mb-3">{t("Target Crop")}</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                      selectedCrop === crop.id
                        ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                        : "bg-surface-container-high border-white/5 hover:border-white/20 hover:bg-surface-container"
                    }`}
                  >
                    <span className="text-2xl mb-1">{crop.icon}</span>
                    <span className="text-[10px] font-bold text-center">{t(crop.name)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${
                preview 
                  ? "border-primary/50 bg-primary/5" 
                  : "border-white/10 hover:border-primary/40 hover:bg-white/5"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              {preview ? (
                <div className="relative group w-full h-full min-h-[240px]">
                  <Image 
                    src={preview} 
                    alt="Scan Preview" 
                    className="w-full h-full object-cover rounded-xl shadow-inner border border-white/10"
                    fill
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <p className="text-white font-bold text-sm bg-primary/80 px-4 py-2 rounded-full flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> {t("Change Image")}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-primary/5 animate-pulse">
                    <UploadCloud className="w-10 h-10 text-primary" />
                  </div>
                  <p className="font-bold text-xl text-white mb-2">{t("Click to Upload")}</p>
                  <p className="text-slate-500 text-sm">{t("JPG, PNG or HEIC formats")}</p>
                </>
              )}
            </div>

            <div className="relative group w-full h-full min-h-[240px]">
                  {/* ... same inside ... */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                    <p className="text-white font-bold text-sm bg-primary/80 px-4 py-2 rounded-full flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" /> {t("Change Image")}
                    </p>
                  </div>
            </div>

            {preview && !result && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleUpload}
                disabled={loading}
                className="w-full mt-6 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t("Analyzing Sample...")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    {t("Start AI Diagnostic")}
                  </>
                )}
              </motion.button>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-12 xl:col-span-7 h-full">
          <div className="glass-panel h-full min-h-[500px] p-8 rounded-2xl border border-white/5 bg-surface-container-low shadow-2xl flex flex-col">
            <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <RefreshCw className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
              {t("Analysis Real-time Feed")}
            </h3>

            <div className="flex-grow flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center space-y-6 text-slate-500"
                  >
                    <div className="w-24 h-24 rounded-full bg-surface-container-high border border-white/5 flex items-center justify-center">
                      <FileImage className="w-10 h-10 opacity-30" />
                    </div>
                    <div className="max-w-xs">
                      <p className="font-bold text-lg text-slate-400 mb-2">{t("No active scan")}</p>
                      <p className="text-sm">{t("Upload a crop image and select your crop type to begin analysis.")}</p>
                    </div>
                  </motion.div>
                )}

                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-8"
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-2xl text-white mb-2">{t("Analyzing Bio-Markers")}</p>
                      <div className="flex gap-1 justify-center">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {result && !loading && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full space-y-8"
                  >
                    {/* Hero Result */}
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${
                        result.disease.toLowerCase().includes('healthy') 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {result.disease.toLowerCase().includes('healthy') ? t('Safe Status') : t('Disease Detected')}
                      </div>
                      <h4 className="font-headline text-4xl font-black text-white">{result.disease}</h4>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-surface-container border border-white/5">
                        <p className="text-xs font-label text-slate-500 uppercase mb-4 tracking-tighter">{t("Confidence Index")}</p>
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-4xl font-black font-headline text-primary">{(result.confidence * 100).toFixed(1)}%</span>
                          <span className="text-slate-400 text-xs mb-1">{t("High Accuracy")}</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence * 100}%` }}
                            transition={{ delay: 0.3, duration: 1 }}
                            className="h-full bg-gradient-to-r from-primary/60 to-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                          />
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-surface-container border border-white/5">
                        <p className="text-xs font-label text-slate-500 uppercase mb-4 tracking-tighter">{t("Quick Mitigation")}</p>
                        <div className="flex items-center gap-4">
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{t("Recommended actions available")}</p>
                            <p className="text-slate-400 text-xs mt-1">{t("AI verified solution")}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remedy Full Card */}
                    <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
                      <h5 className="font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary" />
                        {t("Management Strategy")}
                      </h5>
                      <p className="text-slate-300 leading-relaxed text-lg mb-6">
                        {result.remedy}
                      </p>
                      
                      <div className="flex flex-wrap gap-3">
                        <button onClick={resetDetection} className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> {t("Rescan Crop")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
