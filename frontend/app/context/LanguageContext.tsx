"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { dictionaries } from "../i18n/dictionaries";

export type Language = "English" | "Hindi" | "Gujarati" | "Marathi" | "Bengali" | "Tamil" | "Telugu";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  // A helper function to translate strings based on current language
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Store the language in state
  const [lang, setLangState] = useState<Language>("English");

  // On mount, try to read from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && ["English", "Hindi", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu"].includes(saved)) {
      setLangState(saved as Language);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const t = (key: string): string => {
    // If the active language dictionary doesn't have the string, fallback to English or the key itself
    return dictionaries[lang]?.[key] || dictionaries["English"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
