"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

interface HeroActionsProps {
  label: string;
}

export default function HeroActions({ label }: HeroActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 animate-slide-up animation-delay-400">
      <button 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_40px_rgba(78,222,163,0.2)] hover:shadow-[0_0_60px_rgba(78,222,163,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
      >
        {label}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
