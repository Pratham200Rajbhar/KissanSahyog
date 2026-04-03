"use client";

import { Menu, Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "../../i18n/routing";
import { signIn } from "next-auth/react";

const localeNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  gu: "ગુજરાતી",
  mr: "मराठी",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు"
};

export default function Navbar() {
  const [theme, setTheme] = useState("dark");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (document.documentElement.classList.contains("light")) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
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

  const handleLangChange = (nextLocale: string) => {
    setLangDropdownOpen(false);
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#0b1326]/60 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-primary">
          KhetSahyog
        </Link>
        <div className="hidden md:flex gap-8 items-center font-headline text-sm tracking-wide">
          <Link
            href="/dashboard/map-insights"
            className="text-primary font-bold border-b-2 border-primary pb-1 active:scale-95 transform transition-transform"
          >
            {t("Ecosystem")}
          </Link>
          <Link
            href="/dashboard/yield-prediction"
            className="text-slate-300 hover:text-primary transition-colors active:scale-95 transform transition-transform"
          >
            {t("Predictions")}
          </Link>
          <Link
            href="/dashboard/disease-detection"
            className="text-slate-300 hover:text-primary transition-colors active:scale-95 transform transition-transform"
          >
            {t("Intelligence")}
          </Link>
          <Link
            href="/dashboard/recommendations"
            className="text-slate-300 hover:text-primary transition-colors active:scale-95 transform transition-transform"
          >
            {t("Recommendations")}
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm font-medium p-2 rounded-full hover:bg-white/5"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:block">{localeNames[locale] || locale}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {langDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-[#0b1326] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                {Object.entries(localeNames).map(([code, name]) => (
                  <button 
                    key={code}
                    onClick={() => handleLangChange(code)} 
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:bg-primary/10 hover:text-primary transition-all duration-300"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="hidden md:block bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold hover:bg-white/5 hover:-translate-y-1 transition-all duration-300 active:scale-95 transform"
          >
            {t("Login")}
          </button>
          <button className="md:hidden text-primary">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
