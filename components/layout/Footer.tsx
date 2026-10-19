"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";

import Image from "next/image";
export function Footer() {
    const { t } = useI18n();
    return (<footer className="site-footer">
      <Image className="footer-logo" src="/images/peposhots/peposhots-footer-logo.webp" alt={t("PepoShots \u2014 Bartender & Waiter")} width={1010} height={790}/>
      <a className="footer-privacy" href="/privacy">{t("Privacidad")}</a>
    </footer>);
}
