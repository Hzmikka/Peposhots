"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { PathBarsScene } from "@/components/sections/PathBarsScene";
import { DrinksExperience } from "@/components/sections/DrinksExperience";
import { TABLET_MIN_WIDTH } from "@/lib/responsive";
import { addScrollListener, getElementTop, getScrollContainer, getScrollTop, getViewportHeight } from "@/lib/scrolling";
import { createShakerJourney, sampleShakerJourney, type JourneyRect, type ShakerJourney } from "@/lib/shakerJourney";

export function CocktailJourney() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState<ShakerJourney | null>(null);
  const id = `pepo-liquid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const scene = sceneRef.current;
    const layer = layerRef.current;
    const canvas = scene?.closest<HTMLElement>(".live-site");
    if (!scene || !layer || !canvas) return;
    const scroller = getScrollContainer(scene);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let geometry: ShakerJourney | null = null;
    let frame = 0;
    let needsMeasure = true;
    let disposed = false;

    const rect = (element: HTMLElement, top: number): JourneyRect => {
      const bounds = element.getBoundingClientRect();
      const sceneBounds = scene.getBoundingClientRect();
      return { left: bounds.left - sceneBounds.left, top: getElementTop(element, scroller) - top, width: bounds.width, height: bounds.height };
    };

    const measure = () => {
      needsMeasure = false;
      // DOMRect retains fractional CSS pixels at browser zoom levels; clientWidth
      // rounds them and can disagree with the container query at 599.5–599.9 px.
      if (canvas.getBoundingClientRect().width < TABLET_MIN_WIDTH) {
        if (geometry) setDrawing(null);
        geometry = null;
        delete scene.dataset.journeyStops;
        delete layer.dataset.ready;
        return;
      }
      const hero = scene.querySelector<HTMLElement>(".pepo-hero");
      const paths = scene.querySelector<HTMLElement>(".section-paths");
      const heading = paths?.querySelector<HTMLElement>(".section-head > div:first-child");
      const carousel = paths?.querySelector<HTMLElement>(".path-grid");
      const bars = scene.querySelector<HTMLElement>(".section-bars");
      const drinksHeading = scene.querySelector<HTMLElement>(".drinks-wide-intro");
      const card = scene.querySelector<HTMLElement>(".cocktail-editorial-card");
      const tray = scene.querySelector<HTMLElement>(".drinks-tray");
      if (!hero || !paths || !heading || !bars || !drinksHeading || !card || !tray) return;
      const top = getElementTop(scene, scroller);
      const next = createShakerJourney({
        width: scene.getBoundingClientRect().width, height: scene.getBoundingClientRect().height, documentTop: top, viewportHeight: getViewportHeight(scroller),
        hero: rect(hero, top), paths: rect(paths, top), heading: rect(heading, top), bars: rect(bars, top),
        carousel: carousel ? rect(carousel, top) : undefined,
        drinksHeading: rect(drinksHeading, top), card: rect(card, top), tray: rect(tray, top),
      });
      if (!next) return;
      geometry = next;
      layer.style.setProperty("--journey-size", `${next.size}px`);
      scene.dataset.journeyStops = JSON.stringify(next.stops);
      setDrawing(next);
    };
    const update = () => {
      frame = 0;
      if (disposed) return;
      if (needsMeasure) measure();
      if (!geometry) return;
      const current = sampleShakerJourney(geometry, getScrollTop(scroller), motion.matches);
      layer.style.setProperty("--journey-x", `${current.x}px`);
      layer.style.setProperty("--journey-y", `${current.y}px`);
      layer.style.setProperty("--journey-angle", `${current.angle}deg`);
      layer.style.setProperty("--journey-flow", String(current.flow));
      layer.style.setProperty("--journey-liquid-opacity", String(Math.min(1, current.flow * 10)));
      layer.style.setProperty("--journey-pool", String(current.pool));
      layer.dataset.phase = current.phase;
      layer.dataset.ready = "true";
    };
    const schedule = () => { if (!frame && !disposed) frame = window.requestAnimationFrame(update); };
    const scheduleMeasure = () => { needsMeasure = true; schedule(); };
    const observer = new ResizeObserver(scheduleMeasure);
    for (const element of [canvas, scene, ...scene.querySelectorAll<HTMLElement>(".pepo-hero, .section-paths, .section-bars, .section-drinks, .cocktail-selection")]) observer.observe(element);
    const removeScroll = addScrollListener(scroller, schedule);
    window.addEventListener("resize", scheduleMeasure);
    window.visualViewport?.addEventListener("resize", scheduleMeasure);
    motion.addEventListener("change", schedule);
    document.fonts.ready.then(() => { if (!disposed) scheduleMeasure(); });
    schedule();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      removeScroll();
      window.removeEventListener("resize", scheduleMeasure);
      window.visualViewport?.removeEventListener("resize", scheduleMeasure);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div ref={sceneRef} className="cocktail-journey">
      <Hero />
      <PathBarsScene />
      <DrinksExperience />
      <div ref={layerRef} className="journey-motion-layer" aria-hidden="true">
        {drawing ? (
          <svg className="journey-liquid" viewBox={`0 0 ${drawing.width} ${drawing.height}`} preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id={`${id}-stream`} x1="0" y1={drawing.nozzle.y} x2="0" y2={drawing.pool.y} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#F4FAD8" stopOpacity=".88" />
                <stop offset=".25" stopColor="#CEF17B" stopOpacity=".72" />
                <stop offset="1" stopColor="#8EA742" stopOpacity=".6" />
              </linearGradient>
              <linearGradient id={`${id}-pool`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#DDF6A0" stopOpacity=".75" />
                <stop offset=".55" stopColor="#B2D564" stopOpacity=".48" />
                <stop offset="1" stopColor="#5D8845" stopOpacity=".55" />
              </linearGradient>
            </defs>
            <g className="journey-liquid-fall">
              <path className="journey-liquid-stream" d={drawing.paths.stream} pathLength="1" fill="none" stroke={`url(#${id}-stream)`} strokeWidth="22" strokeLinecap="round" />
              <path className="journey-liquid-stream journey-liquid-shine" d={drawing.paths.stream} pathLength="1" fill="none" stroke="#FFFFEC" strokeWidth="4" strokeOpacity=".8" strokeLinecap="round" />
            </g>
            <g className="journey-liquid-pool">
              <path d={drawing.paths.pool} fill={`url(#${id}-pool)`} />
              <path d={drawing.paths.left} fill="none" stroke="#C6E98B" strokeWidth="28" strokeOpacity=".65" strokeLinecap="round" />
              <path d={drawing.paths.right} fill="none" stroke="#D5EE9F" strokeWidth="22" strokeOpacity=".75" strokeLinecap="round" />
              <ellipse cx={drawing.pool.x} cy={drawing.pool.y + 30} rx={drawing.pool.width * .29} ry="34" fill="none" stroke="#F9FFE9" strokeWidth="3" strokeOpacity=".6" />
              {[-.35, -.2, .26, .4].map((offset, index) => (
                <ellipse key={offset} cx={drawing.pool.x + drawing.pool.width * offset} cy={drawing.pool.y - drawing.pool.height * (.38 + index % 2 * .18)} rx={8 + index * 2} ry={14 + index * 2} fill="#C3E77C" fillOpacity=".65" transform={`rotate(${offset * 100}, ${drawing.pool.x + drawing.pool.width * offset}, ${drawing.pool.y - drawing.pool.height * (.38 + index % 2 * .18)})`} />
              ))}
            </g>
          </svg>
        ) : null}
        <div className="journey-shaker">
          <Image src="/images/peposhots/paths/coctelera.webp" alt="" fill sizes="(max-width: 1299px) 80vw, 1040px" draggable={false} />
        </div>
      </div>
    </div>
  );
}
