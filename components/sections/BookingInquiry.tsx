"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { BookingInquiryForm } from "@/components/forms/BookingInquiryForm";
import { addScrollListener, getScrollContainer } from "@/lib/scrolling";
import { business } from "@/data/business";

const trayBottomTransparentRatio = 156 / 1024;
const bookingSettleLead = 72;
const bookingSceneLift = 72;

export function BookingInquiry() {
  const phone = business.contact.phone || "+17866067684";
  const email = business.contact.email || "peposchots5@gmail.com";
  const toolsRef = useRef<HTMLDivElement>(null);
  const [toolsSettled, setToolsSettled] = useState(false);

  useEffect(() => {
    if (toolsSettled) return;
    let frame = 0;
    const scroller = getScrollContainer(toolsRef.current ?? null);
    const checkPosition = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const tray = toolsRef.current?.querySelector<HTMLImageElement>("img:last-of-type");
        if (!tray) return;
        const trayRect = tray.getBoundingClientRect();
        const visibleTrayBottom = trayRect.bottom - trayRect.height * trayBottomTransparentRatio;
        const shell = toolsRef.current?.closest<HTMLElement>(".page-shell");
        const stickyCta = shell?.querySelector<HTMLElement>(".mobile-sticky-cta");
        const triggerLine = stickyCta?.getBoundingClientRect().top ?? scroller?.getBoundingClientRect().bottom ?? window.innerHeight;
        // The live artwork is lifted visually by the same amount below. Compensate here so
        // the already-approved settle timing does not become another 72px earlier by accident.
        const visualLiftCompensation = shell?.classList.contains("is-live") ? bookingSceneLift : 0;
        if (visibleTrayBottom <= triggerLine + 32 + bookingSettleLead - visualLiftCompensation) setToolsSettled(true);
      });
    };
    checkPosition();
    const tray = toolsRef.current?.querySelector<HTMLImageElement>("img:last-of-type");
    tray?.addEventListener("load", checkPosition);
    const removeScrollListener = addScrollListener(scroller, checkPosition);
    window.addEventListener("resize", checkPosition);
    return () => {
      window.cancelAnimationFrame(frame);
      tray?.removeEventListener("load", checkPosition);
      removeScrollListener();
      window.removeEventListener("resize", checkPosition);
    };
  }, [toolsSettled]);

  return (
    <section className="section section-booking" id="booking">
      <div className="booking-tools" aria-hidden="true">
        <Image src="/images/peposhots/booking/tools.webp" alt="" fill sizes="(max-width: 400px) 128vw, 512px" />
      </div>
      <Container className="booking-layout">
        <div className="booking-copy">
          <div className="booking-intro">
            <p className="kicker light">CHECK YOUR DATE</p>
            <h2>Cuéntanos sobre tu evento.</h2>
            <p>Envía los datos esenciales y PepoShots confirmará disponibilidad y precio contigo.</p>
          </div>
          <blockquote>Tu evento ya tiene suficientes cosas en movimiento. Esta puede ser simple.</blockquote>
          <div className="direct-contact">
            <span>¿Prefieres hablar?</span>
            <div className="direct-contact-actions">
              <a href={`tel:${phone}`}>Llamar</a>
              <a href={`mailto:${email}`}>Email</a>
              <a className="direct-contact-whatsapp" href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp · Recomendado</a>
            </div>
            <div ref={toolsRef} className={`direct-contact-tools${toolsSettled ? " is-settled" : ""}`}>
              <Image src="/images/peposhots/booking/coctelera-martini.webp" alt="" width={596} height={1064} sizes="(max-width: 400px) 90vw, 360px" />
              <Image src="/images/peposhots/booking/bandeja.webp" alt="" width={596} height={1064} sizes="(max-width: 400px) 90vw, 360px" />
              <div className="tray-service-card">
                <BookingInquiryForm />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
