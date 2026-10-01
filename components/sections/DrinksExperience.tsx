"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Container } from "@/components/ui/Container";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { drinks } from "@/data/drinks";

type DrinkDrag = {
  id: (typeof drinks)[number]["id"];
  image: string;
  rect: { left: number; top: number; width: number; height: number };
  x: number;
  y: number;
  scale: number;
  phase: "dragging" | "settling";
};

const trayLayouts = [
  [{ x: 50, bottom: 21, width: 37, rotate: 0, z: 2 }],
  [
    { x: 40, bottom: 20, width: 33, rotate: -4, z: 2 },
    { x: 61, bottom: 20, width: 33, rotate: 4, z: 3 },
  ],
  [
    { x: 50, bottom: 29, width: 29, rotate: 0, z: 1 },
    { x: 38, bottom: 18, width: 32, rotate: -4, z: 3 },
    { x: 63, bottom: 18, width: 32, rotate: 4, z: 4 },
  ],
  [
    { x: 31, bottom: 18, width: 27, rotate: -6, z: 2 },
    { x: 44, bottom: 22, width: 28, rotate: -2, z: 3 },
    { x: 57, bottom: 22, width: 28, rotate: 2, z: 4 },
    { x: 70, bottom: 18, width: 27, rotate: 6, z: 5 },
  ],
] as const;

