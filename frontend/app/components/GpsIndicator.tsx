"use client";

import React from "react";
import { MapPin } from "lucide-react";

interface GpsIndicatorProps {
  isVisible: boolean;
}

export const GpsIndicator = ({ isVisible }: GpsIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[9px] font-black text-primary uppercase tracking-tighter animate-in fade-in zoom-in duration-300 ml-2">
      <MapPin className="w-2.5 h-2.5" />
      Sync via GPS
    </span>
  );
};
