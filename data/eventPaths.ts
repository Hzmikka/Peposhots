import type { EventPathId } from "@/lib/types";

export type EventPath = {
  id: EventPathId;
  label: string;
  title: string;
  meta: [string, string];
  image: string;
};

export const eventPaths: EventPath[] = [
  {
    id: "wedding",
    label: "BODA / FORMAL",
    title: "Muchos invitados. Todo tiene que fluir.",
    meta: ["Más volumen", "Servicio continuo"],
    image: "/images/peposhots/paths/wedding-clean.webp"
  },
  {
    id: "graduation",
    label: "GRADUACIÓN",
    title: "Social, dinámica y sin sentirse improvisada.",
    meta: ["Grupo medio", "Ritmo social"],
    image: "/images/peposhots/paths/graduation-clean.webp"
  },
  {
    id: "private-party",
    label: "CUMPLEAÑOS / PRIVADO",
    title: "Disfruta tu fiesta sin quedarte en la barra.",
    meta: ["Flexible", "Casa o venue"],
    image: "/images/peposhots/paths/private-party-clean.webp"
  },
  {
    id: "corporate",
    label: "CORPORATIVO",
    title: "Servicio discreto, limpio y profesional.",
    meta: ["Profesional", "Ordenado"],
    image: "/images/peposhots/paths/corporate-clean.webp"
  }
];
