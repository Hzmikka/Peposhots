export function getScrollContainer(element: Element | null): HTMLElement | null {
  return element?.closest<HTMLElement>('[data-scroll-container="true"]') ?? null;
}

export function getScrollTop(container: HTMLElement | null) {
  return container ? container.scrollTop : window.scrollY;
}

export function getViewportHeight(container: HTMLElement | null) {
  return container ? container.clientHeight : (window.visualViewport?.height ?? window.innerHeight);
}

// DOMRects use screen pixels; the portfolio's scroll root is scaled with CSS.
export function getScrollScale(container: HTMLElement | null) {
  return container ? container.getBoundingClientRect().height / container.clientHeight || 1 : 1;
}

export function getVisibleBounds(container: HTMLElement | null) {
  const viewport = window.visualViewport;
  const top = viewport?.offsetTop ?? 0;
  const bottom = top + (viewport?.height ?? window.innerHeight);
  const rect = container?.getBoundingClientRect();
  return { top: Math.max(top, rect?.top ?? top), bottom: Math.min(bottom, rect?.bottom ?? bottom) };
}

export function getScrollHeight(container: HTMLElement | null) {
  return container ? container.scrollHeight : document.documentElement.scrollHeight;
}

export function getElementTop(element: HTMLElement, container: HTMLElement | null) {
  if (container) {
    const rootRect = container.getBoundingClientRect();
    return (element.getBoundingClientRect().top - rootRect.top) / getScrollScale(container) + container.scrollTop;
  }
  return element.getBoundingClientRect().top + window.scrollY;
}

export function setScrollTop(container: HTMLElement | null, top: number) {
  // A requestAnimationFrame tween must not start another CSS smooth scroll each frame.
  if (container) container.scrollTo({ top, behavior: "instant" });
  else window.scrollTo({ top, behavior: "instant" });
}

export function scrollToPosition(container: HTMLElement | null, top: number, behavior: ScrollBehavior) {
  if (container) container.scrollTo({ top, behavior });
  else window.scrollTo({ top, behavior });
}

export function addScrollListener(container: HTMLElement | null, listener: EventListenerOrEventListenerObject) {
  const target: EventTarget = container ?? window;
  target.addEventListener("scroll", listener, { passive: true });
  return () => target.removeEventListener("scroll", listener);
}

export function animateScrollTo(container: HTMLElement | null, target: number) {
  const start = getScrollTop(container);
  const distance = target - start;
  const duration = Math.min(1050, Math.max(500, Math.abs(distance) * 0.65));
  const startedAt = performance.now();
  let frame = 0;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cancel = () => {
    window.cancelAnimationFrame(frame);
    for (const type of ["pointerdown", "wheel", "keydown", "resize"]) window.removeEventListener(type, cancel);
    motion.removeEventListener("change", cancel);
  };
  if (motion.matches) {
    setScrollTop(container, target);
    return cancel;
  }
  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    setScrollTop(container, start + distance * eased);
    if (progress < 1) frame = window.requestAnimationFrame(step);
    else cancel();
  };
  for (const type of ["pointerdown", "wheel", "keydown", "resize"]) window.addEventListener(type, cancel, { passive: true });
  motion.addEventListener("change", cancel);
  frame = window.requestAnimationFrame(step);
  return cancel;
}
