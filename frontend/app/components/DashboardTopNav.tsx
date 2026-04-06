"use client";

import { Bell, Sun, Moon, Globe, ChevronDown, LogOut, Navigation } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter, routing } from "../../i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { ThemeMode, THEME_CHANGE_EVENT, getActiveTheme, toggleThemeWithAnimation } from "./theme";
import { useLocation } from "./LocationContext";
import clsx from "clsx";


export default function DashboardTopNav() {
  const [theme, setTheme] = useState<ThemeMode>(() => getActiveTheme());
  const [mounted, setMounted] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { refreshLocation, loading: locationLoading } = useLocation();


  useEffect(() => {
    setMounted(true);
    const handleThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<ThemeMode>;
      setTheme(customEvent.detail);
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange as EventListener);
  }, []);

  const toggleTheme = () => {
    toggleThemeWithAnimation(theme);
  };

  const handleLangChange = (selectedLocale: string) => {
    router.replace(pathname, { locale: selectedLocale } as { locale: typeof routing.locales[number] });
    setLangDropdownOpen(false);
  };

  const getLangDisplay = (loc: string) => {
    const maps: Record<string, string> = {
      en: "English",
      hi: "हिन्दी",
      gu: "ગુજરાતી"
    };
    return maps[loc] || loc;
  };
  
  const userName = session?.user?.name || "Farmer";
  const userImage = session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhkX2dBHRRRgS3sO2D2j7AqZRW5uiW24OUcDS5kYZMqAhzzpebWOVzzCVNyIRAz5Rmz9tRQoYC_nOMwhkfaTjmj5D1RyRQXIHHeRMeaxCuCipVmnaJcS0T9tES4odHW1VERPb9tiOncncbFjGsNt-x5rg45WkrLyjH7v97dCyjDTQ_0L6rRGzCmNwlIFK2T50BOGQfve0wXzmyqdPkqKAERb6Tol5EWshdPPfwefjxl1w6sPPAogCTvKBJj1LtCISR1yDCM_oaT3AD";


  return (
    <header className="sticky top-3 z-40 h-auto sm:h-16 surface-panel px-3 sm:px-5 py-2.5 sm:py-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 transition-all duration-300">
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors text-sm font-medium p-2 rounded-full hover:bg-primary/10"
          >
            <Globe className="w-5 h-5" />
            <span className="hidden md:block">{getLangDisplay(locale)}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {langDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-[#0b1326] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              <button onClick={() => handleLangChange("en")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">English</button>
              <button onClick={() => handleLangChange("hi")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">हिन्दी</button>
              <button onClick={() => handleLangChange("gu")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">ગુજરાતી</button>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleTheme} 
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
          aria-label="Toggle Theme"
        >
          {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
        </button>

        <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all duration-300 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#4edea3]"></span>
        </button>

        <button 
          onClick={() => refreshLocation()}
          disabled={locationLoading}
          title={t("map.use_gps")}
          className={clsx(
            "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all duration-300",
            locationLoading ? "text-primary animate-pulse bg-primary/10" : "text-slate-400 hover:bg-primary/10 hover:text-primary"
          )}
        >
          <Navigation className={clsx("w-5 h-5", locationLoading && "animate-spin-slow")} />
        </button>

        
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="hidden sm:block h-8 w-px bg-outline-variant/20 mx-1"></div>
        <div 
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
          onClick={() => router.push(`${pathname}?settings=true`)}
        >
          <div className="hidden md:flex text-right items-center h-full">
            <p className="font-headline text-sm font-bold text-on-surface leading-tight">{userName}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              alt="User Profile"
              className="w-full h-full rounded-full object-cover"
              src={userImage}
              width={40}
              height={40}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
