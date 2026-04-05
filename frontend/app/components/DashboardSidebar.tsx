"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "../../i18n/routing";
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Map as MapIcon,
  Settings,
  HelpCircle,
  Leaf,
  Sprout,
  PanelLeft,
  X
} from "lucide-react";

import clsx from "clsx";
import { useTranslations } from "next-intl";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", key: "sidebar.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Yield Prediction", key: "sidebar.yield", href: "/dashboard/yield-prediction", icon: TrendingUp },
    { name: "Crop Recommendation", key: "sidebar.crop", href: "/dashboard/crop-recommendation", icon: Sprout },
    { name: "Fertilizer Recommendation", key: "sidebar.fertilizer", href: "/dashboard/recommendations", icon: Sparkles },
    { name: "Map Insights", key: "sidebar.map", href: "/dashboard/map-insights", icon: MapIcon },
    { name: "Analysis & Report", key: "sidebar.analysis", href: "/dashboard/analysis", icon: TrendingUp },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileOpen]);

  return (
    <>
      <aside className="hidden lg:flex fixed left-4 top-4 bottom-4 z-60 w-76 rounded-4xl overflow-hidden border border-white/10 shadow-[0_22px_48px_rgba(2,8,23,0.45)] backdrop-blur-2xl bg-linear-to-b from-surface-container-high/95 via-surface-container/95 to-surface-container-low/95 flex-col">
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary/15 to-transparent pointer-events-none" />

        <div className="relative p-6 xl:p-7">
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

        <nav className="relative flex-1 px-3 space-y-1.5">
          {navLinks.map((link) => {
            const isActive = isActiveRoute(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "group flex items-center gap-3.5 px-5 py-3.5 font-label text-[12px] tracking-wide uppercase rounded-2xl transition-all duration-300",
                  isActive
                    ? "bg-linear-to-br from-primary to-primary-container text-black shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{t(link.key)}</span>
                <span
                  className={clsx(
                    "ml-auto h-1.5 w-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-on-primary-container" : "bg-transparent group-hover:bg-slate-400"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="relative px-3 py-5 space-y-1.5 border-t border-white/10">
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
              isActiveRoute("/dashboard/support")
                ? "bg-linear-to-br from-primary to-primary-container text-black shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>{t("sidebar.support")}</span>
          </Link>
        </div>
      </aside>

      <div className="lg:hidden px-3 pt-3">
        <button
          type="button"
          className="w-full h-11 rounded-2xl border border-white/10 bg-surface-container-high/85 backdrop-blur-xl text-slate-200 px-3.5 flex items-center justify-between shadow-[0_8px_24px_rgba(2,8,23,0.35)]"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          <span className="flex items-center gap-2.5">
            {isMobileOpen ? <X className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            <span className="font-label text-[11px] uppercase tracking-wider">Navigation</span>
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Menu</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsMobileOpen(false)}
        aria-label="Close sidebar"
        className={clsx(
          "lg:hidden fixed inset-0 z-83 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300",
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      <aside
        className={clsx(
          "lg:hidden fixed inset-y-0 left-0 z-84 w-[84vw] max-w-[20rem] border-r border-white/10 backdrop-blur-2xl shadow-2xl bg-linear-to-b from-surface-container-high/95 via-surface-container/95 to-surface-container-low/95 transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary/15 to-transparent pointer-events-none" />

        <div className="relative h-full flex flex-col">
          <div className="px-5 pt-6 pb-4 border-b border-white/10">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
              <div className="w-10 h-10 rounded-xl liquid-pill flex items-center justify-center shadow-lg shadow-primary/20">
                <Leaf className="w-5 h-5 text-surface stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-headline text-lg font-black text-primary tracking-tight">{t("sidebar.app_name")}</h2>
                <p className="font-label text-[10px] tracking-widest uppercase opacity-60">{t("sidebar.tagline")}</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActiveRoute(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    "group flex items-center gap-3.5 px-4 py-3.5 font-label text-[11px] tracking-wide uppercase rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-linear-to-br from-primary to-primary-container text-black shadow-[0_0_18px_rgba(78,222,163,0.2)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{t(link.key)}</span>
                  <span
                    className={clsx(
                      "ml-auto h-1.5 w-1.5 rounded-full transition-all duration-300",
                      isActive ? "bg-on-primary-container" : "bg-transparent group-hover:bg-slate-400"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 space-y-1.5 border-t border-white/10">
            <Link
              href={`${pathname}?settings=true`}
              onClick={() => setIsMobileOpen(false)}
              className="w-full flex items-center gap-3.5 text-slate-300 hover:text-white px-4 py-3.5 font-label text-[11px] tracking-wide uppercase hover:bg-white/5 rounded-xl transition-all duration-300"
            >
              <Settings className="w-4.5 h-4.5" />
              <span>{t("sidebar.settings")}</span>
            </Link>
            <Link
              href="/dashboard/support"
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                "w-full flex items-center gap-3.5 px-4 py-3.5 font-label text-[11px] tracking-wide uppercase rounded-xl transition-all duration-300",
                isActiveRoute("/dashboard/support")
                  ? "bg-linear-to-br from-primary to-primary-container text-black shadow-[0_0_18px_rgba(78,222,163,0.2)]"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <HelpCircle className="w-4.5 h-4.5" />
              <span>{t("sidebar.support")}</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
