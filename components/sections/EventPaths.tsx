"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { eventPaths } from "@/data/eventPaths";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { animateScrollTo, getElementTop, getScrollContainer, getScrollHeight, getSectionScrollOffset, getViewportHeight } from "@/lib/scrolling";
const servicePackages = eventPaths;
export function EventPaths() {
    const { t } = useI18n();
    const { preferences, setEventPath } = usePepoExperience();
    const cancelScroll = useRef<(() => void) | null>(null);
    useEffect(() => () => cancelScroll.current?.(), []);
    function choose(id: typeof eventPaths[number]["id"], keyboard = false) {
        setEventPath(id);
        cancelScroll.current?.();
        const paths = document.getElementById("event-paths");
        const bars = document.getElementById("bar-setups");
        const scrollRoot = getScrollContainer(paths);
        if (!paths || !bars)
            return;
        const barsTop = getElementTop(bars, scrollRoot);
        const safeTop = getSectionScrollOffset(bars);
        const target = Math.max(0, Math.min(getScrollHeight(scrollRoot) - getViewportHeight(scrollRoot), barsTop - safeTop));
        if (keyboard) bars.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
        cancelScroll.current = animateScrollTo(scrollRoot, target);
    }
    return (<section className="section section-paths" id="event-paths">
      <Container>
        <header className="section-head split-head">
          <div>
            <p className="kicker">{t("SERVICIO POR INVITADOS")}</p>
            <h2>{t("\u00BFCu\u00E1ntos invitados tendr\u00E1s?")}</h2>
          </div>
          <div>
            <p className="path-intro-copy">{t("Encuentra el servicio que encaja con el tama\u00F1o de tu celebraci\u00F3n y conoce el precio antes de consultar.")}</p>
            <p className="path-service-note">{t("Servicio de bartenders por hasta 4 horas, m\u00E1s 30 minutos de montaje. El cliente proporciona el alcohol; confirma barras y extras al consultar.")}</p>
          </div>
        </header>

        <div className="path-grid">
          {servicePackages.map((path) => {
            const selected = preferences.eventPath === path.id;
            return (<button type="button" key={path.id} className={`path-card ${selected ? "is-selected" : ""}`} onClick={(event) => choose(path.id, event.detail === 0)} aria-pressed={selected}>
                <span className="path-media">
                  <Image src={path.image} alt="" fill sizes="(max-width: 599px) 78vw, (max-width: 1023px) 44vw, (max-width: 1279px) 28vw, 245px"/>
                </span>
                <span className="path-body">
                  <span className="path-label">{t(path.label)}</span>
                  <span className={`path-price${path.price === null ? " is-custom" : ""}`}>
                    {path.price === null ? t("Cotización personalizada") : `$${path.price.toLocaleString("en-US")}`}
                  </span>
                  <strong>{t(path.title)}</strong>
                  <span className="path-meta">
                    {path.meta.map((item) => <span key={item}>{t(item)}</span>)}
                  </span>
                  <span className="path-arrow" aria-hidden="true">{t("\u2192")}</span>
                </span>
              </button>);
        })}
        </div>
      </Container>
    </section>);
}
