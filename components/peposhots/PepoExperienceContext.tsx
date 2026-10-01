"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { EventPathId } from "@/lib/types";

export type PepoPreferences = {
  eventPath?: EventPathId;
  preferredBarSetup?: string;
  exploredDrink?: string;
  favoriteDrinks?: string[];
  location?: string;
};

type ContextValue = {
  preferences: PepoPreferences;
  setEventPath: (id: EventPathId) => void;
  setPreferredBarSetup: (id: string) => void;
  setExploredDrink: (id: string) => void;
  setFavoriteDrinks: Dispatch<SetStateAction<string[]>>;
  setLocation: (location?: string) => void;
};

const STORAGE_KEY = "peposhots-preferences";

const PepoExperienceContext = createContext<ContextValue | null>(null);

export function PepoExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PepoPreferences>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setPreferences(JSON.parse(saved) as PepoPreferences);
      } catch {
        // A blocked storage API should not interrupt the booking flow.
      }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Preferences still remain available for the current session.
    }
  }, [hydrated, preferences]);

  const value = useMemo<ContextValue>(() => ({
    preferences,
    setEventPath: (id) => setPreferences((current) => ({ ...current, eventPath: id })),
    setPreferredBarSetup: (id) =>
      setPreferences((current) => ({ ...current, preferredBarSetup: id })),
    setExploredDrink: (id) =>
      setPreferences((current) => ({ ...current, exploredDrink: id })),
    setFavoriteDrinks: (next) => setPreferences((current) => ({
      ...current,
      favoriteDrinks: typeof next === "function" ? next(current.favoriteDrinks ?? []) : next
    })),
    setLocation: (location) => setPreferences((current) => ({ ...current, location }))
  }), [preferences]);

  return (
    <PepoExperienceContext.Provider value={value}>
      {children}
    </PepoExperienceContext.Provider>
  );
}

export function usePepoExperience() {
  const value = useContext(PepoExperienceContext);
  if (!value) throw new Error("usePepoExperience must be used inside PepoExperienceProvider");
  return value;
}
