"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Container } from "@/components/ui/Container";
import { barPriorityByPath, barSetups } from "@/data/barSetups";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";

const SWIPE_THRESHOLD = 70;
const DRAG_LIMIT = 180;
const EXIT_DISTANCE = 440;
const TRANSITION_MS = 280;

export function BarSetups() {
  const { preferences, setPreferredBarSetup } = usePepoExperience();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const dragStart = useRef(0);
  const dragCurrent = useRef(0);

  const ordered = useMemo(() => {
    if (!preferences.eventPath) return barSetups;
    const priority = barPriorityByPath[preferences.eventPath];
    return [...barSetups].sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id));
  }, [preferences.eventPath]);

  useEffect(() => {
    const reset = window.setTimeout(() => {
      setActiveIndex(0);
      dragCurrent.current = 0;
      setDragX(0);
    }, 0);
    return () => window.clearTimeout(reset);
  }, [preferences.eventPath]);

  function cycle(direction: 1 | -1, exitX?: number) {
    if (animating) return;
    setAnimating(true);
    const targetX = exitX ?? (direction === 1 ? -EXIT_DISTANCE : EXIT_DISTANCE);
    dragCurrent.current = targetX;
    setDragX(targetX);
    window.setTimeout(() => {
      setResetting(true);
      setActiveIndex((current) => (current + direction + ordered.length) % ordered.length);
      dragCurrent.current = 0;
      setDragX(0);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setResetting(false);
          setAnimating(false);
        });
      });
    }, TRANSITION_MS);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (animating || !event.isPrimary) return;
    dragStart.current = event.clientX;
    dragCurrent.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!dragging || animating) return;
    const distance = Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, event.clientX - dragStart.current));
    dragCurrent.current = distance;
    setDragX(distance);
  }

  function handlePointerEnd() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragCurrent.current) >= SWIPE_THRESHOLD) {
      cycle(1, dragCurrent.current > 0 ? EXIT_DISTANCE : -EXIT_DISTANCE);
    } else {
      setAnimating(true);
      dragCurrent.current = 0;
      setDragX(0);
      window.setTimeout(() => setAnimating(false), TRANSITION_MS);
    }
  }

  const active = ordered[activeIndex];
  const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
  const activeRotation = Math.max(-5, Math.min(5, dragX / 32));

  return (
    <section className="section section-bars" id="bar-setups">
      <Container>
        <header className="section-head">
          <p className="kicker">BAR SETUPS</p>
          <h2>Una barra que funcione para tu evento.</h2>
          <p>Explora las opciones y encuentra la que mejor encaje.</p>
          {preferences.eventPath ? <small className="bar-context">Ordenadas según tu celebración.</small> : null}
        </header>

        <div className="bar-deck" aria-label="Deck de opciones de barra">
          {[2, 1].map((depth) => {
            const bar = ordered[(activeIndex + depth) % ordered.length];
            const approaching = depth === 1 ? progress : 0;
            return (
              <div
                className={`deck-image-layer deck-depth-${depth}`}
                key={`${bar.id}-${depth}`}
                aria-hidden="true"
                style={depth === 1 ? {
                  transform: `translate(${8 - 8 * approaching}px, ${11 - 11 * approaching}px) rotate(${4 - 4 * approaching}deg) scale(${0.97 + 0.03 * approaching})`
                } : undefined}
              >
                <Image src={bar.image} alt="" fill sizes="285px" draggable={false} />
              </div>
            );
          })}

          <div
            className={`deck-image-active ${dragging ? "is-dragging" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            style={{ transform: `translateX(${dragX}px) rotate(${activeRotation}deg)`, transition: dragging || resetting ? "none" : undefined }}
            role="group"
            aria-label={`Imagen de ${active.title}`}
          >
            <Image src={active.image} alt={active.title} fill sizes="285px" priority={activeIndex === 0} draggable={false} />
          </div>
        </div>

        <div className="stationary-bar-info" aria-live="polite">
          {activeIndex === 0 && preferences.eventPath ? <span className="bar-recommendation">MEJOR ENCAJE</span> : null}
          <span className="bar-index">{String(activeIndex + 1).padStart(2, "0")}</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <div className="tag-row">{active.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <button type="button" className="choose-bar" onClick={() => setPreferredBarSetup(active.id)}>
            {preferences.preferredBarSetup === active.id ? "Barra elegida ✓" : "Elegir esta barra"}
          </button>
        </div>

        <div className="deck-navigation">
          <button type="button" onClick={() => cycle(-1)} aria-label="Barra anterior">←</button>
          <div className="deck-progress" aria-label={`${activeIndex + 1} de ${ordered.length}`}>
            {ordered.map((bar, index) => <i key={bar.id} className={index === activeIndex ? "is-active" : ""} />)}
          </div>
          <span className="bar-counter">
            {String(activeIndex + 1).padStart(2, "0")} / <b>{String(ordered.length).padStart(2, "0")}</b>
          </span>
          <button type="button" onClick={() => cycle(1)} aria-label="Siguiente barra">→</button>
        </div>

        <a className="section-bridge" href="#what-you-bring">Ahora resolvemos qué trae cada parte →</a>
      </Container>
    </section>
  );
}
