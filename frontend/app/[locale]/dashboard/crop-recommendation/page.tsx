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

interface RecommendationItem {
  crop: string;
  confidence: number;
}

export default function CropRecommendationPage() {
  type FormDataKey = 'N' | 'P' | 'K' | 'pH' | 'temperature' | 'humidity' | 'rainfall';

  const { location } = useLocation();
  const t = useTranslations();
  const [formData, setFormData] = useState<Record<FormDataKey, number>>({
    N: 0,
    P: 0,
    K: 0,
    pH: 0.0,
    temperature: 0.0,
    humidity: 0.0,
    rainfall: 0.0,
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [error, setError] = useState("");

  // Auto-fill from location
  useEffect(() => {
    if (location.temperature !== null) {
      setFormData((prev: Record<FormDataKey, number>) => ({
        ...prev,
        temperature: location.temperature ?? prev.temperature,
        humidity: location.humidity ?? prev.humidity,
        rainfall: location.rainfall ?? prev.rainfall,
      }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecommendations([]);

    try {
      const apiUrl = "http://localhost:8000/api";
      
      const res = await fetch(`${apiUrl}/recommend/crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch recommendations");
      }

      const data = await res.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("AI Advisory Engine")}
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-white">
            {t("Crop")} <span className="text-primary">{t("Recommendation")}</span>
          </h1>
          <p className="mt-3 text-slate-400 font-label max-w-xl">
            {t("Our neural engine analyzes soil chemistry and environmental variables to recommend the most sustainable and profitable crops for your specific terrain.")}
          </p>
        </div>
        <div className="pb-2">
          <LocationDetector />
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Panel */}
        <div className="lg:col-span-7">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <form onSubmit={handlePredict} className="relative z-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { name: "N", label: t("Nitrogen (N)"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "P", label: t("Phosphorus (P)"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "K", label: t("Potassium (K)"), icon: FlaskConical, unit: "mg/kg" },
                  { name: "pH", label: t("Soil pH"), icon: TestTube, step: "0.1", unit: "pH" },
                  { name: "temperature", label: t("Temperature"), icon: Thermometer, step: "0.1", unit: "°C" },
                  { name: "humidity", label: t("Relative Humidity"), icon: Droplets, step: "0.1", unit: "%" },
                  { name: "rainfall", label: t("Annual Rainfall"), icon: CloudRain, step: "0.1", unit: "mm" },
                ].map((field) => {
                  const isGpsFilled = (
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
                  "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-label font-bold text-lg transition-all active:scale-[0.98]",
                  loading 
                    ? "bg-white/5 text-slate-500 cursor-not-allowed" 
                    : "liquid-pill text-[#0b1326] shadow-xl shadow-primary/20 hover:brightness-110"
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    {t("Calculating Probabilities...")}
                  </>
                ) : (
                  <>
                    {t("Predict Optimal Crops")}
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
        <div className="lg:col-span-5 h-full">
          <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-full flex flex-col relative overflow-hidden group shadow-2xl">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-tertiary/5 rounded-full -ml-32 -mb-32 blur-3xl group-hover:bg-tertiary/10 transition-colors" />
            
            <div className="relative z-10 flex-1 flex flex-col">
              <h3 className="font-label text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> {t("Recommendation Matrix")}
              </h3>

              {recommendations.length > 0 ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  {recommendations.map((item: RecommendationItem, index: number) => (
                    <div key={item.crop} className={clsx(
                      "p-6 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.02]",
                      index === 0 ? "bg-white/[0.05] border-primary/20" : "bg-transparent"
                    )}>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <span className={clsx(
                            "font-label text-[10px] uppercase tracking-widest",
                            index === 0 ? "text-primary" : "text-slate-500"
                          )}>
                            {index === 0 ? t("Top Selection") : `${t("Alternative")} ${index}`}
                          </span>
                          <h4 className="text-3xl font-headline font-black text-white capitalize">
                            {item.crop}
                          </h4>
                        </div>
                        <div className="text-right">
                          <div className={clsx(
                            "text-2xl font-headline font-black",
                            index === 0 ? "text-primary" : "text-slate-200"
                          )}>
                            {(item.confidence * 100).toFixed(1)}%
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label">{t("Confidence")}</p>
                        </div>
                      </div>
                      
                      {/* Confidence Bar */}
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
                  
                  <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <p className="text-xs text-slate-300 font-label leading-relaxed">
                      <strong className="text-primary uppercase tracking-widest block mb-1">{t("AI Insight:")}</strong>
                      {t("The recommended crops are selected based on high adaptability to your current soil pH")} ({formData.pH}) {t("and predicted rainfall")} ({formData.rainfall}mm). {t("Consider starting with the top selection for maximum yield potential.")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-12">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Leaf className="w-10 h-10 text-slate-500" />
                  </div>
                  <p className="font-label text-sm text-slate-400 max-w-[200px]">
                    {t("Initialize the engine by entering soil data and environment variables.")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