export function DrinksExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [drinkDrag, setDrinkDrag] = useState<DrinkDrag | null>(null);
  const [trayReady, setTrayReady] = useState(false);
  const swipeStart = useRef<number | null>(null);
  const drinkPointerStart = useRef<{ x: number; y: number } | null>(null);
  const drinkSourceRef = useRef<Pick<DrinkDrag, "id" | "image" | "rect"> | null>(null);
  const drinkDragRef = useRef<DrinkDrag | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const trayItemsRef = useRef<HTMLDivElement>(null);
  const trayReadyRef = useRef(false);
  const { preferences, setExploredDrink, setFavoriteDrinks } = usePepoExperience();
  const favoriteCocktails = preferences.favoriteDrinks ?? [];
  const active = drinks[activeIndex];

  function select(index: number) {
    const normalized = (index + drinks.length) % drinks.length;
    setActiveIndex(normalized);
    setExploredDrink(drinks[normalized].id);
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    swipeStart.current = event.clientX;
    setDragOffset(0);
    const drinkElement = event.target instanceof Element ? event.target.closest<HTMLElement>(".cocktail-hero-glass") : null;
    if (drinkElement) {
      const rect = drinkElement.getBoundingClientRect();
      drinkPointerStart.current = { x: event.clientX, y: event.clientY };
      drinkSourceRef.current = {
        id: active.id,
        image: active.drinkImage,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      };
    } else {
      drinkPointerStart.current = null;
      drinkSourceRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function updateSwipe(event: PointerEvent<HTMLDivElement>) {
    const drinkStart = drinkPointerStart.current;
    const source = drinkSourceRef.current;
    if (drinkStart && source && !drinkDragRef.current) {
      const dx = event.clientX - drinkStart.x;
      const dy = event.clientY - drinkStart.y;
      if (dy > 10 && dy > Math.abs(dx)) {
        swipeStart.current = null;
        setDragOffset(0);
        setDrag({ ...source, x: 0, y: 0, scale: 1.04, phase: "dragging" });
      } else if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        drinkPointerStart.current = null;
        drinkSourceRef.current = null;
      }
    }
    if (drinkDragRef.current) {
      moveDrinkDrag(event);
      return;
    }
    if (swipeStart.current === null) return;
    setDragOffset(Math.max(-72, Math.min(72, event.clientX - swipeStart.current)));
  }

  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    if (drinkDragRef.current) {
      finishDrinkDrag(event);
      drinkSourceRef.current = null;
      return;
    }

    const drinkStart = drinkPointerStart.current;
    const drinkSource = drinkSourceRef.current;
    const tappedDrink = Boolean(
      drinkStart
      && drinkSource
      && Math.hypot(event.clientX - drinkStart.x, event.clientY - drinkStart.y) < 10
    );

    drinkPointerStart.current = null;
    drinkSourceRef.current = null;

    if (tappedDrink && drinkSource && !favoriteCocktails.includes(drinkSource.id)) {
      swipeStart.current = null;
      setDragOffset(0);
      setFavoriteDrinks((items) => items.includes(drinkSource.id) ? items : [...items, drinkSource.id]);
      return;
    }

    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    setDragOffset(0);
    if (Math.abs(distance) >= 38) select(activeIndex + (distance < 0 ? 1 : -1));
  }

  function setDrag(next: DrinkDrag | null) {
    drinkDragRef.current = next;
    setDrinkDrag(next);
  }

  function moveDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drinkDragRef.current;
    const start = drinkPointerStart.current;
    const tray = trayRef.current;
    if (!current || !start || current.phase !== "dragging") return;
    event.stopPropagation();

    const horizontalLimit = Math.max(42, (tray?.getBoundingClientRect().width ?? current.rect.width) * 0.48);
    const x = Math.max(-horizontalLimit, Math.min(horizontalLimit, event.clientX - start.x));
    const y = Math.max(-24, event.clientY - start.y);
    const centerX = current.rect.left + current.rect.width / 2 + x;
    const centerY = current.rect.top + current.rect.height / 2 + y;
    const trayRect = tray?.getBoundingClientRect();
    const isInside = Boolean(
      trayRect
      && centerX >= trayRect.left + trayRect.width * 0.08
      && centerX <= trayRect.right - trayRect.width * 0.08
      && centerY >= trayRect.top + trayRect.height * 0.12
      && centerY <= trayRect.bottom - trayRect.height * 0.08
    );

    trayReadyRef.current = isInside;
    setTrayReady(isInside);
    setDrag({ ...current, x, y });
  }

  function finishDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drinkDragRef.current;
    const start = drinkPointerStart.current;
    if (!current || !start) return;
    event.stopPropagation();
    drinkPointerStart.current = null;

    const shouldAdd = trayReadyRef.current;
    const alreadyAdded = favoriteCocktails.includes(current.id);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldAdd && !alreadyAdded && trayItemsRef.current) {
      const nextCount = Math.min(4, favoriteCocktails.length + 1);
      const placement = trayLayouts[nextCount - 1][Math.min(nextCount - 1, 3)];
      const trayRect = trayItemsRef.current.getBoundingClientRect();
      const targetWidth = trayRect.width * placement.width / 100;
      const targetHeight = current.rect.height * (targetWidth / current.rect.width);
      const targetCenterX = trayRect.left + trayRect.width * placement.x / 100;
      const targetCenterY = trayRect.bottom - trayRect.height * placement.bottom / 100 - targetHeight / 2;
      const x = targetCenterX - (current.rect.left + current.rect.width / 2);
      const y = targetCenterY - (current.rect.top + current.rect.height / 2);
      const settled = { ...current, x, y, scale: targetWidth / current.rect.width, phase: "settling" as const };

      trayReadyRef.current = false;
      setTrayReady(false);
      setDrag(settled);
      const complete = () => {
        setFavoriteDrinks((items) => items.includes(current.id) ? items : [...items, current.id]);
        setDrag(null);
      };
      if (reducedMotion) complete();
      else window.setTimeout(complete, 320);
      return;
    }

    trayReadyRef.current = false;
    setTrayReady(false);
    const returning = { ...current, x: 0, y: 0, scale: 1, phase: "settling" as const };
    setDrag(returning);
    if (reducedMotion) setDrag(null);
    else window.setTimeout(() => setDrag(null), 300);
  }

  function cancelDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drinkDragRef.current;
    if (!current) return;
    event.stopPropagation();
    drinkPointerStart.current = null;
    trayReadyRef.current = false;
    setTrayReady(false);
    setDrag({ ...current, x: 0, y: 0, scale: 1, phase: "settling" });
    window.setTimeout(() => setDrag(null), 300);
  }

  function cancelGesture(event: PointerEvent<HTMLDivElement>) {
    swipeStart.current = null;
    drinkPointerStart.current = null;
    drinkSourceRef.current = null;
    setDragOffset(0);
    if (drinkDragRef.current) cancelDrinkDrag(event);
  }

  return (
    <section className="section section-drinks" id="drinks">
      <Container>
        <div
          className="cocktail-editorial-carousel"
          onPointerDown={startSwipe}
          onPointerMove={updateSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={cancelGesture}
        >
          <article
            key={active.id}
            className="cocktail-editorial-card"
            aria-live="polite"
            style={{ transform: `translateX(${dragOffset}px)` }}
          >
            <header className="cocktail-card-header">
              <h3>{active.name}</h3>
              <p className="cocktail-ingredients">{active.notes.join(" · ")}</p>
              <p className="cocktail-descriptor">{active.line}</p>
            </header>

            <div className="cocktail-card-stage">
              <div
                className={`cocktail-hero-glass ${drinkDrag?.id === active.id ? "is-drag-source" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Añadir ${active.name || "este cóctel"} a favoritos`}
                onKeyDown={(event) => {
                  if ((event.key === "Enter" || event.key === " ") && !favoriteCocktails.includes(active.id)) {
                    event.preventDefault();
                    setFavoriteDrinks((items) => [...items, active.id]);
                  }
                }}
              >
                <Image
                  src={active.drinkImage}
                  alt={active.name ? `${active.name}, cóctel servido por PepoShots` : "Cóctel servido por PepoShots"}
                  fill
                  sizes="220px"
                  draggable={false}
                  priority={activeIndex === 0}
                />
              </div>
              <div className="cocktail-card-texture">
                <Image
                  src={active.textureImage}
                  alt={`Textura de ${active.name}`}
                  fill
                  sizes="350px"
                  draggable={false}
                />
              </div>
            </div>
          </article>
        </div>

        <nav className="cocktail-card-nav" aria-label="Navegación de cócteles">
          <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Cóctel anterior">←</button>
          <div className="cocktail-card-progress">
            {drinks.map((drink, index) => (
              <button
                key={drink.id}
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => select(index)}
                aria-label={drink.name ? `Mostrar ${drink.name}` : `Mostrar trago ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(drinks.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Siguiente cóctel">→</button>
        </nav>

        <header className="cocktail-section-intro tray-prompt">
          <p className="kicker">ARRASTRA TUS FAVORITOS</p>
        </header>

        <div ref={trayRef} className={`drinks-tray ${trayReady ? "is-ready" : ""}`}>
          <Image
            src="/images/peposhots/drinks/bandeja-1.webp"
            alt=""
            width={1024}
            height={576}
            sizes="(max-width: 400px) 100vw, 400px"
          />
          <div ref={trayItemsRef} className="drinks-tray-items" aria-label="Cócteles favoritos">
            {favoriteCocktails.slice(0, 4).map((id, index) => {
              const drink = drinks.find((item) => item.id === id);
              const visibleCount = Math.min(4, favoriteCocktails.length);
              const placement = trayLayouts[visibleCount - 1][index];
              if (!drink || !placement) return null;
              return (
                <span
                  className="tray-drink"
                  key={id}
                  style={{
                    left: `${placement.x}%`,
                    bottom: `${placement.bottom}%`,
                    width: `${placement.width}%`,
                    zIndex: placement.z,
                    transform: `translateX(-50%) rotate(${placement.rotate}deg)`,
                  }}
                >
                  <Image src={drink.drinkImage} alt={drink.name || "Cóctel favorito"} fill sizes="150px" />
                </span>
              );
            })}
            {favoriteCocktails.length > 4 ? <span className="tray-more">+{favoriteCocktails.length - 4}</span> : null}
          </div>
        </div>
      </Container>
      {drinkDrag && typeof document !== "undefined" ? createPortal(
        <div
          className={`drink-drag-ghost ${drinkDrag.phase === "settling" ? "is-settling" : ""}`}
          style={{
            left: drinkDrag.rect.left,
            top: drinkDrag.rect.top,
            width: drinkDrag.rect.width,
            height: drinkDrag.rect.height,
            transform: `translate3d(${drinkDrag.x}px, ${drinkDrag.y}px, 0) scale(${drinkDrag.scale})`,
          }}
          aria-hidden="true"
        >
          <Image src={drinkDrag.image} alt="" fill sizes={`${Math.ceil(drinkDrag.rect.width)}px`} />
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
