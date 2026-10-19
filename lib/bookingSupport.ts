export const bookingFieldNames = ["name", "phone", "email", "eventDate", "eventType", "guestRange", "location", "serviceNeeded", "venueHasBar", "schedule", "setting", "message"] as const;
export type BookingFields = Record<(typeof bookingFieldNames)[number], string>;
export const bookingFieldLimits: Record<keyof BookingFields, number> = {
  name: 100, phone: 30, email: 160, eventDate: 20, eventType: 80, guestRange: 40,
  location: 120, serviceNeeded: 80, venueHasBar: 40, schedule: 80, setting: 40, message: 1200,
};
export const BOOKING_DRAFT_KEY = "peposhots-booking-draft-v1";
export const BOOKING_DRAFT_TTL = 12 * 60 * 60 * 1000;
const steps: Record<string, 0 | 1 | 2> = {
  eventDate: 0, eventType: 0, guestRange: 0, location: 0,
  serviceNeeded: 1, venueHasBar: 1, schedule: 1, setting: 1,
  name: 2, phone: 2, email: 2, message: 2,
};

export function stepForErrors(errors: Record<string, string>): 0 | 1 | 2 | 3 {
  const invalid = Object.keys(errors).map((field) => steps[field]).filter((step) => step !== undefined);
  return invalid.length ? Math.min(...invalid) as 0 | 1 | 2 : 3;
}

export function bartenderReferenceApplies(service: string) {
  return service === "" || service === "Bartender";
}

export function readBookingDraft(value: unknown, now = Date.now()) {
  if (!value || typeof value !== "object") return null;
  const draft = value as Record<string, unknown>;
  if (draft.version !== 1 || typeof draft.savedAt !== "number" || !Number.isFinite(draft.savedAt)
    || draft.savedAt > now + 60_000 || now - draft.savedAt > BOOKING_DRAFT_TTL
    || !draft.fields || typeof draft.fields !== "object") return null;
  const source = draft.fields as Record<string, unknown>;
  const fields: Partial<BookingFields> = {};
  for (const key of bookingFieldNames) {
    if (typeof source[key] === "string") fields[key] = source[key].slice(0, bookingFieldLimits[key]);
  }
  const dirty = Array.isArray(draft.dirty) ? draft.dirty.filter((field): field is keyof BookingFields => bookingFieldNames.includes(field)) : [];
  const step = typeof draft.step === "number" && Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= 3 ? draft.step as 0 | 1 | 2 | 3 : 0;
  return { fields, dirty, step };
}

export function buildWhatsAppUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function formatEventDate(value: string, language: "es" | "en") {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  const date = new Date(year, month - 1, day);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
}
