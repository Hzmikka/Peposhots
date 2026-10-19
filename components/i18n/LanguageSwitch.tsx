"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";

export function LanguageSwitch() {
  const { language, setLanguage, t } = useI18n();
  const label = language === "es" ? "Switch website to English" : "Cambiar la web a español";
  return (
    <button type="button" className="language-switch" onClick={() => setLanguage(language === "es" ? "en" : "es")} aria-label={label} title={label}>
      <span lang="es" className={language === "es" ? "is-current" : undefined}>ES</span>
      <span aria-hidden="true">/</span>
      <span lang="en" className={language === "en" ? "is-current" : undefined}>EN</span>
      <span className="pepo-sr-only">{t("Cambiar idioma")}</span>
    </button>
  );
}
