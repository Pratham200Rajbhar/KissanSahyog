"use client";

import { Menu, Sun, Moon, Globe, ChevronDown, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "../../i18n/routing";
import { signIn } from "next-auth/react";

const localeNames: Record<string, string> = {
  en: "English",
  hi: "हिन्दी",
  gu: "ગુજરાતી"
};

export default function Navbar() {
  const [theme, setTheme] = useState("dark");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLangChange = (nextLocale: string) => {
    setLangDropdownOpen(false);
    setMobileMenuOpen(false);
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="sticky top-0 w-full z-50 border-b border-white/5 bg-[#0b1326]/70 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.25)]">
      <div className="app-shell flex items-center justify-between py-3 sm:py-4">
        <Link href="/" className="text-xl sm:text-2xl font-extrabold tracking-tighter text-primary">
          KissanSahyog
        </Link>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm font-medium p-2 rounded-full hover:bg-white/5"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden md:block">{localeNames[locale] || locale}</span>
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
            onClick={() => {
              setIsLoggingIn(true);
              signIn("google", { callbackUrl: "/dashboard" });
            }}
            disabled={isLoggingIn}
            className="hidden md:flex items-center gap-2 bg-primary-container text-on-primary-container px-5 py-2 rounded-full font-bold hover:brightness-110 transition-all duration-300 active:scale-95 transform disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoggingIn ? t("nav.logging_in") : t("nav.login")}
          </button>
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface-container/90 backdrop-blur-xl">
          <div className="app-shell py-4 flex flex-col gap-3">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400 font-label">{localeNames[locale] || locale}</div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(localeNames).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLangChange(code)}
                  className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-slate-300 hover:text-white hover:border-primary/30 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setIsLoggingIn(true);
                setMobileMenuOpen(false);
                signIn("google", { callbackUrl: "/dashboard" });
              }}
              disabled={isLoggingIn}
              className="mt-1 w-full flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-5 py-3 rounded-xl font-bold disabled:opacity-70"
            >
              {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoggingIn ? t("nav.logging_in") : t("nav.login")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
