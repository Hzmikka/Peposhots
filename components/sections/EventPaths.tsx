"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { eventPaths } from "@/data/eventPaths";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { animateScrollTo, getElementTop, getScrollContainer, getScrollHeight, getViewportHeight } from "@/lib/scrolling";

const servicePackages = eventPaths;

export function EventPaths() {
  const { preferences, setEventPath } = usePepoExperience();
  const cancelScroll = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelScroll.current?.(), []);

  function choose(id: typeof eventPaths[number]["id"]) {
    setEventPath(id);
    cancelScroll.current?.();
    const paths = document.getElementById("event-paths");
    const bars = document.getElementById("bar-setups");
    const scrollRoot = getScrollContainer(paths);
    if (!paths || !bars) return;

    const barsTop = getElementTop(bars, scrollRoot);
    const safeTop = scrollRoot ? 52 : 12;
    const target = Math.max(
      0,
      Math.min(
        getScrollHeight(scrollRoot) - getViewportHeight(scrollRoot),
        barsTop - safeTop,
      ),
    );

    cancelScroll.current = animateScrollTo(scrollRoot, target);
  }

  return (
    <section className="section section-paths" id="event-paths">
      <Container>
        <header className="section-head split-head">
          <div>
            <p className="kicker">SERVICIO POR INVITADOS</p>
            <h2>¿Cuántos invitados tendrás?</h2>
          </div>
          <div>
            <p className="path-intro-copy">Encuentra el servicio que encaja con el tamaño de tu celebración y conoce el precio antes de consultar.</p>
            <p className="path-service-note">Servicio de bartenders por hasta 4 horas, más 30 minutos de montaje. El cliente proporciona el alcohol; confirma barras y extras al consultar.</p>
          </div>
        </header>

        <div className="path-grid">
          {servicePackages.map((path) => {
            const selected = preferences.eventPath === path.id;
            return (
              <button
                type="button"
                key={path.id}
                className={`path-card ${selected ? "is-selected" : ""}`}
                onClick={() => choose(path.id)}
                aria-pressed={selected}
              >
                <span className="path-media">
                  <Image src={path.image} alt="" fill sizes="(max-width: 400px) 78vw, 312px" />
                </span>
                <span className="path-body">
                  <span className="path-label">{path.label}</span>
                  <span className={`path-price${path.price === null ? " is-custom" : ""}`}>
                    {path.price === null ? "Cotización personalizada" : `$${path.price.toLocaleString("en-US")}`}
                  </span>
                  <strong>{path.title}</strong>
                  <span className="path-meta">
                    {path.meta.map((item) => <span key={item}>{item}</span>)}
                  </span>
                  <span className="path-arrow" aria-hidden="true">→</span>
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
