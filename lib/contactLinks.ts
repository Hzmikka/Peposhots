import type { BookingDraft } from "@/types/booking";

export const phoneLink = "tel:+17866067684";
export const emailLink = "mailto:peposchots5@gmail.com";

export function createSmsLink(draft?: Partial<BookingDraft>) {
  const message = `Hola PepoShots, quiero consultar disponibilidad para un evento.

Nombre: ${draft?.name ?? ""}
Fecha: ${draft?.eventDate ?? ""}
Hora: ${draft?.eventTime ?? ""}
Tipo de celebración: ${draft?.customEventType || draft?.eventType || ""}
Zona: ${draft?.zone ?? ""}
Invitados: ${draft?.guestRange ?? ""}
Cócteles: ${draft?.cocktails?.join(", ") ?? ""}
Detalles: ${draft?.message ?? ""}`;
  return `sms:+17866067684?body=${encodeURIComponent(message)}`;
}
