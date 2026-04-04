"use client";

import { useTranslations } from "next-intl";
import { LucideIcon, ExternalLink, Search, Info, CheckCircle2, HelpingHand, ShieldCheck, CreditCard, Droplets, Store, FileText, Pickaxe, Warehouse, Leaf, Fish } from "lucide-react";
import { useState } from "react";

const schemeIcons: Record<string, LucideIcon> = {
  pm_kisan: HelpingHand,
  pmfby: ShieldCheck,
  kcc: CreditCard,
  pmksy: Droplets,
  enam: Store,
  soil_health: FileText,
  rkvy: Pickaxe,
  aif: Warehouse,
  pkvy: Leaf,
  pmmsy: Fish,
};

const schemeLinks: Record<string, string> = {
  pm_kisan: "https://pmkisan.gov.in",
  pmfby: "https://pmfby.gov.in",
  kcc: "https://jansamarth.in",
  pmksy: "https://pmksy.gov.in",
  enam: "https://enam.gov.in",
  soil_health: "https://soilhealth.dac.gov.in",
  rkvy: "https://rkvy.nic.in",
  aif: "https://agriinfra.dac.gov.in",
  pkvy: "https://agriwelfare.gov.in",
  pmmsy: "https://pmmsy.dof.gov.in",
};

export default function SupportPage() {
  const t = useTranslations("support");
  const [searchQuery, setSearchQuery] = useState("");

  const schemesKeys = [
    "pm_kisan",
    "pmfby",
    "kcc",
    "pmksy",
    "enam",
    "soil_health",
    "rkvy",
    "aif",
    "pkvy",
    "pmmsy",
  ];

  const filteredSchemes = schemesKeys.filter((key) => {
    const title = t(`schemes.${key}.title`).toLowerCase();
    const objective = t(`schemes.${key}.objective`).toLowerCase();
    return title.includes(searchQuery.toLowerCase()) || objective.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="mt-2 sm:mt-4 animate-fade-in pb-10">
      <div className="mb-8 sm:mb-10">
        <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
          Farmer Assistance
        </span>
        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-slate-400 max-w-2xl leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 sm:mb-12 max-w-xl group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          placeholder={t("search_placeholder")}
          className="w-full bg-[#0b1326]/50 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-2xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">
        {filteredSchemes.map((key) => {
          const Icon = schemeIcons[key] || Info;
          return (
            <div
              key={key}
              className="glass-panel group relative overflow-hidden p-5 sm:p-7 rounded-3xl border border-white/5 hover:border-primary/20 transition-all duration-300 hover:translate-y-[-2px]"
            >
              {/* Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
              
              <div className="flex items-start gap-6 relative z-10">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                    {t(`schemes.${key}.title`)}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-label text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1">
                        <Info className="w-3 h-3 text-primary" />
                        {t("objective")}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {t(`schemes.${key}.objective`)}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-label text-[10px] uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                        {t("benefits")}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {t(`schemes.${key}.benefits`)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                    <a
                      href={schemeLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors group/link"
                    >
                      {t("official_link")}
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-20 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
          <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No schemes found matching your search.</h3>
          <p className="text-slate-500 mt-2">Try searching for different keywords or clear the filter.</p>
        </div>
      )}
    </div>
  );
}
