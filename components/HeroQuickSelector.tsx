"use client";

import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { useBookingQuiz } from "@/context/BookingQuizContext";

export function HeroQuickSelector() {
  const { openBookingQuiz } = useBookingQuiz();
  return (
    <section className="hero-booking" id="process" aria-label="Consulta de disponibilidad">
      <Image className="hero-booking-leaf hero-booking-leaf-left" src="/hojas/hoja1.png" alt="" width={190} height={190} aria-hidden="true" />
      <Image className="hero-booking-leaf hero-booking-leaf-right" src="/hojas/hoja3.png" alt="" width={210} height={210} aria-hidden="true" />
      <div className="hero-booking-inner">
        <h2 className="booking-title">
          <span className="booking-title-line">Consulta <span className="booking-title-highlight">disponibilidad</span></span>{" "}
          <span className="booking-title-line">para tu evento</span>
        </h2>

        <div className="hero-event-date-form">
          <button className="event-date-picker" type="button" onClick={openBookingQuiz}>
            <CalendarDays size={18} strokeWidth={1.8} />
            <span>Solicitar disponibilidad</span>
          </button>
        </div>
      </div>
    </section>
  );
}
