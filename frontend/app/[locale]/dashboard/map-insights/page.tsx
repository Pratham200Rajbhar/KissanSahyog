"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

export default function MapInsights() {
  const t = useTranslations();
  return (
    <div className="mt-6 animate-fade-in flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-5 shrink-0">
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1 block">
          {t("Satellite Field View")}
        </span>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight">
          {t("Crop Health Map")}
        </h2>
        <p className="text-on-surface-muted text-sm mt-1">
          {t("View your field vegetation health using Sentinel-2 satellite imagery. Green = healthy crops, brown = dry/bare soil, blue = water.")}
        </p>
      </div>
      <MapClient />
    </div>
  );
}
