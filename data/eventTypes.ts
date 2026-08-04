export const eventTypes = [
  { value: "private-party", label: "Fiesta privada" },
  { value: "birthday", label: "Cumpleaños" },
  { value: "wedding", label: "Boda" },
  { value: "graduation", label: "Graduación" },
  { value: "anniversary", label: "Aniversario" },
  { value: "engagement", label: "Compromiso" },
  { value: "corporate", label: "Evento corporativo" },
  { value: "holiday-party", label: "Fiesta de temporada" },
  { value: "bridal-shower", label: "Bridal shower" },
  { value: "baby-shower", label: "Baby shower" },
  { value: "bachelor-party", label: "Despedida de soltero" },
  { value: "bachelorette-party", label: "Despedida de soltera" },
  { value: "family-reunion", label: "Reunión familiar" },
  { value: "dinner-party", label: "Cena privada" },
  { value: "housewarming", label: "Celebración de nueva casa" },
  { value: "retirement", label: "Fiesta de retiro" },
  { value: "quinceanera", label: "Quinceañera o Sweet 16" },
  { value: "pool-party", label: "Pool party" },
  { value: "networking", label: "Networking" },
  { value: "brand-launch", label: "Lanzamiento de marca" },
  { value: "fundraiser", label: "Evento benéfico" },
  { value: "other", label: "Otro evento" },
] as const;

export type EventType = (typeof eventTypes)[number]["label"];
export type EventTypeValue = (typeof eventTypes)[number]["value"];

export const groupedEventTypes = [
  { label: "Celebraciones personales", values: ["birthday", "anniversary", "engagement", "graduation", "retirement", "housewarming", "quinceanera", "pool-party"] },
  { label: "Bodas y reuniones", values: ["wedding", "bridal-shower", "baby-shower", "bachelor-party", "bachelorette-party", "dinner-party", "family-reunion"] },
  { label: "Eventos sociales y profesionales", values: ["private-party", "corporate", "networking", "brand-launch", "holiday-party", "fundraiser", "other"] },
] as const;

export function getEventsByValues(values: readonly EventTypeValue[]) {
  return values.map((value) => eventTypes.find((event) => event.value === value)!);
}
