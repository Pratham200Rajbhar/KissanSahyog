"use client";

import { Expand, MapPin } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";

export default function MapInsights() {
  const { t } = useLanguage();
  return (
    <div className="mt-8 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            {t("Geospatial Analysis")}
          </span>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight">{t("Regional Map Insights")}</h2>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2 rounded-full glass-panel border border-outline-variant/10 text-on-surface font-label text-sm font-semibold hover:bg-white/5 transition-all">
            <MapPin className="text-primary w-4 h-4" />
            {t("North Sector Focus")}
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl border border-outline-variant/10 overflow-hidden relative group">
        <Image
          alt="Field Map"
          className="w-full h-full object-cover transition-all duration-1000"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnvkui43FrvIoKHu47ZmB5xvaAqqdM_c3SHpqQi9qx1_nLTe16Y7Fb2YXwwZ4XCNK9_lvaFNricDw6IDacKLe-KdPuEQRojG5de46CjCn0zuxapA26Wmxiz_E-WOy6U8tqJzV9s8EO1zBIRGONHuoU0RveUiEQ3YrOkqHYoFxAEs3H50tf3hOg9fCOW_mDwv_X7-AJ0qHTSphdUUnxkcXY9srngJEouNyZ8UZ7gPM-P2GM9XffZorVyozwk-YCuIMHh7hfUlhSErc2"
          fill
          priority
        />
        
        {/* Map Overlay Insights */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-6 left-6 grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/10 backdrop-blur-md">
            <h4 className="font-bold text-lg">{t("Sector 1")}</h4>
            <p className="text-sm text-primary font-label">{t("Optimal N2 Levels")}</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-error/20 backdrop-blur-md">
            <h4 className="font-bold text-lg text-error">{t("Sector 4")}</h4>
            <p className="text-sm font-label">{t("Dryness Flagged")}</p>
          </div>
        </div>

        <button className="absolute bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full glass-panel border border-white/20 hover:scale-105 transition-transform text-white">
          <Expand className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
