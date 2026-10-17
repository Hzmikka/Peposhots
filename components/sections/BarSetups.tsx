"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Container } from "@/components/ui/Container";
import { barPriorityByPath, barSetups } from "@/data/barSetups";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { getScrollContainer, getScrollScale } from "@/lib/scrolling";

const TRANSITION_MS = 280;

export function BarSetups() {
  const { preferences, setPreferredBarSetup } = usePepoExperience();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [previewDirection, setPreviewDirection] = useState<1 | -1>(1);
  const [cardWidth, setCardWidth] = useState(285);
  const gesture = useRef<{ x: number; y: number; horizontal: boolean } | null>(null);
  const busy = useRef(false);
  const timer = useRef(0);
  const frame = useRef(0);
  const dragCurrent = useRef(0);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const duration = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : TRANSITION_MS;

  function swipeThreshold() {
    return Math.max(38, Math.min(70, cardWidth * 0.23));
  }

  function exitDistance() {
    return Math.max(280, cardWidth * 1.55);
  }

  useEffect(() => {
    const card = activeCardRef.current;
    if (!card) return;
    const reset = () => {
      window.clearTimeout(timer.current);
      window.cancelAnimationFrame(frame.current);
      frame.current = 0;
      gesture.current = null;
      busy.current = false;
      dragCurrent.current = 0;
      setCardWidth(card.offsetWidth);
      setDragging(false);
      setResetting(false);
      setDragX(0);
    };
    const observer = new ResizeObserver(reset);
    observer.observe(card);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", reset);
    return () => { observer.disconnect(); motion.removeEventListener("change", reset); };
  }, []);

  const ordered = useMemo(() => {
    if (!preferences.eventPath) return barSetups;
    const priority = barPriorityByPath[preferences.eventPath];
    if (!priority) return barSetups;
    return [...barSetups].sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id));
  }, [preferences.eventPath]);

  useEffect(() => {
    const reset = window.setTimeout(() => {
      setActiveIndex(0);
      dragCurrent.current = 0;
      setDragX(0);
    }, 0);
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(timer.current);
      window.cancelAnimationFrame(frame.current);
      busy.current = false;
      gesture.current = null;
    };
  }, [preferences.eventPath]);

  function cycle(direction: 1 | -1, exitX?: number) {
    if (busy.current) return;
    busy.current = true;
    setPreviewDirection(direction);
    const targetX = exitX ?? (direction === 1 ? -exitDistance() : exitDistance());
    dragCurrent.current = targetX;
    setDragX(targetX);
    window.cancelAnimationFrame(frame.current);
    timer.current = window.setTimeout(() => {
      setResetting(true);
      setActiveIndex((current) => (current + direction + ordered.length) % ordered.length);
      dragCurrent.current = 0;
      setDragX(0);
      frame.current = window.requestAnimationFrame(() => {
        frame.current = window.requestAnimationFrame(() => {
          frame.current = 0;
          setResetting(false);
          busy.current = false;
        });
      });
    }, duration());
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (busy.current || !event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = { x: event.clientX, y: event.clientY, horizontal: false };
    dragCurrent.current = 0;
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || busy.current) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      start.horizontal = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setPreviewDirection(dx < 0 ? 1 : -1);
    const limit = Math.max(120, (activeCardRef.current?.offsetWidth ?? 285) * 0.64);
    const scale = getScrollScale(getScrollContainer(activeCardRef.current));
    const distance = Math.max(-limit, Math.min(limit, dx / scale));
    dragCurrent.current = distance;
    if (!frame.current) frame.current = window.requestAnimationFrame(() => {
      frame.current = 0;
      setDragX(dragCurrent.current);
    });
  }

  function handlePointerEnd() {
    if (!gesture.current) return;
    gesture.current = null;
    window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    setDragging(false);
    if (Math.abs(dragCurrent.current) >= swipeThreshold()) {
      const direction = dragCurrent.current < 0 ? 1 : -1;
      cycle(direction, direction === 1 ? -exitDistance() : exitDistance());
    } else {
      busy.current = true;
      dragCurrent.current = 0;
      setDragX(0);
      timer.current = window.setTimeout(() => { busy.current = false; }, duration());
    }
  }

  function handlePointerCancel() {
    if (!gesture.current) return;
    gesture.current = null;
    window.cancelAnimationFrame(frame.current);
    frame.current = 0;
    setDragging(false);
    dragCurrent.current = 0;
    setDragX(0);
  }

  const active = ordered[activeIndex];
  const progress = Math.min(Math.abs(dragX) / swipeThreshold(), 1);
  const activeRotation = Math.max(-5, Math.min(5, dragX / 32));

  return (
    <section className="section section-bars" id="bar-setups">
      <Container>
        <header className="section-head">
          <p className="kicker">BAR SETUPS</p>
          <h2>Una barra que funcione para tu evento.</h2>
          <p>Explora las opciones y encuentra la que mejor encaje.</p>
          {preferences.eventPath && barPriorityByPath[preferences.eventPath] ? <small className="bar-context">Ordenadas según el tamaño de tu evento.</small> : null}
        </header>

        <div className="bar-deck" aria-label="Deck de opciones de barra">
          {[2, 1].map((depth) => {
            const bar = ordered[(activeIndex + depth * previewDirection + ordered.length) % ordered.length];
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
            ref={activeCardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handlePointerCancel}
            style={{ transform: `translateX(${dragX}px) rotate(${activeRotation}deg)`, transition: dragging || resetting ? "none" : undefined }}
            role="group"
            aria-label={`Imagen de ${active.title}`}
          >
            <Image src={active.image} alt={active.title} fill sizes="285px" draggable={false} />
          </div>
        </div>

        <div className="stationary-bar-info" aria-live="polite">
          {activeIndex === 0 && preferences.eventPath && barPriorityByPath[preferences.eventPath] ? <span className="bar-recommendation">MEJOR ENCAJE</span> : null}
          <span className="bar-index">{String(activeIndex + 1).padStart(2, "0")}</span>
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          {active.logisticsNote ? <p className="bar-transport-note">{active.logisticsNote}</p> : null}
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
