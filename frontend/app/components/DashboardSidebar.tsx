"use client";

import { Link, usePathname } from "../../i18n/routing";
import {
  LayoutDashboard,
  TrendingUp,
  Stethoscope,
  Sparkles,
  Map as MapIcon,
  Settings,
  HelpCircle,
  Leaf,
  Sprout
} from "lucide-react";

import clsx from "clsx";
import { useTranslations } from "next-intl";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  const navLinks = [
    { name: "Dashboard", key: "sidebar.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Yield Prediction", key: "sidebar.yield", href: "/dashboard/yield-prediction", icon: TrendingUp },
    { name: "Disease Detection", key: "sidebar.disease", href: "/dashboard/disease-detection", icon: Stethoscope },
    { name: "Crop Recommendation", key: "sidebar.crop", href: "/dashboard/crop-recommendation", icon: Sprout },
    { name: "Fertilizer Recommendation", key: "sidebar.fertilizer", href: "/dashboard/recommendations", icon: Sparkles },
    { name: "Map Insights", key: "sidebar.map", href: "/dashboard/map-insights", icon: MapIcon },
    { name: "Analysis & Report", key: "sidebar.analysis", href: "/dashboard/analysis", icon: TrendingUp },
  ];

  return (
    <aside className="fixed left-0 top-0 h-[calc(100%-2rem)] my-4 ml-4 flex flex-col z-[60] bg-[#0b1326]/80 backdrop-blur-2xl w-80 rounded-[2rem] shadow-2xl overflow-hidden">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl liquid-pill flex items-center justify-center shadow-lg shadow-primary/20">
            <Leaf className="w-5 h-5 text-surface stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-black text-primary tracking-tighter">{t("sidebar.app_name")}</h1>
            <p className="font-label text-[10px] tracking-widest uppercase opacity-60">{t("sidebar.tagline")}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-4 px-6 py-4 font-label text-[13px] tracking-wide uppercase rounded-full transition-all duration-500",
                isActive
                  ? "bg-gradient-to-br from-[#4edea3] to-[#10b981] text-[#0b1326] shadow-[0_0_20px_rgba(78,222,163,0.3)] mx-2"
                  : "text-slate-400 hover:text-white hover:backdrop-blur-3xl hover:bg-white/5 hover:translate-x-1"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{t(link.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-8 space-y-2">
        <Link 
          href={`${pathname}?settings=true`}
          className="w-full flex items-center gap-4 text-slate-400 hover:text-white px-6 py-4 font-label text-[13px] tracking-wide uppercase hover:backdrop-blur-3xl hover:bg-white/5 rounded-full transition-all duration-500"
        >
          <Settings className="w-5 h-5" />
          <span>{t("sidebar.settings")}</span>
        </Link>
        <button className="w-full flex items-center gap-4 text-slate-400 hover:text-white px-6 py-4 font-label text-[13px] tracking-wide uppercase hover:backdrop-blur-3xl hover:bg-white/5 rounded-full transition-all duration-500">
          <HelpCircle className="w-5 h-5" />
          <span>{t("sidebar.support")}</span>
        </button>
      </div>
    </aside>
  );
}
