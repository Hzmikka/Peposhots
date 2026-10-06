import type { EventPathId } from "@/lib/types";

export type EventPath = {
  id: EventPathId;
  label: string;
  price: number | null;
  title: string;
  meta: [string, string];
  image: string;
};

export const eventPaths: EventPath[] = [
  {
    id: "up-to-50",
    label: "Hasta 50 invitados",
    price: 300,
    title: "Una celebración pequeña, con la barra en buenas manos.",
    meta: ["1 bartender", "Hasta 4 h"],
    image: "/images/peposhots/paths/private-party-clean.webp"
  },
  {
    id: "51-100",
    label: "51–100 invitados",
    price: 550,
    title: "Más invitados, con un equipo preparado para atenderlos.",
    meta: ["2 bartenders", "Hasta 4 h"],
    image: "/images/peposhots/paths/graduation-clean.webp"
  },
  {
    id: "101-150",
    label: "101–150 invitados",
    price: 800,
    title: "Servicio coordinado para una celebración de mayor volumen.",
    meta: ["3 bartenders", "Hasta 4 h"],
    image: "/images/peposhots/paths/wedding-clean.webp"
  },
  {
    id: "151-200",
    label: "151–200 invitados",
    price: 1050,
    title: "Un equipo más amplio para acompañar el ritmo de tu evento.",
    meta: ["4 bartenders", "Hasta 4 h"],
    image: "/images/peposhots/paths/corporate-clean.webp"
  },
  {
    id: "over-200",
    label: "Más de 200 invitados",
    price: null,
    title: "Planificamos el personal y las estaciones de barra para tu evento.",
    meta: ["Según menú y distribución", "Hasta 4 h"],
    image: "/images/peposhots/paths/wedding-clean.webp"
  }
];
