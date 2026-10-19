"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";

export default function NotFound() {
  const { t } = useI18n();
  return <main id="main" className="privacy-page site-container">
    <div style={{ maxWidth: 760, marginInline: "auto" }}>
      <div className="privacy-toolbar"><a className="privacy-back" href="/">{t("← Volver a PepoShots")}</a><LanguageSwitch /></div>
      <p className="kicker">404</p>
      <h1>{t("No encontramos esta página.")}</h1>
      <p>{t("Puedes volver al inicio para explorar el servicio o consultar una fecha.")}</p>
      <a href="/#booking" className="privacy-back">{t("Consultar fecha")}</a>
    </div>
  </main>;
}
