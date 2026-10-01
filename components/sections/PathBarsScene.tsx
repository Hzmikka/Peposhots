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

      const sceneTop = getElementTop(scene, scrollRoot);
      const barsTop = getElementTop(bars, scrollRoot);
      const viewport = getViewportHeight(scrollRoot);
      const start = sceneTop + paths.offsetHeight - viewport * 0.9;
      const end = barsTop - 12;
      const progress = reducedMotion.matches
        ? 0.55
        : Math.min(1, Math.max(0, (getScrollTop(scrollRoot) - start) / Math.max(1, end - start)));
      const travel = paths.offsetHeight * 0.8 + bars.offsetHeight * 0.2;

      scene.style.setProperty("--shaker-progress", String(progress));
      scene.style.setProperty("--shaker-turn", `${progress * 90}deg`);
      scene.style.setProperty("--shaker-drop", `${progress * travel}px`);
      scene.style.setProperty("--shaker-x", `${progress * 9}px`);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    const removeScrollListener = addScrollListener(scrollRoot, requestUpdate);
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);

    return () => {
      removeScrollListener();
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
