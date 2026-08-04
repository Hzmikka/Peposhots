"use client";

import Image from "next/image";
import { useBookingQuiz } from "@/context/BookingQuizContext";
import styles from "./CelebrationsShowcase.module.css";

type Celebration = {
  id: string;
  category: string;
  title: string;
  meta?: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  imagePosition?: string;
  bookingEvent: string;
};

const celebrations: Celebration[] = [
  {
    id: "private-parties",
    category: "Fiestas privadas",
    title: "Un bar privado creado alrededor de tu celebración",
    meta: "Reuniones · cenas · aniversarios · eventos especiales",
    image: "/images/events/private-parties.png",
    imageAlt: "Shots coloridos preparados para una celebración de cumpleaños",
    featured: true,
    imagePosition: "center 52%",
    bookingEvent: "private-party",
  },
  {
    id: "weddings",
    category: "Bodas",
    title: "Un servicio elegante para brindar por ustedes",
    meta: "Recepción · brindis · cócteles para invitados",
    image: "/images/events/weddings.webp",
    imageAlt: "Servicio de champaña preparado para el brindis de una boda",
    imagePosition: "center 44%",
    bookingEvent: "wedding",
  },
  {
    id: "birthdays",
    category: "Cumpleaños",
    title: "Shots coloridos para celebrar a lo grande",
    meta: "Cócteles festivos · sabores tropicales · presentación personalizada",
    image: "/images/events/birthdays.webp",
    imageAlt: "Bar de cócteles preparado para una fiesta privada",
    imagePosition: "center 40%",
    bookingEvent: "birthday",
  },
  {
    id: "graduations",
    category: "Graduaciones",
    title: "El brindis perfecto para una nueva etapa",
    image: "/images/events/graduations.webp",
    imageAlt: "Brindis para celebrar una graduación",
    imagePosition: "center 52%",
    bookingEvent: "graduation",
  },
];

function CelebrationCard({ item, onOpen }: { item: Celebration; onOpen: () => void }) {
  return (
    <button
      type="button"
      id={item.id}
      className={`${styles.card} ${item.featured ? styles.featured : ""}`}
      onClick={() => {
        window.sessionStorage.setItem("peposhots-selected-event", item.bookingEvent);
        onOpen();
      }}
      aria-label={`${item.category}: ${item.title}`}
    >
      <Image
        src={item.image}
        alt={item.imageAlt}
        fill
        sizes={
          item.featured
            ? "(max-width: 760px) 100vw, 100vw"
            : "(max-width: 760px) 100vw, 50vw"
        }
        className={styles.image}
        style={{ objectPosition: item.imagePosition }}
      />

      <div className={styles.glassLabel}>
        <div className={styles.labelHeading}>
          <span>{item.category}</span>
        </div>
      </div>
    </button>
  );
}

export function CelebrationsShowcase() {
  const { openBookingQuizAt } = useBookingQuiz();
  return (
    <section className={styles.section} id="events" aria-labelledby="events-title">
      <Image className={`${styles.leaf} ${styles.leafCardsLeft}`} src="/hojas/hoja5.png" alt="" width={180} height={180} aria-hidden="true" />
      <Image className={`${styles.leaf} ${styles.leafBottom}`} src="/hojas/hoja6.png" alt="" width={195} height={195} aria-hidden="true" />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Eventos PepoShots</p>
            <h2 id="events-title">Celebraciones con PepoShots</h2>
          </div>

          <button type="button" onClick={() => openBookingQuizAt(1)} className={styles.allEventsLink} aria-label="Consultar un evento">
            <span aria-hidden="true">↗</span>
          </button>
        </header>

        <div className={styles.grid}>
          {celebrations.map((item) => (
            <CelebrationCard key={item.id} item={item} onOpen={() => openBookingQuizAt(1)} />
          ))}
        </div>
      </div>
    </section>
  );
}
