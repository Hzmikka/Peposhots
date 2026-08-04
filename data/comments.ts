import type { EventType } from "./eventTypes";

export type CommentEntry = {
  id: string;
  author: string;
  eventType: EventType;
  body: string;
  createdAt: string;
  isSeed: boolean;
  isDemo?: boolean;
  ownerToken?: string;
};

export const initialComments: CommentEntry[] = [
  {
    id: "seed-private-party",
    author: "Mariela R.",
    eventType: "Fiesta privada",
    body: "Pepo llegó con todo organizado y mantuvo el bar activo durante toda la noche. Nosotros pudimos disfrutar con los invitados sin preocuparnos por el servicio.",
    createdAt: "2026-07-18T20:30:00.000Z",
    isSeed: true,
  },
  {
    id: "seed-birthday",
    author: "Daniela M.",
    eventType: "Cumpleaños",
    body: "Los shots llamaron la atención desde que empezó la fiesta. Se veían increíbles, tenían sabores diferentes y la presentación quedó perfecta con la decoración.",
    createdAt: "2026-07-12T19:10:00.000Z",
    isSeed: true,
  },
  {
    id: "seed-wedding",
    author: "Andrea y Luis",
    eventType: "Boda",
    body: "El servicio fue elegante, cercano y muy bien coordinado. Nuestros invitados siempre tuvieron una copa lista y nosotros pudimos disfrutar plenamente del brindis.",
    createdAt: "2026-06-29T21:45:00.000Z",
    isSeed: true,
  },
  {
    id: "seed-graduation",
    author: "Carlos P.",
    eventType: "Graduación",
    body: "Queríamos una celebración dinámica y PepoShots logró exactamente eso. Los cócteles, la atención y la energía del bar hicieron que la noche se sintiera especial.",
    createdAt: "2026-06-21T18:20:00.000Z",
    isSeed: true,
  },
];
