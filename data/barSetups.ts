import type { EventPathId } from "@/lib/types";

export type BarSetup = {
  id: string;
  title: string;
  description: string;
  logisticsNote?: string;
  tags: string[];
  image: string;
};

export const barSetups: BarSetup[] = [
  {
    id: "venue",
    title: "Venue Bar",
    description: "Usamos la barra que ya está ahí.",
    tags: ["Barra existente", "Flexible"],
    image: "/images/peposhots/bars/venue.webp"
  },
  {
    id: "classic-white",
    title: "Classic White Bar",
    description: "Limpia, formal y fácil de integrar.",
    tags: ["Formal", "Interior / exterior"],
    image: "/images/peposhots/bars/classic-white.webp"
  },
  {
    id: "signature-dark",
    title: "Barra PepoShots",
    description: "Para un lugar sin barra o para sumar una segunda estación.",
    logisticsNote: "Transporte a coordinar al consultar.",
    tags: ["Sin barra en el lugar", "Segunda estación"],
    image: "/images/peposhots/bars/signature-dark.webp"
  },
  {
    id: "compact-white",
    title: "Compact Setup",
    description: "Para espacios pequeños sin perder servicio.",
    tags: ["Espacios pequeños", "Flexible"],
    image: "/images/peposhots/bars/compact-white.webp"
  },
  {
    id: "outdoor-mobile",
    title: "Mobile / Outdoor Bar",
    description: "Cuando el lugar no trae la barra.",
    tags: ["Exterior", "Sin barra instalada"],
    image: "/images/peposhots/bars/outdoor-mobile.webp"
  }
];

export const barPriorityByPath: Record<EventPathId, string[]> = {
  "up-to-50": ["compact-white", "venue", "classic-white", "signature-dark", "outdoor-mobile"],
  "51-100": ["venue", "classic-white", "signature-dark", "outdoor-mobile", "compact-white"],
  "101-150": ["venue", "classic-white", "signature-dark", "outdoor-mobile", "compact-white"],
  "151-200": ["venue", "classic-white", "signature-dark", "outdoor-mobile", "compact-white"],
  "over-200": ["venue", "classic-white", "signature-dark", "outdoor-mobile", "compact-white"]
};
