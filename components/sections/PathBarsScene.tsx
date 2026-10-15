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
    let frame = 0;

    const update = () => {
      frame = 0;
      const paths = scene.querySelector<HTMLElement>(".section-paths");
      const bars = scene.querySelector<HTMLElement>(".section-bars");
      if (!paths || !bars) return;

      const shaker = scene.querySelector<HTMLElement>(".path-bars-shaker");
      if (!shaker) return;

      const viewport = getViewportHeight(scrollRoot);
      const start = getElementTop(paths, scrollRoot) + paths.offsetHeight * 0.32 - viewport * 0.78;
      const end = getElementTop(bars, scrollRoot) - viewport * 0.34;
      const progress = reducedMotion.matches
        ? 0.55
        : Math.min(1, Math.max(0, (getScrollTop(scrollRoot) - start) / Math.max(1, end - start)));

      // Measure actual section and artwork positions instead of assuming one phone height.
      const landingPoint = bars.offsetTop + Math.min(bars.offsetHeight * 0.12, 70);
      const shakerCenter = shaker.offsetTop + shaker.offsetHeight * 0.48;
      const travel = Math.max(0, landingPoint - shakerCenter);

      scene.style.setProperty("--shaker-progress", String(progress));
      scene.style.setProperty("--shaker-turn", `${progress * 90}deg`);
      scene.style.setProperty("--shaker-drop", `${progress * travel}px`);
      scene.style.setProperty("--shaker-x", `${progress * Math.min(9, scene.clientWidth * 0.025)}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(scene);
    const paths = scene.querySelector<HTMLElement>(".section-paths");
    const bars = scene.querySelector<HTMLElement>(".section-bars");
    const shaker = scene.querySelector<HTMLElement>(".path-bars-shaker");
    if (paths) resizeObserver.observe(paths);
    if (bars) resizeObserver.observe(bars);
    if (shaker) resizeObserver.observe(shaker);
    update();
    const removeScrollListener = addScrollListener(scrollRoot, requestUpdate);
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    return () => {
      removeScrollListener();
      resizeObserver.disconnect();
      window.removeEventListener("resize", requestUpdate);
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
