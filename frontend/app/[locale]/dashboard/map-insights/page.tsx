"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

export default function MapInsights() {
  return (
    <div className="animate-fade-in flex flex-col min-h-[70vh] lg:h-[calc(100vh-148px)] w-full pb-2">
      <MapClient />
    </div>
  );
}
