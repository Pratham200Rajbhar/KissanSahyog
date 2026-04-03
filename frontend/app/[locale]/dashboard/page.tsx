"use client";

import { Upload, PlusCircle, Tractor, ShieldAlert, Sun, CloudRain, Lightbulb, History, Activity, Sprout } from "lucide-react";
import { useLocation } from "../../components/LocationContext";
import { Link } from "../../../i18n/routing";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function DashboardOverview() {
  const { location, loading: locLoading } = useLocation();
  const t = useTranslations();
  
  const [history, setHistory] = useState<{
    yield_predictions: any[],
    disease_detections: any[],
    crop_recommendations: any[]
  }>({
    yield_predictions: [],
    disease_detections: [],
    crop_recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/history/summary", {
          withCredentials: true // Pass next-auth cookies
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const latestYield = history.yield_predictions.length > 0 ? history.yield_predictions[0] : null;
  const latestDisease = history.disease_detections.length > 0 ? history.disease_detections[0] : null;
  const latestCrop = history.crop_recommendations.length > 0 ? history.crop_recommendations[0] : null;

  // Prepare chart data for Yield History
  const chartData = history.yield_predictions.slice().reverse().map((item, idx) => ({
    name: `Run ${idx + 1}`,
    yield: item.predicted_yield,
    crop: item.crop,
    date: new Date(item.created_at).toLocaleDateString()
  }));

  const kpis = [
    {
      title: t("Latest Yield Prediction"),
      value: latestYield ? latestYield.predicted_yield : "---",
      unit: latestYield ? "kg/ha" : "",
      icon: Tractor,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      pill: latestYield ? latestYield.crop : t("Awaiting Data"),
    },
    {
      title: t("Top Crop Recommendation"),
      value: latestCrop ? latestCrop.top_crop : "---",
      unit: "",
      icon: Sprout,
      iconClass: "text-tertiary",
      bgClass: "bg-tertiary/10",
      pill: latestCrop ? `${(latestCrop.confidence * 100).toFixed(0)}% Match` : t("Pending Analysis"),
    },
    {
      title: t("Recent Disease Detection"),
      value: latestDisease ? latestDisease.disease_name : "---",
      unit: "",
      icon: Activity,
      iconClass: "text-[#10b981]",
      bgClass: "bg-[#10b981]/10",
      pill: latestDisease ? latestDisease.crop : t("No Issues"),
    },
    {
      title: t("Live Temperature"),
      value: location.temperature ? Math.round(location.temperature).toString() : "---",
      unit: "°C",
      icon: Sun,
      iconClass: "text-orange-400",
      bgClass: "bg-orange-400/10",
      pill: location.humidity ? `${Math.round(location.humidity)}% ${t("Humidity")}` : t("NASA Syncing"),
    },
  ];

  return (
    <div className="mt-8 animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("System Overview")}
          </span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white">{t("Main Dashboard")}</h2>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/disease-detection">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-high border border-outline-variant/10 text-slate-200 font-label text-sm font-semibold hover:bg-surface-container-highest transition-all duration-300">
              <Upload className="text-primary w-5 h-5" />
              {t("Upload Disease Image")}
            </button>
          </Link>
          <Link href="/dashboard/yield-prediction">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full liquid-pill text-[#0b1326] font-label text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
              <PlusCircle className="w-5 h-5" />
              {t("Predict New Yield")}
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-xl border border-outline-variant/5 shadow-xl hover:translate-y-[-4px] transition-transform duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${kpi.bgClass} flex items-center justify-center`}>
                  <Icon className={`${kpi.iconClass} w-6 h-6`} />
                </div>
                <span className={`font-label text-[10px] ${kpi.iconClass} font-bold px-2 py-1 ${kpi.bgClass} rounded-md`}>
                  {kpi.pill}
                </span>
              </div>
              <p className="font-label text-xs uppercase tracking-widest text-slate-400 mb-1">{kpi.title}</p>
              <h3 className="font-headline text-3xl font-black text-white truncate">
                {kpi.value}
                {kpi.unit && <span className="text-lg font-medium text-slate-500 ml-1">{kpi.unit}</span>}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Yield Projection Chart */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-8 border border-outline-variant/5 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-headline text-xl font-bold text-white">{t("Historical Yield Projections")}</h4>
              <p className="font-label text-sm text-slate-400">{t("Your recent prediction runs")}</p>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[250px] relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500 font-label text-sm uppercase tracking-widest animate-pulse">{t("Loading history...")}</p>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4edea3" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1326', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="yield" stroke="#4edea3" fillOpacity={1} fill="url(#colorYield)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500 font-label text-sm uppercase tracking-widest bg-[#0b1326]/80 px-4 py-2 rounded-full border border-white/5">{t("No Data Yet. Predict Your First Yield!")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Environment Radar (Kept intact for real-time sensing) */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-8 border border-outline-variant/5">
          <h4 className="font-headline text-xl font-bold mb-6 text-white">{t("Live Environment Sync")}</h4>
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-slate-400 mb-1">
                <span>{t("Rainfall Confidence")}</span>
                <span className="font-bold text-white">{location.rainfall ? t("High") : "---"}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className={`bg-tertiary h-full transition-all duration-1000 ${location.rainfall ? "w-[85%]" : "w-0"}`} />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-slate-400 mb-1">
                <span>{t("Temp Variation")}</span>
                <span className="font-bold text-white">{location.temperature ? t("Normal") : "---"}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className={`bg-primary h-full transition-all duration-1000 ${location.temperature ? "w-[60%]" : "w-0"}`} />
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-[10px] text-slate-400 font-label leading-relaxed uppercase tracking-wider">
                <span className="text-primary font-bold">Status:</span> {locLoading ? t("Checking NASA Data...") : t("System Operational & Synced")}
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div className="lg:col-span-12 glass-panel rounded-xl p-8 border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-headline text-xl font-bold text-white">{t("Farmer Action Items")}</h4>
              <p className="font-label text-sm text-slate-400">{t("Priority alerts based on your history against current conditions")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Weather Action Item */}
            {location.temperature && (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-full bg-orange-400/10 flex items-center justify-center text-orange-400">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-400/10">{t("Live Alert")}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-orange-400 transition-colors">Temperature Normal</h5>
                  <p className="text-sm text-slate-400 mt-1">Current soil temp ({Math.round(location.temperature)}°C) is ideal for sowing major crops.</p>
                </div>
              </div>
            )}

            {/* Disease Action Item */}
            {latestDisease ? (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-red-400/10">{t("Post-Scan Action")}</span>
                    <span className="text-[10px] text-slate-500 font-medium">For {latestDisease.crop}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-red-400 transition-colors">Treat {latestDisease.disease_name}</h5>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2" title={latestDisease.remedy}>{latestDisease.remedy}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#10b981] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[#10b981]/10">{t("Suggestion")}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-[#10b981] transition-colors">Scan Your Crops</h5>
                  <p className="text-sm text-slate-400 mt-1">Found a suspicious leaf? Take a photo and upload it anomaly detection.</p>
                </div>
              </div>
            )}

            {/* Recommendation Action Item */}
            {latestCrop ? (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary/10">{t("Next Season")}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-primary transition-colors">Consider {latestCrop.top_crop}</h5>
                  <p className="text-sm text-slate-400 mt-1">Based on you recent soil analysis, {latestCrop.top_crop} is highly recommended.</p>
                </div>
              </div>
            ) : (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
                <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Tractor className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary/10">{t("Growth Plan")}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-primary transition-colors">Start Planning</h5>
                  <p className="text-sm text-slate-400 mt-1">Get AI crop recommendations based on your soil and regional weather data.</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
