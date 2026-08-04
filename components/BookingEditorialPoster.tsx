"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { useBookingQuiz } from "@/context/BookingQuizContext";
import styles from "./BookingEditorialPoster.module.css";

const faqs = [
  ["¿Con cuánta anticipación debo reservar?", "Recomendamos solicitar disponibilidad con al menos dos semanas de anticipación."],
  ["¿En qué zonas trabajan?", "PepoShots ofrece servicio en Miami. Confirmaremos contigo la cobertura exacta según la ubicación del evento."],
  ["¿Qué tipos de eventos atienden?", "Cumpleaños, bodas, reuniones privadas, graduaciones y otras celebraciones sociales."],
  ["¿El alcohol y los ingredientes están incluidos?", "Los detalles dependen del tipo de servicio y del evento. Antes de reservar, confirmaremos contigo qué aporta PepoShots y qué debe proporcionar el cliente."],
  ["¿Cómo se confirma una fecha?", "La solicitud inicial no confirma automáticamente la reserva. PepoShots revisará la disponibilidad y te indicará los siguientes pasos."],
  ["¿Puedo hablar con alguien antes de completar el formulario?", "Sí. Puedes enviar un mensaje de texto o llamar al 786 606-7684."],
];

export function BookingEditorialPoster() {
  const { openBookingQuiz } = useBookingQuiz();
  const posterRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const poster = posterRef.current;
    const faq = faqRef.current;

    if (!poster || !faq) return;

    let frame = 0;

    const measureClosedFaqHeight = () => {
      const clone = faq.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.querySelectorAll("details").forEach((detail) => detail.removeAttribute("open"));
      Object.assign(clone.style, {
        position: "fixed",
        inset: "auto",
        top: "0",
        left: "-10000px",
        width: `${faq.getBoundingClientRect().width}px`,
        height: "auto",
        visibility: "hidden",
        pointerEvents: "none",
        transform: "none",
      });
      document.body.appendChild(clone);
      const height = clone.getBoundingClientRect().height;
      clone.remove();
      return height;
    };

    const updateLayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = poster.getBoundingClientRect().width;
        const baseHeight = width * (16 / 9);
        const currentFaqHeight = faq.getBoundingClientRect().height;
        const closedFaqHeight = measureClosedFaqHeight();
        const growth = Math.max(0, currentFaqHeight - closedFaqHeight);

        poster.style.setProperty("--base-poster-height", `${baseHeight}px`);
        poster.style.setProperty("--faq-growth", `${growth}px`);
        poster.style.height = `${baseHeight + growth}px`;
        poster.style.aspectRatio = "auto";
      });
    };

    const faqObserver = new ResizeObserver(updateLayout);
    const details = Array.from(faq.querySelectorAll("details"));
    faqObserver.observe(faq);
    details.forEach((detail) => detail.addEventListener("toggle", updateLayout));
    window.addEventListener("resize", updateLayout);
    document.fonts?.ready.then(updateLayout);
    updateLayout();

    return () => {
      cancelAnimationFrame(frame);
      faqObserver.disconnect();
      details.forEach((detail) => detail.removeEventListener("toggle", updateLayout));
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  function handleBooking() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("booking")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(openBookingQuiz, reduceMotion ? 0 : 260);
  }

  return (
    <section ref={posterRef} className={styles.poster} aria-label="Tu evento. Nuestro ritmo.">
      <div className={styles.baseCanvas}>
        <Image
          className={styles.artwork}
          src="/cocktails-up-look/tu-evento-editorial.png"
          alt="Tu evento. Nuestro ritmo. Información del servicio PepoShots en Miami."
          fill
          sizes="(max-width: 1180px) 100vw, 1180px"
        />
        <Image
          className={styles.cocktailOverlay}
          src="/cocktails-up-look/cocktail3.png"
          alt=""
          width={1122}
          height={1402}
          sizes="(max-width: 767px) 48vw, 460px"
          aria-hidden="true"
        />
        <span className={styles.textPatch} aria-hidden="true" />
        <aside ref={faqRef} className={styles.posterFaq} id="preguntas-frecuentes" aria-labelledby="poster-faq-title">
          <p>Preguntas frecuentes</p>
          <h3 id="poster-faq-title">Antes de enviar tu consulta</h3>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <div>{answer}</div>
            </details>
          ))}
        </aside>
      </div>
      <div className={styles.supportPanel}>
        <div className={styles.actions}>
          <button type="button" onClick={handleBooking}>Consultar disponibilidad</button>
          <a href="tel:+17866067684"><Phone size={17} aria-hidden="true" />Llamar · 786 606-7684</a>
        </div>
        <Image
          className={styles.utensils}
          src="/images/utensilios/utensilios-cocteleria.png"
          alt="Utensilios de coctelería sobre fondo blanco"
          width={1916}
          height={821}
          sizes="(max-width: 960px) 100vw, 960px"
        />
      </div>
    </section>
  );
}
