"use client";

import { Globe, Share2 } from "lucide-react";
import { Link } from "../../i18n/routing";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations();
  return (
    <footer className="w-full bg-[#0b1326] border-t border-white/5">
      <div className="app-shell py-10 sm:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="flex flex-col gap-3 items-start">
          <div className="text-lg font-bold text-slate-100 tracking-tight">KissanSahyog</div>
          <p className="font-label text-xs uppercase tracking-[0.1em] text-slate-500 text-center md:text-left">
            © 2024 KissanSahyog Ecosystem. Powered by Hyper-Natural Precision AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-label text-xs uppercase tracking-[0.1em]">
          <Link href="/dashboard/map-insights" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("nav.ecosystem")}
          </Link>
          <Link href="/dashboard/analysis" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("sidebar.analysis")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("footer.network")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("footer.privacy")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("footer.terms")}
          </Link>
        </div>

        <div className="flex gap-3">
          <button className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
            <Globe className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-full glass-panel border border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
