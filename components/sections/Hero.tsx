"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
export function Hero() {
    const { t } = useI18n();
    return (<>
      <section className="pepo-hero" id="top">
        <Image className="pepo-hero-image" src="/images/peposhots/hero/peposhots-bar-hero.webp" alt={t("Barra iluminada de PepoShots con botellas, cristaler\u00EDa y servicio de c\u00F3cteles")} fill priority sizes="100vw"/>
        <Image className="pepo-hero-panorama" src="/images/peposhots/hero/peposhots-bar-panorama-v2.webp" alt={t("Vista panor\u00E1mica de la barra PepoShots con botellas, cristaler\u00EDa y preparaci\u00F3n de c\u00F3cteles")} fill sizes="100vw" loading="lazy" fetchPriority="high"/>
        <div className="pepo-hero-overlay"/>
        <Container className="pepo-hero-inner">
          <div className="pepo-hero-copy">
            <h1>{t("Disfruta tu fiesta.")}<span>{t("Nosotros nos encargamos de la barra.")}</span></h1>
            <p className="hero-support">{t("Servicio para bodas, graduaciones y celebraciones privadas.")}</p>
            <div className="hero-actions">
              <a className="btn hero-primary" href="#event-paths">{t("Planear mi evento ")}<span aria-hidden="true">{t("\u2197")}</span></a>
              <a className="hero-secondary" href="#drinks">{t("Explorar c\u00F3cteles ")}<span aria-hidden="true">{t("\u2193")}</span></a>
            </div>
            <Image className="hero-card-art" src="/images/peposhots/hero/martini-hero.webp" alt={t("Martini cl\u00E1sico con aceitunas")} width={1777} height={887} sizes="(max-width: 599px) 100vw, 328px"/>
          </div>
        </Container>
      </section>
    </>);
}
