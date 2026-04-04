"use client";

import { PlusCircle, Tractor, Sun, Lightbulb, Sprout } from "lucide-react";
import { useLocation } from "../../components/LocationContext";
import { Link } from "../../../i18n/routing";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from 'next/dynamic';

const DashboardChart = dynamic(() => import('../../components/DashboardChart'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-xl animate-pulse">
      <div className="text-slate-500 font-label text-xs uppercase tracking-widest">Initialising Analytics...</div>
    </div>
  )
});

interface YieldPrediction {
  id: string;
  crop: string;
  state_name: string;
  district_name: string;
  area_ha: number;
  predicted_yield: number;
  created_at: string;
}

interface CropRecommendation {
  id: string;
  top_crop: string;
  confidence: number;
  recommendations_json: { crop: string; confidence: number }[];
  created_at: string;
}

export default function DashboardOverview() {
  const { location, loading: locLoading } = useLocation();
  const t = useTranslations();
  
  const [history, setHistory] = useState<{
    yield_predictions: YieldPrediction[],
    crop_recommendations: CropRecommendation[]
  }>({
    yield_predictions: [],
    crop_recommendations: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/history/summary");
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
  const latestCrop = history.crop_recommendations.length > 0 ? history.crop_recommendations[0] : null;

  // Prepare chart data for Yield History
  const chartData = history.yield_predictions.slice().reverse().map((item: YieldPrediction, idx: number) => ({
    name: `Run ${idx + 1}`,
    yield: item.predicted_yield,
    crop: item.crop,
    date: new Date(item.created_at).toLocaleDateString()
  }));

  const kpis = [
    {
      title: t("dashboard.latest_yield"),
      value: latestYield ? latestYield.predicted_yield : "---",
      unit: latestYield ? "kg/ha" : "",
      icon: Tractor,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      pill: latestYield ? latestYield.crop : t("dashboard.awaiting_simulation"),
    },
    {
      title: t("dashboard.top_crop"),
      value: latestCrop ? latestCrop.top_crop : "---",
      unit: "",
      icon: Sprout,
      iconClass: "text-tertiary",
      bgClass: "bg-tertiary/10",
      pill: latestCrop ? `${(latestCrop.confidence * 100).toFixed(0)}% Match` : t("common.syncing"),
    },
    {
      title: t("dashboard.live_temperature"),
      value: location.temperature ? Math.round(location.temperature).toString() : "---",
      unit: "°C",
      icon: Sun,
      iconClass: "text-orange-400",
      bgClass: "bg-orange-400/10",
      pill: location.humidity ? `${Math.round(location.humidity)}% ${t("common.humidity")}` : t("dashboard.nasa_syncing"),
    },
  ];

  return (
    <div className="mt-2 sm:mt-4 animate-fade-in">
      <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("navigation.system_overview")}
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">{t("navigation.main_dashboard")}</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link href="/dashboard/yield-prediction">
            <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl liquid-pill text-[#0b1326] font-label text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_10px_40px_rgba(78,222,163,0.3)]">
              <PlusCircle className="w-5 h-5" />
              {t("yield.predict_new")}
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 sm:p-7 rounded-2xl border border-white/5 shadow-2xl hover:translate-y-[-4px] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl ${kpi.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`${kpi.iconClass} w-7 h-7`} />
                </div>
                <span className={`font-label text-[10px] ${kpi.iconClass} font-black px-3 py-1.5 ${kpi.bgClass} rounded-full tracking-wider`}>
                  {kpi.pill}
                </span>
              </div>
              <p className="font-label text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold opacity-70">{kpi.title}</p>
              <h3 className="font-headline text-4xl font-black text-white truncate">
                {kpi.value}
                {kpi.unit && <span className="text-xl font-bold text-slate-500 ml-2">{kpi.unit}</span>}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Yield Projection Chart */}
        <div className="xl:col-span-8 glass-panel rounded-2xl p-5 sm:p-8 border border-white/5 relative overflow-hidden flex flex-col min-h-[420px] shadow-2xl">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h4 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-tight">{t("dashboard.historical_projections")}</h4>
              <p className="font-label text-sm text-slate-400 font-medium">{t("dashboard.recent_runs")}</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500 font-label text-xs uppercase tracking-widest animate-pulse">{t("dashboard.loading_history")}</p>
              </div>
            ) : chartData.length > 0 ? (
              <DashboardChart data={chartData} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-slate-500 font-label text-xs uppercase tracking-widest bg-white/[0.02] px-6 py-3 rounded-full border border-white/5">{t("dashboard.no_data_yield")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Environment Radar (Kept intact for real-time sensing) */}
        <div className="xl:col-span-4 glass-panel rounded-xl p-5 sm:p-8 border border-outline-variant/5">
          <h4 className="font-headline text-xl font-bold mb-6 text-white">{t("dashboard.live_env_sync")}</h4>
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-slate-400 mb-1">
                <span>{t("dashboard.rainfall_confidence")}</span>
                <span className="font-bold text-white">{location.rainfall ? t("common.high") : "---"}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className={`bg-tertiary h-full transition-all duration-1000 ${location.rainfall ? "w-[85%]" : "w-0"}`} />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-label uppercase tracking-widest text-slate-400 mb-1">
                <span>{t("dashboard.temp_variation")}</span>
                <span className="font-bold text-white">{location.temperature ? t("common.normal") : "---"}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className={`bg-primary h-full transition-all duration-1000 ${location.temperature ? "w-[60%]" : "w-0"}`} />
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-[10px] text-slate-400 font-label leading-relaxed uppercase tracking-wider">
                <span className="text-primary font-bold">Status:</span> {locLoading ? t("dashboard.checking_nasa") : t("dashboard.operational_synced")}
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Insights Panel */}
        <div className="xl:col-span-12 glass-panel rounded-xl p-5 sm:p-8 border border-outline-variant/5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 sm:mb-8">
            <div>
              <h4 className="font-headline text-xl font-bold text-white">{t("dashboard.action_items")}</h4>
              <p className="font-label text-sm text-slate-400">{t("dashboard.priority_alerts")}</p>
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
                    <span className="text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-400/10">{t("dashboard.live_alert")}</span>
                  </div>
                  <h5 className="font-headline text-base font-bold text-white group-hover:text-orange-400 transition-colors">Temperature Normal</h5>
                  <p className="text-sm text-slate-400 mt-1">Current soil temp ({Math.round(location.temperature)}°C) is ideal for sowing major crops.</p>
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
                    <span className="text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary/10">{t("dashboard.next_season")}</span>
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
                    <span className="text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary/10">{t("dashboard.growth_plan")}</span>
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
