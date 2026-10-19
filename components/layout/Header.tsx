"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";

import { Container } from "@/components/ui/Container";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
export function Header() {
    const { t } = useI18n();
    return (<header className="site-header">
      <Container className="header-inner">
        <a href="#top" className="brand-lockup" aria-label={t("PepoShots, volver al inicio")}>
          <span className="brand-name">{t("PEPOSHOTS")}</span>
          <span className="brand-sub">{t("BARTENDER & WAITER \u00B7 MIAMI")}</span>
        </a>
        <nav className="header-nav" aria-label={t("Navegaci\u00F3n principal")}>
          <a href="#event-paths">{t("Servicio")}</a>
          <a href="#bar-setups">{t("Barras")}</a>
          <a href="#drinks">{t("C\u00F3cteles")}</a>
          <a href="#real-work" className="header-nav-extra">{t("Eventos")}</a>
          <a href="#where-and-when" className="header-nav-extra">{t("Cobertura")}</a>
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          <a className="header-cta" href="#booking">{t("Consultar fecha ")}<span aria-hidden="true">{t("\u2197")}</span></a>
        </div>
      </Container>
    </header>);
}
