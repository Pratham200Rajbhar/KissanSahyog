"use client";

import React from "react";
import { MapPin, RefreshCw, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { useLocation } from "./LocationContext";
import { useTranslations } from "next-intl";

export const LocationDetector = () => {
  const { location, loading, error, permissionDenied, refreshLocation } = useLocation();
  const t = useTranslations();

  if (permissionDenied) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-surface-container-high border border-primary/20 rounded-2xl animate-in slide-in-from-right-4 fade-in duration-500 shadow-xl shadow-primary/5 max-w-full">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-on-surface uppercase tracking-wider">{t("dashboard.location_permission_title")}</span>
          </div>
          <span className="text-[10px] text-slate-400 max-w-[200px] leading-tight font-label">
            {t("dashboard.location_permission_desc")}
          </span>
        </div>
        <button
          onClick={refreshLocation}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-lg shadow-primary/20 font-label w-full sm:w-auto"
        >
          {t("dashboard.location_grant_btn")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={refreshLocation}
        disabled={loading}
        className={`group relative flex items-center gap-3 px-4 sm:px-6 py-3 bg-surface-container-high border border-outline/10 rounded-2xl font-label text-sm font-bold transition-all hover:bg-surface-container-highest active:scale-[0.98] w-full sm:w-auto ${
          loading ? "cursor-not-allowed opacity-80" : "hover:border-primary/30 shadow-lg shadow-primary/5"
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <MapPin className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        )}
        
        <div className="flex flex-col items-start">
          <span className="text-on-surface">
            {loading ? "Synchronizing Context..." : location.state ? "Location Active" : "Detect Location"}
          </span>
          {location.state && !loading && (
            <span className="text-[10px] text-primary/70 uppercase tracking-widest font-black">
              {location.district}, {location.state}
            </span>
          )}
        </div>

        {!loading && (
          <RefreshCw className="ml-auto sm:ml-4 w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-error/10 border border-error/20 rounded-xl animate-in slide-in-from-top-1 fadeIn duration-300">
          <AlertCircle className="w-4 h-4 text-error" />
          <span className="text-[11px] text-error font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};
