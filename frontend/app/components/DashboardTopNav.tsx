"use client";

import { Search, Bell, Sun, Moon, Globe, ChevronDown, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter, routing } from "../../i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";

export default function DashboardTopNav() {
  const [theme, setTheme] = useState("dark");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const { data: session } = useSession();

  useEffect(() => {
    const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains("light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  };

  const handleLangChange = (selectedLocale: string) => {
    router.replace(pathname, { locale: selectedLocale } as { locale: typeof routing.locales[number] });
    setLangDropdownOpen(false);
  };

  const getLangDisplay = (loc: string) => {
    const maps: Record<string, string> = {
      en: "English",
      hi: "हिन्दी",
      gu: "ગુજરાતી",
      mr: "मराठी",
      bn: "বাংলা",
      ta: "தமிழ்",
      te: "తెలుగు"
    };
    return maps[loc] || loc;
  };
  
  const userName = session?.user?.name || "Farmer";
  const userImage = session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhkX2dBHRRRgS3sO2D2j7AqZRW5uiW24OUcDS5kYZMqAhzzpebWOVzzCVNyIRAz5Rmz9tRQoYC_nOMwhkfaTjmj5D1RyRQXIHHeRMeaxCuCipVmnaJcS0T9tES4odHW1VERPb9tiOncncbFjGsNt-x5rg45WkrLyjH7v97dCyjDTQ_0L6rRGzCmNwlIFK2T50BOGQfve0wXzmyqdPkqKAERb6Tol5EWshdPPfwefjxl1w6sPPAogCTvKBJj1LtCISR1yDCM_oaT3AD";


  return (
    <header className="fixed top-0 left-72 right-0 z-50 h-16 flex justify-between items-center px-8 bg-[#0b1326]/60 backdrop-blur-xl transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 text-sm font-label focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-500 outline-none"
            placeholder={t("Search farm metrics...")}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors text-sm font-medium p-2 rounded-full hover:bg-primary/10"
          >
            <Globe className="w-5 h-5" />
            <span className="hidden sm:block">{getLangDisplay(locale)}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {langDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-[#0b1326] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
              <button onClick={() => handleLangChange("en")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">English</button>
              <button onClick={() => handleLangChange("hi")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">हिन्दी</button>
              <button onClick={() => handleLangChange("gu")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">ગુજરાતી</button>
              <button onClick={() => handleLangChange("mr")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">मराठी</button>
              <button onClick={() => handleLangChange("bn")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">বাংলা</button>
              <button onClick={() => handleLangChange("ta")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">தமிழ்</button>
              <button onClick={() => handleLangChange("te")} className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">తెలుగు</button>
            </div>
          )}
        </div>
        
        <button 
          onClick={toggleTheme} 
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all duration-300"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-primary/10 hover:text-primary transition-all duration-300 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#4edea3]"></span>
        </button>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          aria-label="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="font-headline text-sm font-bold text-on-surface leading-tight">{userName}</p>
            <p className="font-label text-[10px] text-slate-500 tracking-wider">{t("PREMIUM TIER")}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              alt="User Profile"
              className="w-full h-full rounded-full object-cover"
              src={userImage}
              width={40}
              height={40}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
