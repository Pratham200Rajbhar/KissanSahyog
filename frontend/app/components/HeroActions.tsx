"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

interface HeroActionsProps {
  label: string;
}

export default function HeroActions({ label }: HeroActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-400 w-full sm:w-auto">
      <button 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full sm:w-auto justify-center px-7 py-3.5 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-xl shadow-[0_0_30px_rgba(78,222,163,0.18)] hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
      >
        {label}
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
