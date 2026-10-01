"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { eventPaths } from "@/data/eventPaths";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { getElementTop, getScrollContainer, getScrollHeight, getScrollTop, getViewportHeight, scrollToPosition, setScrollTop } from "@/lib/scrolling";

export function EventPaths() {
  const { preferences, setEventPath } = usePepoExperience();

  function choose(id: typeof eventPaths[number]["id"]) {
    setEventPath(id);
    window.setTimeout(() => {
      const paths = document.getElementById("event-paths");
      const bars = document.getElementById("bar-setups");
      const scene = paths?.closest<HTMLElement>(".path-bars-scene");
      const scrollRoot = getScrollContainer(paths);
      if (!paths || !bars || !scene) return;

      const barsTop = getElementTop(bars, scrollRoot);
      const safeTop = scrollRoot ? 52 : 12;
      const target = Math.max(
        0,
        Math.min(
          getScrollHeight(scrollRoot) - getViewportHeight(scrollRoot),
          barsTop - safeTop,
        ),
      );

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scrollToPosition(scrollRoot, target, "auto");
        return;
      }

      const start = getScrollTop(scrollRoot);
      const distance = target - start;
      const duration = 1350;
      const startedAt = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        setScrollTop(scrollRoot, start + distance * eased);
        if (progress < 1) window.requestAnimationFrame(step);
      };

      window.requestAnimationFrame(step);
    }, 40);
  }

  return (
    <section className="section section-paths" id="event-paths">
      <Container>
        <header className="section-head split-head">
          <div>
            <p className="kicker">TU TIPO DE EVENTO</p>
            <h2>¿Se parece a lo que estás organizando?</h2>
          </div>
          <p>Elige el contexto más cercano y te mostramos la opción que mejor encaja.</p>
        </header>

        <div className="path-grid">
          {eventPaths.map((path) => {
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
