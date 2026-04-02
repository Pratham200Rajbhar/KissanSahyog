import { Globe, Share2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="w-full bg-[#0b1326] border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div className="text-lg font-bold text-slate-100">KhetSahyog</div>
          <p className="font-label text-xs uppercase tracking-[0.1em] text-slate-500 text-center md:text-left">
            © 2024 KhetSahyog Ecosystem. Powered by Hyper-Natural Precision AI.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-label text-xs uppercase tracking-[0.1em]">
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("Ecosystem")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("Intelligence")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("Network")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("Privacy")}
          </Link>
          <Link href="#" className="text-slate-500 hover:text-tertiary transition-colors opacity-80 hover:opacity-100">
            {t("Terms")}
          </Link>
        </div>
        <div className="flex gap-4">
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
