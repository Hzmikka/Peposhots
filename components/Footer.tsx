"use client";

import { MessageSquare, Phone } from "lucide-react";
import { useBookingQuiz } from "@/context/BookingQuizContext";

const exploreLinks = [
  { label: "Eventos", href: "#eventos", target: "#events" },
  { label: "Cócteles", href: "#cocteles", target: "#cocktails" },
  { label: "Cómo funciona", href: "#como-funciona", target: "#process" },
  { label: "Zonas", href: "#zonas", target: "#service-area" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes", target: "#preguntas-frecuentes" },
];

const celebrations = ["Cumpleaños", "Bodas", "Reuniones privadas", "Graduaciones", "Otras celebraciones"];

export function Footer() {
  const { openBookingQuiz } = useBookingQuiz();
  const currentYear = new Date().getFullYear();

  const scrollTo = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    event.preventDefault();
    document.querySelector(target)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <footer className="pepo-footer" id="contact">
      <div className="container pepo-footer-grid">
        <section className="pepo-footer-brand" aria-labelledby="footer-brand-title">
          <h2 id="footer-brand-title">PepoShots</h2>
          <strong>Event Bartender</strong>
          <p>Servicio móvil de bartending para celebraciones en Miami.</p>
          <h3>Contacto</h3>
          <a href="tel:+17866067684">786 606-7684</a>
          <a href="mailto:peposchots5@gmail.com">peposchots5@gmail.com</a>
          <div className="pepo-footer-contact-buttons">
            <a href="tel:+17866067684"><Phone size={16} aria-hidden="true" /> Llamar</a>
            <a href="sms:+17866067684"><MessageSquare size={16} aria-hidden="true" /> Enviar mensaje de texto</a>
          </div>
        </section>

        <nav className="pepo-footer-column" aria-label="Explora">
          <h3>Explora</h3>
          {exploreLinks.map((link) => <a key={link.label} href={link.href} onClick={(event) => scrollTo(event, link.target)}>{link.label}</a>)}
        </nav>

        <nav className="pepo-footer-column" aria-label="Celebraciones">
          <h3>Celebraciones</h3>
          {celebrations.map((label) => <a key={label} href="#eventos" onClick={(event) => scrollTo(event, "#events")}>{label}</a>)}
        </nav>

        <section className="pepo-footer-column pepo-footer-inquiry" aria-labelledby="footer-inquiry-title">
          <h3 id="footer-inquiry-title">Consulta tu evento</h3>
          <button type="button" onClick={openBookingQuiz}>Empezar consulta</button>
          <a href="sms:+17866067684">Hablar por texto</a>
          <a href="tel:+17866067684">Llamar ahora</a>
          <a href="mailto:peposchots5@gmail.com">Enviar un email</a>
          <p>Solicita tu fecha con al menos dos semanas de anticipación.</p>
        </section>
      </div>

      <div className="pepo-footer-bottom">
        <div className="container">© {currentYear} PepoShots Event Bartender. Todos los derechos reservados. <span>Servicio móvil para eventos en Miami.</span></div>
      </div>
    </footer>
  );
}
