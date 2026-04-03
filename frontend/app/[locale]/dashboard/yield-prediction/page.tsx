"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calculator, CloudSun, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useLocation } from "../../../components/LocationContext";
import { LocationDetector } from "../../../components/LocationDetector";
import { GpsIndicator } from "../../../components/GpsIndicator";
import { useTranslations } from "next-intl";

const CROPS = ['chickpea', 'cotton', 'maize', 'rice'];
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Orissa', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

interface YieldResult {
  predicted_yield: number;
  unit: string;
  shap_values: Record<string, number>;
}

interface YieldFormData {
  crop: string;
  state_name: string;
  dist_name: string;
  area_ha: number;
  temperature_c: number;
  humidity_percentage: number;
  rainfall_mm: number;
  wind_speed_m_s: number;
  solar_radiation_mj_m2_day: number;
  n_req_kg_per_ha: number;
  p_req_kg_per_ha: number;
  k_req_kg_per_ha: number;
}

export default function YieldPrediction() {
  const { location } = useLocation();
  const t = useTranslations();
  const [formData, setFormData] = useState<YieldFormData>({
    crop: 'rice',
    state_name: '',
    dist_name: '',
    area_ha: 0.0,
    temperature_c: 0.0,
    humidity_percentage: 0.0,
    rainfall_mm: 0.0,
    wind_speed_m_s: 0.0,
    solar_radiation_mj_m2_day: 0.0,
    n_req_kg_per_ha: 0.0,
    p_req_kg_per_ha: 0.0,
    k_req_kg_per_ha: 0.0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill from location
  useEffect(() => {
    if (location.state || location.temperature !== null) {
      setFormData((prev: YieldFormData) => ({
        ...prev,
        state_name: location.state || prev.state_name,
        dist_name: location.district || prev.dist_name,
        temperature_c: location.temperature ?? prev.temperature_c,
        humidity_percentage: location.humidity ?? prev.humidity_percentage,
        rainfall_mm: location.rainfall ?? prev.rainfall_mm,
      }));
    }
  }, [location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: YieldFormData) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiUrl = "http://localhost:8000/api";
      
      const response = await fetch(`${apiUrl}/predict/yield`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during prediction";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 animate-fade-in px-4 pb-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("Predictive Intelligence")}
          </span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white">{t("Yield Simulation")}</h2>
        </div>
        <LocationDetector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 glass-panel p-8 rounded-2xl border border-outline-variant/10 shadow-2xl">
          <h3 className="font-headline text-xl font-bold mb-8 flex items-center gap-3 text-white">
            <Calculator className="w-6 h-6 text-primary" />
            {t("Field Parameters")}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Categorical Inputs */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{t("Crop Variety")}</label>
                <select 
                  name="crop"
                  value={formData.crop}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                >
                  {CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("State Registry")}
                  <GpsIndicator isVisible={!!location.state && formData.state_name === location.state} />
                </label>
                <select 
                  name="state_name"
                  value={formData.state_name}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("District Focus")}
                  <GpsIndicator isVisible={!!location.district && formData.dist_name === location.district} />
                </label>
                <input 
                  type="text"
                  name="dist_name"
                  value={formData.dist_name}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                  placeholder="e.g. Pune"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{t("Cultivation Area (ha)")}</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="area_ha"
                  value={formData.area_ha}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all" 
                />
              </div>

              {/* Environmental Details */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("Temperature (°C)")}
                  <GpsIndicator isVisible={location.temperature !== null && formData.temperature_c === location.temperature} />
                </label>
                <input 
                  type="number"
                  name="temperature_c"
                  value={formData.temperature_c}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("Avg Humidity (%)")}
                  <GpsIndicator isVisible={location.humidity !== null && formData.humidity_percentage === location.humidity} />
                </label>
                <input 
                  type="number"
                  name="humidity_percentage"
                  value={formData.humidity_percentage}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("Annual Rainfall (mm)")}
                  <GpsIndicator isVisible={location.rainfall !== null && formData.rainfall_mm === location.rainfall} />
                </label>
                <input 
                  type="number"
                  name="rainfall_mm"
                  value={formData.rainfall_mm}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{t("Wind Velocity (m/s)")}</label>
                <input 
                  type="number"
                  name="wind_speed_m_s"
                  value={formData.wind_speed_m_s}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">{t("Solar Intensity (MJ/m²)")}</label>
                <input 
                  type="number"
                  name="solar_radiation_mj_m2_day"
                  value={formData.solar_radiation_mj_m2_day}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              {/* Nutrients - User requirements */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("N Capacity (kg/ha)")}
                </label>
                <input 
                  type="number"
                  name="n_req_kg_per_ha"
                  value={formData.n_req_kg_per_ha}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("P Capacity (kg/ha)")}
                </label>
                <input 
                  type="number"
                  name="p_req_kg_per_ha"
                  value={formData.p_req_kg_per_ha}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold ml-1 flex items-center">
                  {t("K Capacity (kg/ha)")}
                </label>
                <input 
                  type="number"
                  name="k_req_kg_per_ha"
                  value={formData.k_req_kg_per_ha}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline/10 rounded-xl p-4 text-sm font-label focus:ring-2 focus:ring-primary/40 text-slate-200 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className={`w-full py-5 rounded-2xl liquid-pill text-surface font-label font-bold text-xl shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t("Processing Vectors...")}
                </>
              ) : (
                t("Execute Predictive Modeling")
              )}
            </button>
          </form>
        </div>

        <div className="md:col-span-4 space-y-8">
          <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-all duration-700"></div>
             <div className="flex items-center gap-4 mb-6 relative">
               <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                 <TrendingUp className="w-8 h-8" />
               </div>
               <div>
                  <h4 className="font-bold text-lg font-headline text-white">{t("Predicted Output")}</h4>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">{t("Quantum Simulation")}</p>
               </div>
             </div>
             
             {result ? (
               <div className="space-y-6 relative">
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{result.predicted_yield.toLocaleString()}</span>
                    <span className="text-xl font-bold text-primary">{result.unit}</span>
                 </div>
                 
                 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">{t("Stable Estimation")}</span>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-400">
                      <span>{t("Feature Impact")}</span>
                      <span>{t("Weight")}</span>
                    </div>
                    {Object.entries(result.shap_values).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs font-label">
                          <span className="text-slate-300">{key}</span>
                          <span className="text-primary font-bold">{Math.round((val as number) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(val as number) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : error ? (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <AlertCircle className="w-12 h-12 text-error mb-4 opacity-50" />
                 <p className="text-error font-medium">{error}</p>
                 <button onClick={() => setError(null)} className="mt-4 text-xs underline text-slate-400">Clear Error</button>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/30 animate-spin-slow"></div>
                 <p className="text-sm font-label text-slate-500 leading-relaxed max-w-[200px]">
                   Awaiting operational parameters for yield derivation
                 </p>
               </div>
             )}
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-outline-variant/10 flex items-start gap-4 shadow-lg group hover:border-tertiary/30 transition-all">
             <div className="w-12 h-12 rounded-xl bg-tertiary/20 flex items-center justify-center text-tertiary border border-tertiary/20">
               <CloudSun className="w-6 h-6" />
             </div>
             <div>
                <h4 className="font-bold text-sm tracking-tight mb-1 text-white">{t("Weather Context Sync")}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t("Real-time environmental synchronization enabled for")} {formData.state_name}.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
