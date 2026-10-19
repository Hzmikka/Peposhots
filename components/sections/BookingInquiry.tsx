"use client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { BookingInquiryForm } from "@/components/forms/BookingInquiryForm";
import { addScrollListener, getScrollContainer, getVisibleBounds } from "@/lib/scrolling";
import { business } from "@/data/business";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { eventPaths } from "@/data/eventPaths";
import { barSetups } from "@/data/barSetups";
import { drinks } from "@/data/drinks";
import { buildWhatsAppUrl, formatEventDate, type BookingFields } from "@/lib/bookingSupport";
export function BookingInquiry() {
    const { t, language } = useI18n();
    const phone = business.contact.phone || "+17866067684";
    const email = business.contact.email || "peposchots5@gmail.com";
    const { preferences } = usePepoExperience();
    const [bookingDetails, setBookingDetails] = useState<Partial<BookingFields>>({});
    const selectedEvent = eventPaths.find((event) => event.id === preferences.eventPath);
    const selectedBar = barSetups.find((bar) => bar.id === preferences.preferredBarSetup);
    const favorites = drinks.filter((drink) => preferences.favoriteDrinks?.includes(drink.id));
    const whatsappMessage = [
        t("Hola, me gustaría consultar disponibilidad para un evento."),
        ...(bookingDetails.eventDate ? [t("Fecha") + ": " + formatEventDate(bookingDetails.eventDate, language)] : []),
        ...(bookingDetails.eventType ? [t("Tipo") + ": " + t(bookingDetails.eventType)] : []),
        ...(bookingDetails.guestRange || selectedEvent ? [t("Invitados") + ": " + t(bookingDetails.guestRange || selectedEvent!.label)] : []),
        ...(bookingDetails.location || preferences.location ? [t("Zona") + ": " + (bookingDetails.location || preferences.location)] : []),
        ...(bookingDetails.serviceNeeded ? [t("Servicio") + ": " + t(bookingDetails.serviceNeeded)] : []),
        ...(bookingDetails.venueHasBar ? [t("Barra del lugar") + ": " + t(bookingDetails.venueHasBar)] : []),
        ...(bookingDetails.schedule ? [t("Horario") + ": " + bookingDetails.schedule] : []),
        ...(bookingDetails.setting ? [t("Espacio") + ": " + t(bookingDetails.setting)] : []),
        ...(selectedBar ? [t("Barra elegida") + ": " + t(selectedBar.title)] : []),
        ...(favorites.length ? [t("Cócteles") + ": " + favorites.map((drink) => drink.name).join(", ")] : []),
    ].join("\n");
    const toolsRef = useRef<HTMLDivElement>(null);
    // The server-rendered form stays usable even if animation setup fails.
    const [phase, setPhase] = useState<"static" | "pending" | "settled">("static");
    useEffect(() => {
        const tools = toolsRef.current;
        const card = tools?.querySelector<HTMLElement>(".tray-service-card");
        if (!tools || !card)
            return;
        let frame = 0;
        let settled = false;
        const scroller = getScrollContainer(tools);
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const reveal = () => {
            settled = true;
            setPhase("settled");
        };
        const measure = () => {
            frame = 0;
            const bounds = getVisibleBounds(scroller);
            const rect = card.getBoundingClientRect();
            if (motion.matches || card.contains(document.activeElement) || window.location.hash === "#booking-form"
                || rect.top <= bounds.bottom - Math.min(80, (bounds.bottom - bounds.top) * 0.15))
                reveal();
            else if (!settled)
                setPhase("pending");
        };
        const checkPosition = () => {
            if (!frame)
                frame = window.requestAnimationFrame(measure);
        };
        checkPosition();
        const removeScrollListener = addScrollListener(scroller, checkPosition);
        const resizeObserver = new ResizeObserver(checkPosition);
        resizeObserver.observe(tools);
        card.addEventListener("focusin", reveal);
        window.addEventListener("hashchange", checkPosition);
        motion.addEventListener("change", checkPosition);
        window.addEventListener("resize", checkPosition);
        window.visualViewport?.addEventListener("resize", checkPosition);
        window.visualViewport?.addEventListener("scroll", checkPosition);
        return () => {
            window.cancelAnimationFrame(frame);
            card.removeEventListener("focusin", reveal);
            window.removeEventListener("hashchange", checkPosition);
            motion.removeEventListener("change", checkPosition);
            resizeObserver.disconnect();
            removeScrollListener();
            window.removeEventListener("resize", checkPosition);
            window.visualViewport?.removeEventListener("resize", checkPosition);
            window.visualViewport?.removeEventListener("scroll", checkPosition);
        };
    }, []);
    return (<section className="section section-booking" id="booking">
      <div className="booking-tools" aria-hidden="true">
        <Image src="/images/peposhots/booking/tools.webp" alt="" fill sizes="(max-width: 400px) 128vw, 512px"/>
      </div>
      <Container className="booking-layout">
        <div className="booking-copy">
          <div className="booking-intro">
            <p className="kicker light">{t("CONSULTA TU FECHA")}</p>
            <h2>{t("Cu\u00E9ntanos sobre tu evento.")}</h2>
            <p>{t("Env\u00EDa los datos esenciales y PepoShots confirmar\u00E1 disponibilidad y precio contigo.")}</p>
          </div>
          <blockquote>{t("Tu evento ya tiene suficientes cosas en movimiento. Esta puede ser simple.")}</blockquote>
          <div className="direct-contact">
            <span>{t("\u00BFPrefieres hablar?")}</span>
            <div className="direct-contact-actions">
              <a href={`tel:${phone}`}>{t("Llamar")}</a>
              <a href={`mailto:${email}`}>{t("Email")}</a>
              <a className="direct-contact-whatsapp" href={buildWhatsAppUrl(phone, whatsappMessage)} target="_blank" rel="noreferrer">{t("WhatsApp \u00B7 Recomendado")}</a>
            </div>
            <a className="booking-form-link" href="#booking-form" onClick={() => setPhase("settled")}>{t("Ir al formulario \u2193")}</a>
            <div ref={toolsRef} className={`direct-contact-tools ${phase === "pending" ? "is-pending" : "is-settled"}`}>
              <div className="booking-artwork" aria-hidden="true">
              <Image src="/images/peposhots/booking/coctelera-martini.webp" alt="" width={765} height={1024} sizes="(max-width: 600px) 180vw, 720px"/>
              <Image src="/images/peposhots/booking/bandeja.webp" alt="" width={765} height={1024} sizes="(max-width: 600px) 220vw, 880px"/>
              </div>
              <div className="tray-service-card" id="booking-form">
                <BookingInquiryForm onDetailsChange={setBookingDetails} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>);
}
