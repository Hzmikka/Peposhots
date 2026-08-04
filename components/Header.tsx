"use client";

import { Compass, Phone } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useBookingQuiz } from "@/context/BookingQuizContext";

const navigationItems = [
  { label: "Eventos", href: "#events" },
  { label: "Cócteles", href: "#cocktails" },
  { label: "Cómo funciona", href: "#process" },
  { label: "Zonas", href: "#service-area" },
  { label: "Contacto", href: "#contact" },
];

export function Header() {
  const { openBookingQuizAt } = useBookingQuiz();
  const [isOnLightBackground, setIsOnLightBackground] = useState(false);

  useEffect(() => {
    const updateHeaderTone = () => {
      const hero = document.querySelector(".hero");
      if (!hero) return;

      setIsOnLightBackground(hero.getBoundingClientRect().bottom <= 92);
    };

    updateHeaderTone();
    window.addEventListener("scroll", updateHeaderTone, { passive: true });
    window.addEventListener("resize", updateHeaderTone);

    return () => {
      window.removeEventListener("scroll", updateHeaderTone);
      window.removeEventListener("resize", updateHeaderTone);
    };
  }, []);

  const goToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
      block: window.matchMedia("(max-width: 680px)").matches ? "center" : "start",
    });
  };

  return (
    <header className={`site-header${isOnLightBackground ? " on-light" : ""}`}>
      <div className="container header-inner">
        <a
          className="logo"
          href="/"
          aria-label="PepoShots — inicio"
        >
          <Image
            src="/logo/isotipo.png"
            alt=""
            width={96}
            height={96}
            priority
            unoptimized
          />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigationItems.map((link) => (
            <a
              href={link.href}
              key={link.label}
              onClick={(event) => {
                event.preventDefault();
                goToSection(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a className="header-booking-link" href="tel:+17866067684"><Phone size={15}/><span className="call-desktop">Llamar · 786 606-7684</span><span className="call-tablet">Llamar ahora</span><span className="call-mobile">Llamar</span></a>
          <button
            className="booking-icon-button booking-guide-button"
            type="button"
            aria-label="Abrir guía para elegir cócteles"
            title="Ayúdame a elegir"
            data-tooltip="Ayúdame a elegir"
            onClick={() => openBookingQuizAt(0)}
          >
            <Compass size={21} aria-hidden="true" />
            <span className="guide-desktop">Ayúdame a elegir</span>
            <span className="guide-tablet">Guía rápida</span>
          </button>
        </div>
      </div>
    </header>
  );
}
