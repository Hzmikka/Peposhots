export type BookingInquiryInput = {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventType: string;
  guestRange: string;
  location: string;
  serviceNeeded: string;
  venueHasBar: string;
  schedule?: string;
  setting?: string;
  favoriteDrinks?: string[];
  message?: string;
  company?: string;
  context?: {
    eventPath?: string;
    preferredBarSetup?: string;
    exploredDrink?: string;
  };
};

export type BookingValidationResult =
  | { ok: true; data: BookingInquiryInput }
  | { ok: false; errors: Record<string, string> };

function clean(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanStringList(value: unknown, maxItems = 9, maxItemLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => clean(item, maxItemLength))
    .filter(Boolean);
}

function localDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function validateBookingInquiry(input: unknown): BookingValidationResult {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const contextRaw = raw.context && typeof raw.context === "object" ? raw.context as Record<string, unknown> : {};

  const data: BookingInquiryInput = {
    name: clean(raw.name, 100),
    phone: clean(raw.phone, 30),
    email: clean(raw.email, 160),
    eventDate: clean(raw.eventDate, 20),
    eventType: clean(raw.eventType, 80),
    guestRange: clean(raw.guestRange, 40),
    location: clean(raw.location, 120),
    serviceNeeded: clean(raw.serviceNeeded, 80),
    venueHasBar: clean(raw.venueHasBar, 40),
    schedule: clean(raw.schedule, 80),
    setting: clean(raw.setting, 40),
    favoriteDrinks: cleanStringList(raw.favoriteDrinks),
    message: clean(raw.message, 1200),
    company: clean(raw.company, 100),
    context: {
      eventPath: clean(contextRaw.eventPath, 80),
      preferredBarSetup: clean(contextRaw.preferredBarSetup, 80),
      exploredDrink: clean(contextRaw.exploredDrink, 80)
    }
  };

  const errors: Record<string, string> = {};
  if (data.company) errors.company = "Invalid submission.";
  if (data.name.length < 2) errors.name = "Escribe tu nombre.";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Usa un email válido.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Usa un teléfono válido.";
  if (!data.eventType) errors.eventType = "Selecciona el tipo de evento.";
  if (!data.guestRange) errors.guestRange = "Selecciona un rango de invitados.";
  if (data.location.length < 2) errors.location = "Escribe ciudad o ZIP.";
  if (!data.serviceNeeded) errors.serviceNeeded = "Selecciona el servicio.";
  if (!data.venueHasBar) errors.venueHasBar = "Indica si el venue tiene barra.";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.eventDate)) {
    errors.eventDate = "Selecciona una fecha válida.";
  } else {
    const [year, month, day] = data.eventDate.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const isRealDate = parsed.getUTCFullYear() === year
      && parsed.getUTCMonth() === month - 1
      && parsed.getUTCDate() === day;
    if (!isRealDate) errors.eventDate = "Selecciona una fecha válida.";
    else if (data.eventDate < localDateKey(new Date())) errors.eventDate = "Selecciona una fecha de hoy en adelante.";
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
