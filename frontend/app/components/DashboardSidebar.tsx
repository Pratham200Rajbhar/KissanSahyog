"use client";

import { Link, usePathname } from "../../i18n/routing";
import {
  LayoutDashboard,
  TrendingUp,
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
    { name: "Crop Recommendation", key: "sidebar.crop", href: "/dashboard/crop-recommendation", icon: Sprout },
    { name: "Fertilizer Recommendation", key: "sidebar.fertilizer", href: "/dashboard/recommendations", icon: Sparkles },
    { name: "Map Insights", key: "sidebar.map", href: "/dashboard/map-insights", icon: MapIcon },
    { name: "Analysis & Report", key: "sidebar.analysis", href: "/dashboard/analysis", icon: TrendingUp },
  ];

  return (
    <>
      <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 z-[60] bg-surface-container-high/90 backdrop-blur-2xl w-[19rem] rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 flex-col">
        <div className="p-6 xl:p-7">
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

        <nav className="flex-1 px-3 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3.5 px-5 py-3.5 font-label text-[12px] tracking-wide uppercase rounded-2xl transition-all duration-300",
                  isActive
                      ? "bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{t(link.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-5 space-y-1.5 border-t border-white/5">
          <Link
            href={`${pathname}?settings=true`}
            className="w-full flex items-center gap-3.5 text-slate-400 hover:text-white px-5 py-3.5 font-label text-[12px] tracking-wide uppercase hover:bg-white/5 rounded-2xl transition-all duration-300"
          >
            <Settings className="w-4.5 h-4.5" />
            <span>{t("sidebar.settings")}</span>
          </Link>
          <Link
            href="/dashboard/support"
            className={clsx(
              "w-full flex items-center gap-3.5 px-5 py-3.5 font-label text-[12px] tracking-wide uppercase rounded-2xl transition-all duration-300",
              pathname === "/dashboard/support"
                ? "bg-gradient-to-br from-primary to-primary-container text-on-primary-container shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>{t("sidebar.support")}</span>
          </Link>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-3 inset-x-3 z-[70] bg-surface-container-high/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl px-2 py-2">
        <div className="flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            navLinks[0],
            navLinks[1],
            navLinks[2],
            navLinks[3],
            { name: "Support", key: "sidebar.support", href: "/dashboard/support", icon: HelpCircle },
          ].map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex-1 min-w-[64px] flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl text-[10px] font-label uppercase tracking-wider transition-colors",
                  isActive ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-full">{t(link.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
