"use client";

import { Upload, PlusCircle, Tractor, ShieldAlert, Sun, CloudRain, Lightbulb } from "lucide-react";
import { useLocation } from "../components/LocationContext";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function DashboardOverview() {
  const { location, loading } = useLocation();
  const { t } = useLanguage();

  const kpis = [
    {
      title: t("Predicted Yield"),
      value: "---",
      unit: "t/ha",
      icon: Tractor,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      pill: t("Awaiting Simulation"),
    },
    {
      title: t("Regional Context"),
      value: location.state || (loading ? t("Syncing...") : t("Unknown")),
      unit: "",
      icon: ShieldAlert,
      iconClass: "text-tertiary",
      bgClass: "bg-tertiary/10",
      pill: location.district || t("Pending GPS"),
    },
    {
      title: t("NASA Rainfall"),
      value: location.rainfall ? location.rainfall.toFixed(0) : "---",
      unit: "mm/y",
      icon: CloudRain,
      iconClass: "text-[#10b981]",
      bgClass: "bg-[#10b981]/10",
      pill: location.rainfall ? t("Verified") : t("Syncing"),
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
              <h3 className="font-headline text-3xl font-black text-white">
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
        <div className="lg:col-span-8 glass-panel rounded-xl p-8 border border-outline-variant/5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h4 className="font-headline text-xl font-bold text-white">{t("Yield Projection Analysis")}</h4>
              <p className="font-label text-sm text-slate-400">{t("Regional baseline for")} {location.state ? location.state : "---"}</p>
            </div>
          </div>
          {/* Chart SVG */}
          <div className="h-64 w-full relative opacity-40">
            <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 800 240">
              <line className="text-outline-variant/10" stroke="currentColor" strokeWidth="1" x1="0" x2="800" y1="40" y2="40" />
              <line className="text-outline-variant/10" stroke="currentColor" strokeWidth="1" x1="0" x2="800" y1="100" y2="100" />
              <line className="text-outline-variant/10" stroke="currentColor" strokeWidth="1" x1="0" x2="800" y1="160" y2="160" />
              <line className="text-outline-variant/10" stroke="currentColor" strokeWidth="1" x1="0" x2="800" y1="220" y2="220" />
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,220 Q50,180 100,190 T200,140 T300,160 T400,90 T500,110 T600,50 T700,70 T800,40 V220 H0 Z" fill="url(#chartGradient)" />
              <path d="M0,220 Q50,180 100,190 T200,140 T300,160 T400,90 T500,110 T600,50 T700,70 T800,40" fill="none" stroke="#4edea3" strokeLinecap="round" strokeWidth="4" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-slate-500 font-label text-sm uppercase tracking-widest bg-[#0b1326]/80 px-4 py-2 rounded-full border border-white/5">{t("Awaiting Simulation Data")}</p>
            </div>
          </div>
        </div>

        {/* Environment Radar */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-8 border border-outline-variant/5">
          <h4 className="font-headline text-xl font-bold mb-6 text-white">{t("Environment Sync")}</h4>
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
                <span className="text-primary font-bold">Status:</span> {loading ? t("Communicating with NASA nodes...") : t("System Operational")}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Insights Panel */}
        <div className="lg:col-span-12 glass-panel rounded-xl p-8 border border-outline-variant/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className="font-headline text-xl font-bold text-white">{t("Recent Insights")}</h4>
              <p className="font-label text-sm text-slate-400">{t("AI-generated alerts based on")} {location.state || "..."}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
              <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-primary/10">{t("Insight")}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{t("Auto-Sync")}</span>
                </div>
                <h5 className="font-headline text-base font-bold text-white group-hover:text-primary transition-colors">{t("Optimal Sowing Window")}</h5>
                <p className="text-sm text-slate-400 mt-1">Based on current GPS coordinates, the soil temperature ({location.temperature ? `${Math.round(location.temperature)}°C` : '---'}) is ideal for sowing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

