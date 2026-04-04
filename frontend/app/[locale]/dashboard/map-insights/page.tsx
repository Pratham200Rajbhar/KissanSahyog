"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), { ssr: false });

export default function MapInsights() {
  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)] w-full pb-4">
      <MapClient />
    </div>
  );
}
