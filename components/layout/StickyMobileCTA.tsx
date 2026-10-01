"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollContainer } from "@/lib/scrolling";
import { business } from "@/data/business";

export function StickyMobileCTA() {
  const phone = business.contact.phone || "+17866067684";
  const dockRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const dock = dockRef.current;
    const cta = ctaRef.current;
    if (!dock || !cta) return;

    const scrollRoot = getScrollContainer(dock);
    let observer: IntersectionObserver | null = null;

    const observeDock = () => {
      observer?.disconnect();
      const ctaHeight = cta.getBoundingClientRect().height;
      const bottomOffset = 8;

      observer = new IntersectionObserver(([entry]) => {
        const rootTop = scrollRoot?.getBoundingClientRect().top ?? 0;
        const viewportHeight = scrollRoot?.clientHeight ?? window.innerHeight;
        const dockTop = entry.boundingClientRect.top - rootTop;
        const dockingLine = viewportHeight - ctaHeight - bottomOffset;
        setDocked(dockTop <= dockingLine);
      }, {
        root: scrollRoot,
        threshold: 0,
        rootMargin: `0px 0px -${ctaHeight + bottomOffset}px 0px`
      });

      observer.observe(dock);
    };

    observeDock();
    const resizeObserver = new ResizeObserver(observeDock);
    resizeObserver.observe(cta);
    if (scrollRoot) resizeObserver.observe(scrollRoot);
    else resizeObserver.observe(document.documentElement);

    return () => {
      observer?.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={dockRef} className="mobile-cta-dock">
      <div ref={ctaRef} className={`mobile-sticky-cta${docked ? " is-docked" : " is-floating"}`}>
        <a className="btn btn-primary" href="#booking">Consultar fecha</a>
        <a className="btn btn-quiet" href={`tel:${phone}`}>Llamar</a>
      </div>
    </div>
  );
}
