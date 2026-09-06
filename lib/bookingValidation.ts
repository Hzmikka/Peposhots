import type { BookingDraft } from "@/types/booking";

export type BookingErrors = Partial<Record<keyof BookingDraft, string>>;

export function getMinimumEventDate() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

export function validateBooking(draft: BookingDraft): BookingErrors {
  const errors: BookingErrors = {};
  if (draft.name.trim().length < 2 || draft.name.trim().length > 50) errors.name = "Escribe un nombre de 2 a 50 caracteres.";
  if (!/^[+()\d\s-]+$/.test(draft.phone) || (draft.phone.match(/\d/g) ?? []).length < 7) errors.phone = "Escribe un teléfono válido con al menos 7 dígitos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.email = "Escribe un email válido.";
  if (!draft.eventDate || draft.eventDate < getMinimumEventDate()) errors.eventDate = "Para organizar correctamente el servicio necesitamos al menos 2 semanas de anticipación.";
  if (!draft.eventType) errors.eventType = "Selecciona un tipo de celebración.";
  if (draft.eventType === "Otra celebración social" && !draft.customEventType?.trim()) errors.customEventType = "Indica qué tipo de celebración es.";
  if (!draft.zone.trim()) errors.zone = "Indica una ciudad, vecindario o zona aproximada.";
  if (!draft.guestRange) errors.guestRange = "Selecciona una cantidad aproximada de invitados.";
  return errors;
}
