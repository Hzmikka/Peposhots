"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./CocktailTextures.module.css";
import { useBookingQuiz } from "@/context/BookingQuizContext";

type Cocktail = {
  name: string;
  description: string;
  meta: string;
  image: string;
  accent: string;
};

const cocktails: Cocktail[] = [
  {
    name: "Mojito",
    description: "Ron blanco, lima fresca, menta, azúcar de caña y soda.",
    meta: "Fresco · herbal · burbujeante",
    image: "/cocktails/mojito.png",
    accent: "#9edb69",
  },
  {
    name: "Piña Colada",
    description: "Ron, piña y crema de coco en una textura tropical y sedosa.",
    meta: "Cremosa · tropical · frozen",
    image: "/cocktails/pina-colada.png",
    accent: "#f4c24f",
  },
  {
    name: "Margarita",
    description: "Tequila, licor de naranja y lima fresca con un final salino.",
    meta: "Cítrica · limpia · vibrante",
    image: "/cocktails/margarita.png",
    accent: "#cde46a",
  },
  {
    name: "Old Fashioned",
    description: "Bourbon, bitters y azúcar terminado con aceites de naranja.",
    meta: "Cálido · intenso · clásico",
    image: "/cocktails/old-fashioned.png",
    accent: "#d77b3e",
  },
  {
    name: "Sex on the Beach",
    description: "Vodka, durazno, naranja y cranberry en una mezcla frutal.",
    meta: "Frutal · colorido · refrescante",
    image: "/cocktails/sex-on-the-beach.png",
    accent: "#f07864",
  },
  {
    name: "Screwdriver",
    description: "Vodka y jugo de naranja: frío, brillante y directo.",
    meta: "Jugoso · simple · refrescante",
    image: "/cocktails/screwdriver.png",
    accent: "#f3a321",
  },
  {
    name: "Daiquiri",
    description: "Ron blanco, lima y azúcar en un clásico elegante.",
    meta: "Limpio · ácido · sedoso",
    image: "/cocktails/daiquiri.png",
    accent: "#d7e69a",
  },
];

export function CocktailTextures() {
  const { openBookingQuizAt } = useBookingQuiz();
  const [active, setActive] = useState(0);
  const current = useMemo(() => cocktails[active], [active]);

  const selectCocktail = () => {
    window.sessionStorage.setItem("peposhots-selected-cocktails", JSON.stringify([{ id: current.name.toLowerCase().replaceAll(" ", "-"), name: current.name }]));
    openBookingQuizAt(4);
  };

  return (
    <section className={styles.section} id="cocktails" aria-labelledby="cocktail-textures-title">
      <div className={styles.inner}>
        <header className={styles.topline}>
          <div>
            <p className={styles.eyebrow}>CÓCTELES PEPOSHOTS</p>
            <h2 id="cocktail-textures-title">Texturas signature</h2>
          </div>
          <p className={styles.hint}>Pasa el cursor o toca un cóctel para descubrir su carácter.</p>
        </header>

        <div className={styles.railShell}>
          <Image className={`${styles.leaf} ${styles.leafLowerLeft}`} src="/hojas/hoja3.png" alt="" width={170} height={170} aria-hidden="true" />
          <Image className={`${styles.leaf} ${styles.leafLowerRight}`} src="/hojas/hoja4.png" alt="" width={190} height={190} aria-hidden="true" />
          <div className={styles.rail}>
            {cocktails.map((cocktail, index) => {
              const isActive = index === active;
              return (
                <button
                  key={cocktail.name}
                  className={`${styles.card} ${isActive ? styles.active : ""}`}
                  style={{ "--accent": cocktail.accent } as React.CSSProperties}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  aria-label={`Mostrar ${cocktail.name}`}
                >
                  <Image
                    src={cocktail.image}
                    alt={`Textura macro del cóctel ${cocktail.name}`}
                    fill
                    sizes="(max-width: 700px) 48vw, 24vw"
                    className={styles.image}
                  />
                  <span className={styles.scrim} />
                  <span className={styles.verticalName}>{cocktail.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span style={{ width: `${((active + 1) / cocktails.length) * 100}%` }} />
        </div>

        <article className={styles.detail} style={{ "--accent": current.accent } as React.CSSProperties}>
          <div>
            <div className={styles.nameRow}>
              <h3>{current.name}</h3>
            </div>
            <p className={styles.description}>{current.description}</p>
            <p className={styles.meta}>{current.meta}</p>
          </div>
          <button className={styles.cta} type="button" onClick={selectCocktail}>
            <span aria-hidden="true">＋</span>
            Añadir a selección
          </button>
        </article>
      </div>
    </section>
  );
}
