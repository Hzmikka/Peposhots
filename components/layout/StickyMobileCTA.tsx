"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import { getScrollContainer } from "@/lib/scrolling";
import { business } from "@/data/business";
export function StickyMobileCTA() {
    const { t } = useI18n();
    const phone = business.contact.phone || "+17866067684";
    const dockRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const [docked, setDocked] = useState(false);
    const [bookingVisible, setBookingVisible] = useState(false);
    useEffect(() => {
        const dock = dockRef.current;
        const cta = ctaRef.current;
        if (!dock || !cta)
            return;
        const scrollRoot = getScrollContainer(dock);
        const bookingCard = dock.closest(".page-shell")?.querySelector(".tray-service-card");
        const bookingObserver = new IntersectionObserver(([entry]) => {
            setBookingVisible(entry.isIntersecting && entry.intersectionRatio >= 0.05);
        }, { root: scrollRoot, threshold: [0, 0.05] });
        if (bookingCard)
            bookingObserver.observe(bookingCard);
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
        if (scrollRoot)
            resizeObserver.observe(scrollRoot);
        else
            resizeObserver.observe(document.documentElement);
        return () => {
            observer?.disconnect();
            bookingObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, []);
    return (<div ref={dockRef} className="mobile-cta-dock">
      <div ref={ctaRef} className={`mobile-sticky-cta${docked ? " is-docked" : " is-floating"}${bookingVisible ? " is-booking" : ""}`}>
        <a className="btn btn-primary" href="#booking">{t("Consultar fecha")}</a>
        <a className="btn btn-quiet" href={`tel:${phone}`}>{t("Llamar")}</a>
      </div>
    </div>);
}
