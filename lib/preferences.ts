import { eventPaths } from "@/data/eventPaths";
import { barSetups } from "@/data/barSetups";
import { drinks } from "@/data/drinks";
import type { EventPathId } from "@/lib/types";

export type PepoPreferences = {
  eventPath?: EventPathId;
  preferredBarSetup?: string;
  exploredDrink?: string;
  favoriteDrinks?: string[];
  location?: string;
};

export function sanitizePreferences(value: unknown): PepoPreferences {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const next: PepoPreferences = {};
  if (eventPaths.some((path) => path.id === source.eventPath)) next.eventPath = source.eventPath as EventPathId;
  if (barSetups.some((bar) => bar.id === source.preferredBarSetup)) next.preferredBarSetup = source.preferredBarSetup as string;
  if (drinks.some((drink) => drink.id === source.exploredDrink)) next.exploredDrink = source.exploredDrink as string;
  if (Array.isArray(source.favoriteDrinks)) next.favoriteDrinks = [...new Set(source.favoriteDrinks.filter((id): id is string => typeof id === "string" && drinks.some((drink) => drink.id === id)))];
  if (typeof source.location === "string" && source.location.trim()) next.location = source.location.trim().slice(0, 120);
  return next;
}
