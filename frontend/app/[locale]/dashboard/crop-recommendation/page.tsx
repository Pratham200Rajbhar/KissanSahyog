"use client";

import { useState, useEffect } from "react";
import { 
  Sprout, 
  Leaf, 
  TestTube, 
  Thermometer, 
  CloudRain, 
  Droplets, 
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import clsx from "clsx";
import { useLocation } from "../../../components/LocationContext";
import { LocationDetector } from "../../../components/LocationDetector";
import { GpsIndicator } from "../../../components/GpsIndicator";
import { useTranslations } from "next-intl";
import { AIExplanationCard } from "../../../components/AIExplanationCard";

interface RecommendationItem {
  crop: string;
  confidence: number;
}

interface ApiResponse {
  recommendations: RecommendationItem[];
  ai_explanation?: string;
}

interface ApiValidationError {
  loc: Array<string | number>;
  msg: string;
}

export default function CropRecommendationPage() {
  type FormDataKey = 'N' | 'P' | 'K' | 'pH' | 'temperature' | 'humidity' | 'rainfall';

  const { location } = useLocation();
  const t = useTranslations();
  const [formData, setFormData] = useState<Record<FormDataKey, number | "">>({
    N: "",
    P: "",
    K: "",
    pH: "",
    temperature: "",
    humidity: "",
    rainfall: "",
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [error, setError] = useState("");

  // Auto-fill from location
  useEffect(() => {
    if (location.lastUpdated) {
      setFormData((prev: Record<FormDataKey, number | "">) => ({
        ...prev,
        N: location.nitrogen ?? prev.N,
        P: location.phosphorus ?? prev.P,
        K: location.potassium ?? prev.K,
        pH: location.ph ?? prev.pH,
        temperature: location.temperature ?? prev.temperature,
        humidity: location.humidity ?? prev.humidity,
        rainfall: location.rainfall ?? prev.rainfall,
      }));
    }
  }, [location.lastUpdated, location.nitrogen, location.phosphorus, location.potassium, location.ph, location.temperature, location.humidity, location.rainfall]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === "" ? "" : parseFloat(value) });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations([]);
    setAiExplanation("");

    try {
      const apiUrl = "/api";
      
      const submissionData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = value === "" ? 0 : value;
        return acc;
      }, {} as Record<string, string | number>);

      const res = await fetch(`${apiUrl}/recommend/crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        let message = "Failed to fetch recommendations";
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            message = (errorData.detail as ApiValidationError[])
              .map((d) => `${d.loc[d.loc.length - 1]}: ${d.msg}`)
              .join(", ");
          } else {
            message = errorData.detail;
          }
        }
        throw new Error(message);
      }

      const data: ApiResponse = await res.json();
      setRecommendations(data.recommendations);
      if (data.ai_explanation) setAiExplanation(data.ai_explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("crop.advisory_engine")}
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            {t("crop.title_crop")} <span className="text-primary">{t("crop.title_recommendation")}</span>
          </h1>
          <p className="mt-3 text-slate-400 font-label max-w-xl">
            {t("crop.description")}
          </p>
        </div>
        <div className="pb-2">
          <LocationDetector />
        </div>
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-7">
        {/* Input Form Panel */}
        <div className="xl:col-span-12 lg:xl:col-span-7">
          <div className="glass-panel p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <form onSubmit={handlePredict} className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-7 gap-y-5 sm:gap-y-6">
                {[
                  { name: "N", label: t("crop.nitrogen"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "P", label: t("crop.phosphorus"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "K", label: t("crop.potassium"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "pH", label: t("crop.soil_ph"), icon: TestTube, step: "0.1", unit: "pH" },
                  { name: "temperature", label: t("crop.temp"), icon: Thermometer, step: "0.1", unit: "°C" },
                  { name: "humidity", label: t("crop.humidity"), icon: Droplets, step: "0.1", unit: "%" },
                  { name: "rainfall", label: t("crop.rainfall"), icon: CloudRain, step: "0.1", unit: "mm" },
                ].map((field) => {
                  const isGpsFilled = (
                    (field.name === 'N' && location.nitrogen === formData.N) ||
                    (field.name === 'P' && location.phosphorus === formData.P) ||
                    (field.name === 'K' && location.potassium === formData.K) ||
                    (field.name === 'pH' && location.ph === formData.pH) ||
                    (field.name === 'temperature' && location.temperature === formData.temperature) ||
                    (field.name === 'humidity' && location.humidity === formData.humidity) ||
                    (field.name === 'rainfall' && location.rainfall === formData.rainfall)
                  );

                  return (
                    <div key={field.name} className="space-y-2 group/input">
                      <label className="flex items-center justify-between font-label text-[10px] uppercase tracking-widest text-slate-400 group-focus-within/input:text-primary transition-colors">
                        <span className="flex items-center gap-2">
                          <field.icon className="w-3 h-3" /> {field.label}
                          <GpsIndicator isVisible={!!isGpsFilled} />
                        </span>
                        <span className="opacity-50 lowercase">{field.unit}</span>
                      </label>
                      <input
                        type="number"
                        name={field.name}
                        value={formData[field.name as FormDataKey]}
                        onChange={handleChange}
                        step={field.step || "1"}
                        placeholder={`e.g. ${field.name === 'pH' ? '6.5' : field.name === 'temperature' ? '25.0' : field.name === 'humidity' ? '80.0' : field.name === 'rainfall' ? '100.0' : '50'}`}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm font-label focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white"
                        required
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-label font-bold text-base sm:text-lg transition-all active:scale-[0.98]",
                  loading 
                    ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                    : "liquid-pill text-[#0b1326] shadow-xl shadow-primary/20 hover:brightness-110"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    {t("crop.calculating")}
                  </>
                ) : (
                  <>
                    {t("crop.predict_btn")}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-label">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="xl:col-span-12 lg:xl:col-span-5">
           <div className="flex flex-col h-full gap-6">
            <div className="glass-panel p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 flex-1 relative overflow-hidden group shadow-2xl">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-tertiary/10 transition-colors" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <h3 className="font-label text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> {t("crop.matrix")}
                </h3>

                {recommendations.length > 0 ? (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    {recommendations.map((item: RecommendationItem, index: number) => (
                      <div key={item.crop} className={clsx(
                        "p-5 sm:p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.02]",
                        index === 0 ? "bg-white/[0.05] border-primary/20" : "bg-transparent"
                      )}>
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <span className={clsx(
                              "font-label text-[10px] uppercase tracking-widest",
                              index === 0 ? "text-primary" : "text-slate-500"
                            )}>
                              {index === 0 ? t("crop.top_selection") : `${t("crop.alternative")} ${index}`}
                            </span>
                            <h4 className="text-xl sm:text-3xl font-headline font-black text-white capitalize">
                              {item.crop}
                            </h4>
                          </div>
                          <div className="text-right">
                            <div className={clsx(
                              "text-xl sm:text-2xl font-headline font-black",
                              index === 0 ? "text-primary" : "text-slate-200"
                            )}>
                              {(item.confidence * 100).toFixed(1)}%
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label">{t("crop.confidence")}</p>
                          </div>
                        </div>
                        
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              index === 0 ? "bg-primary" : "bg-slate-500"
                            )}
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-12">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Leaf className="w-10 h-10 text-slate-500" />
                    </div>
                    <p className="font-label text-sm text-slate-400 max-w-[200px]">
                      {t("crop.initialize_engine")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <AIExplanationCard explanation={aiExplanation} />
          </div>
        </div>
      </div>
    </div>
  );
}
