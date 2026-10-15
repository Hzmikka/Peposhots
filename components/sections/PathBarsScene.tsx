"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { EventPaths } from "@/components/sections/EventPaths";
import { BarSetups } from "@/components/sections/BarSetups";
import { addScrollListener, getElementTop, getScrollContainer, getScrollTop, getViewportHeight } from "@/lib/scrolling";

export function PathBarsScene() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const scrollRoot = getScrollContainer(scene);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paths = scene.querySelector<HTMLElement>(".section-paths");
    const bars = scene.querySelector<HTMLElement>(".section-bars");
    const shaker = scene.querySelector<HTMLElement>(".path-bars-shaker");
    if (!paths || !bars || !shaker) return;
    let frame = 0;
    let geometry = { start: 0, end: 1, travel: 0, x: 0 };

    const update = () => {
      frame = 0;
      const progress = reducedMotion.matches
        ? 0.55
        : Math.min(1, Math.max(0, (getScrollTop(scrollRoot) - geometry.start) / Math.max(1, geometry.end - geometry.start)));

      scene.style.setProperty("--shaker-progress", String(progress));
      scene.style.setProperty("--shaker-turn", `${progress * 90}deg`);
      scene.style.setProperty("--shaker-drop", `${progress * geometry.travel}px`);
      scene.style.setProperty("--shaker-x", `${progress * geometry.x}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const measure = () => {
      const viewport = getViewportHeight(scrollRoot);
      const barsTop = getElementTop(bars, scrollRoot);
      const landingPoint = barsTop - getElementTop(scene, scrollRoot) + Math.min(bars.offsetHeight * 0.12, scene.clientWidth * 0.175);
      geometry = {
        start: getElementTop(paths, scrollRoot) + paths.offsetHeight * 0.32 - viewport * 0.78,
        end: barsTop - viewport * 0.34,
        travel: Math.max(0, landingPoint - shaker.offsetTop - shaker.offsetHeight * 0.48),
        x: Math.min(9, scene.clientWidth * 0.025),
      };
      requestUpdate();
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(scene);
    resizeObserver.observe(paths);
    resizeObserver.observe(bars);
    resizeObserver.observe(shaker);
    measure();
    const removeScrollListener = addScrollListener(scrollRoot, requestUpdate);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    reducedMotion.addEventListener("change", requestUpdate);
    return () => {
      removeScrollListener();
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={sceneRef} className="path-bars-scene">
      <div className="path-bars-shaker" aria-hidden="true">
        <Image
          src="/images/peposhots/paths/coctelera.webp"
          alt=""
          fill
          sizes="(max-width: 400px) 240vw, 960px"
          priority={false}
        />
      </div>
      <EventPaths />
      <BarSetups />
    </div>
  );
}
