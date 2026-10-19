export function validateContribution(raw: Record<string, unknown>, hasPhoto: boolean) {
  const clean = (key: string, max: number) => typeof raw[key] === "string" ? raw[key].trim().slice(0, max) : "";
  const mode = raw.mode === "photo" ? "photo" as const : "review" as const;
  const data = { mode, name: clean("name", 100), email: clean("email", 160), eventType: clean("eventType", 100), text: clean("text", 2000), rating: clean("rating", 5) };
  if (data.name.length < 2 || !/^\S+@\S+\.\S+$/.test(data.email) || raw.consent !== "yes") return { ok: false as const, message: "Completa los campos requeridos y acepta el permiso de publicación." };
  if (mode === "photo" && !hasPhoto) return { ok: false as const, message: "Selecciona una foto para compartir." };
  if (mode === "review" && (data.text.length < 5 || !/^[1-5]$/.test(data.rating))) return { ok: false as const, message: "Escribe tu reseña y elige una calificación." };
  return { ok: true as const, data };
}
