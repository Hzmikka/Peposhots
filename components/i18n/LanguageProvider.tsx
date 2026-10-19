"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLanguage, translate, type Language } from "@/lib/i18n";

const STORAGE_KEY = "peposhots-language";
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (source: string, values?: Record<string, string | number>) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLanguage = "es" }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(saved)) setLanguage(saved);
    } catch { /* The selector also works when browser storage is blocked. */ }
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isLanguage(event.newValue)) setLanguage(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.pepoLanguage = language;
    if (window.location.pathname === "/privacy") document.title = language === "en" ? "Privacy | PepoShots" : "Privacidad | PepoShots";
    else if (["/", "/demo"].includes(window.location.pathname)) document.title = language === "en" ? "PepoShots | Event bartenders in Miami" : "PepoShots | Bartender para eventos en Miami";
    if (ready) {
      try { localStorage.setItem(STORAGE_KEY, language); } catch { /* Keep the current language in memory. */ }
    }
  }, [language, ready]);
  const t = useCallback((source: string, values?: Record<string, string | number>) => translate(language, source, values), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n requires LanguageProvider");
  return context;
}

export function SkipLink() {
  const { t } = useI18n();
  return <a href="#main" className="skip-link">{t("Saltar al contenido")}</a>;
}
