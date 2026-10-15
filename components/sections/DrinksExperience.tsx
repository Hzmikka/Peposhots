"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Container } from "@/components/ui/Container";
import { usePepoExperience } from "@/components/peposhots/PepoExperienceContext";
import { drinks } from "@/data/drinks";
import { getScrollContainer, getScrollScale, getScrollTop, getVisibleBounds, setScrollTop } from "@/lib/scrolling";

type DrinkDrag = {
  id: (typeof drinks)[number]["id"];
  image: string;
  rect: { left: number; top: number; width: number; height: number };
  x: number;
  y: number;
  scale: number;
  rotate?: number;
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
  const [removingDrinkId, setRemovingDrinkId] = useState<string | null>(null);
  const lastTrayTap = useRef<{ id: string; time: number } | null>(null);
  const swipeStart = useRef<number | null>(null);
  const swipeStartY = useRef(0);
  const swipeHorizontal = useRef(false);
  const drinkPointerStart = useRef<{ x: number; y: number } | null>(null);
  const drinkSourceRef = useRef<Pick<DrinkDrag, "id" | "image" | "rect"> | null>(null);
  const drinkDragRef = useRef<DrinkDrag | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trayItemsRef = useRef<HTMLDivElement>(null);
  const trayReadyRef = useRef(false);
  const renderFrame = useRef(0);
  const scrollFrame = useRef(0);
  const settleTimer = useRef(0);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const scrollRoot = useRef<HTMLElement | null>(null);
  const { preferences, setExploredDrink, setFavoriteDrinks } = usePepoExperience();
  const favoriteCocktails = preferences.favoriteDrinks ?? [];
  const active = drinks[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    const carousel = section?.querySelector<HTMLElement>(".cocktail-editorial-carousel");
    if (!section || !carousel || typeof IntersectionObserver === "undefined") return;
    const root = getScrollContainer(section);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || carousel.getBoundingClientRect().top < getVisibleBounds(root).bottom) return;
    // Play the first entrance when it can be seen, rather than during the initial page load.
    section.dataset.entrancePending = "true";
    const reveal = () => { delete section.dataset.entrancePending; observer.disconnect(); };
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) reveal(); }, { root, threshold: 0.12 });
    observer.observe(carousel);
    motion.addEventListener("change", reveal);
    return () => { observer.disconnect(); motion.removeEventListener("change", reveal); };
  }, []);

  useEffect(() => {
    const reset = () => {
      window.clearTimeout(settleTimer.current);
      window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = 0;
      swipeStart.current = null;
      drinkPointerStart.current = null;
      drinkSourceRef.current = null;
      drinkDragRef.current = null;
      trayReadyRef.current = false;
      window.cancelAnimationFrame(renderFrame.current);
      renderFrame.current = window.requestAnimationFrame(() => {
        renderFrame.current = 0;
        setDrinkDrag(null);
        setTrayReady(false);
        setDragOffset(0);
      });
    };
    window.addEventListener("resize", reset);
    window.visualViewport?.addEventListener("resize", reset);
    return () => {
      window.removeEventListener("resize", reset);
      window.visualViewport?.removeEventListener("resize", reset);
      window.clearTimeout(settleTimer.current);
      window.cancelAnimationFrame(scrollFrame.current);
      window.cancelAnimationFrame(renderFrame.current);
    };
  }, []);

  function showTrayDrinkOptions(id: string, clickDetail: number) {
    const time = performance.now();
    const previousTap = lastTrayTap.current;
    // Touch clicks don't reliably report a double-click count across browsers.
    if (clickDetail === 0 || clickDetail >= 2 || (previousTap?.id === id && time - previousTap.time <= 450)) {
      setRemovingDrinkId(id);
      lastTrayTap.current = null;
      return;
    }
    lastTrayTap.current = { id, time };
    if (removingDrinkId !== id) setRemovingDrinkId(null);
  }

  function removeTrayDrink(id: string) {
    setFavoriteDrinks((items) => items.filter((item) => item !== id));
    setRemovingDrinkId(null);
    lastTrayTap.current = null;
  }

  function select(index: number) {
    if (drinkDragRef.current) return;
    const normalized = (index + drinks.length) % drinks.length;
    setActiveIndex(normalized);
    setExploredDrink(drinks[normalized].id);
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || drinkDragRef.current) return;
    scrollRoot.current = getScrollContainer(event.currentTarget);
    swipeStart.current = event.clientX;
    swipeStartY.current = event.clientY;
    swipeHorizontal.current = false;
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
        event.currentTarget.setPointerCapture(event.pointerId);
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
    const dx = event.clientX - swipeStart.current;
    const dy = event.clientY - swipeStartY.current;
    if (!swipeHorizontal.current) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      if (Math.abs(dy) >= Math.abs(dx)) { swipeStart.current = null; return; }
      swipeHorizontal.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const limit = event.currentTarget.clientWidth * 0.23;
    setDragOffset(Math.max(-limit, Math.min(limit, dx / getScrollScale(scrollRoot.current))));
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
      setDrag({ ...drinkSource, x: 0, y: 0, scale: 1, phase: "dragging" });
      drinkPointerStart.current = { x: event.clientX, y: event.clientY };
      trayReadyRef.current = true;
      finishDrinkDrag(event);
      return;
    }

    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    setDragOffset(0);
    const threshold = Math.max(30, Math.min(60, event.currentTarget.getBoundingClientRect().width * 0.14));
    if (swipeHorizontal.current && Math.abs(distance) >= threshold) select(activeIndex + (distance < 0 ? 1 : -1));
  }

  function setDrag(next: DrinkDrag | null) {
    drinkDragRef.current = next;
    if (!renderFrame.current) renderFrame.current = window.requestAnimationFrame(() => {
      renderFrame.current = 0;
      setDrinkDrag(drinkDragRef.current);
      setTrayReady(trayReadyRef.current);
    });
  }

  function moveDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    lastPointer.current = { x: event.clientX, y: event.clientY };
    event.stopPropagation();
    updateDragPosition();
    if (!scrollFrame.current) scrollFrame.current = window.requestAnimationFrame(autoScroll);
  }

  function autoScroll() {
    scrollFrame.current = 0;
    if (drinkDragRef.current?.phase !== "dragging" || !lastPointer.current) return;
    const bounds = getVisibleBounds(scrollRoot.current);
    const edge = Math.min(80, (bounds.bottom - bounds.top) * 0.18);
    const y = lastPointer.current.y;
    const speed = y > bounds.bottom - edge ? Math.min(16, (y - bounds.bottom + edge) * 0.25)
      : y < bounds.top + edge ? -Math.min(16, (bounds.top + edge - y) * 0.25) : 0;
    if (speed) setScrollTop(scrollRoot.current, getScrollTop(scrollRoot.current) + speed / getScrollScale(scrollRoot.current));
    updateDragPosition();
    scrollFrame.current = window.requestAnimationFrame(autoScroll);
  }

  function updateDragPosition() {
    const current = drinkDragRef.current;
    const start = drinkPointerStart.current;
    const pointer = lastPointer.current;
    const tray = trayRef.current;
    if (!current || !start || !pointer || current.phase !== "dragging") return;

    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft ?? 0;
    const right = left + (viewport?.width ?? window.innerWidth);
    const bounds = getVisibleBounds(scrollRoot.current);
    const x = Math.max(left - current.rect.left - current.rect.width / 2 + 20,
      Math.min(right - current.rect.left - current.rect.width / 2 - 20, pointer.x - start.x));
    const y = Math.max(bounds.top - current.rect.top - current.rect.height / 2 + 20,
      Math.min(bounds.bottom - current.rect.top - current.rect.height / 2 - 20, pointer.y - start.y));
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
    setDrag({ ...current, x, y });
  }

  function finishDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drinkDragRef.current;
    const start = drinkPointerStart.current;
    if (!current || !start) return;
    window.cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = 0;
    swipeStart.current = null;
    event.stopPropagation();
    drinkPointerStart.current = null;

    const shouldAdd = trayReadyRef.current;
    const alreadyAdded = favoriteCocktails.includes(current.id);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldAdd && !alreadyAdded && trayItemsRef.current && favoriteCocktails.length < 4) {
      const nextCount = Math.min(4, favoriteCocktails.length + 1);
      const placement = trayLayouts[nextCount - 1][Math.min(nextCount - 1, 3)];
      const trayRect = trayItemsRef.current.getBoundingClientRect();
      const targetWidth = trayRect.width * placement.width / 100;
      const image = document.querySelector<HTMLImageElement>(".cocktail-hero-glass img");
      const ratio = image && image.naturalHeight ? image.naturalWidth / image.naturalHeight : current.rect.width / current.rect.height;
      const sourceHeight = Math.min(current.rect.height, current.rect.width / ratio);
      const targetHeight = Math.min(trayRect.height * 0.68, targetWidth / ratio);
      const angle = placement.rotate * Math.PI / 180;
      const targetCenterX = trayRect.left + trayRect.width * placement.x / 100 + Math.sin(angle) * targetHeight / 2;
      const targetCenterY = trayRect.bottom - trayRect.height * placement.bottom / 100 - Math.cos(angle) * targetHeight / 2;
      const x = targetCenterX - (current.rect.left + current.rect.width / 2);
      const y = targetCenterY - (current.rect.top + current.rect.height / 2);
      const settled = { ...current, x, y, scale: targetHeight / sourceHeight, rotate: placement.rotate, phase: "settling" as const };

      trayReadyRef.current = false;
      setTrayReady(false);
      const complete = () => {
        setFavoriteDrinks((items) => items.includes(current.id) ? items : [...items, current.id]);
        setDrag(null);
      };
      if (reducedMotion) complete();
      else {
        // Give a tapped glass its starting frame before beginning the landing transition.
        setDrag({ ...current, phase: "settling" });
        window.cancelAnimationFrame(renderFrame.current);
        setDrinkDrag({ ...current, phase: "settling" });
        renderFrame.current = window.requestAnimationFrame(() => {
          renderFrame.current = window.requestAnimationFrame(() => {
            renderFrame.current = 0;
            setDrag(settled);
            settleTimer.current = window.setTimeout(complete, 340);
          });
        });
      }
      return;
    }

    // Additional favorites remain selectable and removable in the chip list.
    // Never animate a fifth glass onto the already occupied fourth tray slot.
    if (shouldAdd && !alreadyAdded) {
      setFavoriteDrinks((items) => items.includes(current.id) ? items : [...items, current.id]);
      trayReadyRef.current = false;
      setTrayReady(false);
      setDrag(null);
      return;
    }

    trayReadyRef.current = false;
    setTrayReady(false);
    const sourceRect = document.querySelector(".cocktail-hero-glass")?.getBoundingClientRect() ?? current.rect;
    const returning = { ...current, x: sourceRect.left + sourceRect.width / 2 - current.rect.left - current.rect.width / 2,
      y: sourceRect.top + sourceRect.height / 2 - current.rect.top - current.rect.height / 2,
      scale: sourceRect.width / current.rect.width, phase: "settling" as const };
    setDrag(returning);
    if (reducedMotion) setDrag(null);
    else settleTimer.current = window.setTimeout(() => setDrag(null), 340);
  }

  function cancelDrinkDrag(event: PointerEvent<HTMLDivElement>) {
    const current = drinkDragRef.current;
    if (!current) return;
    if (current.phase === "settling") return;
    window.cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = 0;
    event.stopPropagation();
    drinkPointerStart.current = null;
    trayReadyRef.current = false;
    setTrayReady(false);
    setDrag({ ...current, x: 0, y: 0, scale: 1, phase: "settling" });
    settleTimer.current = window.setTimeout(() => setDrag(null), 340);
  }

  function cancelGesture(event: PointerEvent<HTMLDivElement>) {
    swipeStart.current = null;
    drinkPointerStart.current = null;
    drinkSourceRef.current = null;
    setDragOffset(0);
    if (drinkDragRef.current) cancelDrinkDrag(event);
  }

  return (
    <section
      ref={sectionRef}
      className="section section-drinks"
      id="drinks"
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && !event.target.closest(".tray-drink")) {
          setRemovingDrinkId(null);
          lastTrayTap.current = null;
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setRemovingDrinkId(null);
          lastTrayTap.current = null;
        }
      }}
    >
      <Container>
        <div
          className="cocktail-editorial-carousel"
          onPointerDown={startSwipe}
          onPointerMove={updateSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={cancelGesture}
          onLostPointerCapture={(event) => {
            // Touch starts with implicit capture on the glass. Transferring it to the
            // carousel must not cancel the gesture when the child's capture is lost.
            if (event.target === event.currentTarget) cancelGesture(event);
          }}
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
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setFavoriteDrinks((items) => items.includes(active.id) ? items : [...items, active.id]);
                  }
                }}
              >
                <Image
                  src={active.drinkImage}
                  alt={active.name ? `${active.name}, cóctel servido por PepoShots` : "Cóctel servido por PepoShots"}
                  fill
                  sizes="220px"
                  draggable={false}
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
          <p className="kicker">TOCA O ARRASTRA TUS FAVORITOS</p>
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
                    zIndex: removingDrinkId === id ? 10 : placement.z,
                    transform: `translateX(-50%) rotate(${placement.rotate}deg)`,
                  }}
                >
                  <Image src={drink.drinkImage} alt={drink.name || "Cóctel favorito"} fill sizes="150px" draggable={false} />
                  <button
                    type="button"
                    className="tray-drink-select"
                    aria-label={`Mostrar botón para quitar ${drink.name || "este cóctel"}`}
                    aria-expanded={removingDrinkId === id}
                    title="Toca dos veces para mostrar el botón de quitar"
                    onClick={(event) => showTrayDrinkOptions(id, event.detail)}
                  />
                  {removingDrinkId === id ? (
                    <button
                      type="button"
                      className="tray-drink-remove"
                      aria-label={`Quitar ${drink.name || "este cóctel"} de favoritos`}
                      onClick={() => removeTrayDrink(id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  ) : null}
                </span>
              );
            })}
            {favoriteCocktails.length > 4 ? <span className="tray-more">+{favoriteCocktails.length - 4}</span> : null}
          </div>
        </div>
        {favoriteCocktails.length > 0 ? (
          <div className="selected-drinks-list" aria-label="Cócteles seleccionados" aria-live="polite">
            <span>Tus cócteles · {favoriteCocktails.length}</span>
            <div className="selected-drinks-chips">
              {favoriteCocktails.map((id) => {
                const drink = drinks.find((item) => item.id === id);
                return drink ? (
                  <button key={id} type="button" onClick={() => removeTrayDrink(id)} aria-label={`Quitar ${drink.name} de favoritos`}>
                    {drink.name} <span aria-hidden="true">×</span>
                  </button>
                ) : null;
              })}
            </div>
          </div>
        ) : null}
      </Container>
      {drinkDrag && typeof document !== "undefined" ? createPortal(
        <div
          className={`drink-drag-ghost ${drinkDrag.phase === "settling" ? "is-settling" : ""}`}
          style={{
            left: drinkDrag.rect.left,
            top: drinkDrag.rect.top,
            width: drinkDrag.rect.width,
            height: drinkDrag.rect.height,
            transform: `translate3d(${drinkDrag.x}px, ${drinkDrag.y}px, 0) rotate(${drinkDrag.rotate ?? 0}deg) scale(${drinkDrag.scale})`,
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
