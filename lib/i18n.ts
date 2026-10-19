import english from "@/data/english.json";

export type Language = "es" | "en";
const translations: Record<string, string> = english;
const spanish = Object.fromEntries(Object.entries(translations).map(([es, en]) => [en, es]));

export function isLanguage(value: unknown): value is Language {
  return value === "es" || value === "en";
}

export function translate(language: Language, source: string, values: Record<string, string | number> = {}) {
  const key = source.trim();
  const translated = language === "en" ? translations[key] ?? key : spanish[key] ?? key;
  const rendered = translated.replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
  return `${source.match(/^\s*/)?.[0] ?? ""}${rendered}${source.match(/\s*$/)?.[0] ?? ""}`;
}

export function requestLanguage(request: Request): Language {
  return request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "es";
}
