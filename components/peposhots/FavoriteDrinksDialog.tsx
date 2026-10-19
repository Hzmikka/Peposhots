"use client";

import { useId, type RefObject } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { drinks } from "@/data/drinks";

export function FavoriteDrinksDialog({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const { t } = useI18n();
  const titleId = useId();
  const { preferences, setFavoriteDrinks } = usePepoExperience();
  const selected = drinks.filter((drink) => preferences.favoriteDrinks?.includes(drink.id));
  return <dialog ref={dialogRef} className="selection-dialog" aria-labelledby={titleId} onClick={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) event.currentTarget.close();
  }}>
    <header className="selection-dialog-header"><h2 id={titleId}>{t("Tus cócteles seleccionados")}</h2><button type="button" className="dialog-close" aria-label={t("Cerrar")} onClick={() => dialogRef.current?.close()}>×</button></header>
    {selected.length ? <ul>{selected.map((drink) => <li key={drink.id}><span>{drink.name}</span><button type="button" aria-label={t("Quitar {name}", { name: drink.name })} onClick={() => setFavoriteDrinks((items) => items.filter((id) => id !== drink.id))}>{t("Quitar")}</button></li>)}</ul> : <p>{t("Todavía no has elegido cócteles.")}</p>}
  </dialog>;
}
