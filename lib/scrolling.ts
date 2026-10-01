export function getScrollContainer(element: Element | null): HTMLElement | null {
  return element?.closest<HTMLElement>('[data-scroll-container="true"]') ?? null;
}

export function getScrollTop(container: HTMLElement | null) {
  return container ? container.scrollTop : window.scrollY;
}

export function getViewportHeight(container: HTMLElement | null) {
  return container ? container.clientHeight : window.innerHeight;
}

export function getScrollHeight(container: HTMLElement | null) {
  return container ? container.scrollHeight : document.documentElement.scrollHeight;
}

export function getElementTop(element: HTMLElement, container: HTMLElement | null) {
  if (container) {
    const rootRect = container.getBoundingClientRect();
    return element.getBoundingClientRect().top - rootRect.top + container.scrollTop;
  }
  return element.getBoundingClientRect().top + window.scrollY;
}

export function setScrollTop(container: HTMLElement | null, top: number) {
  if (container) container.scrollTop = top;
  else window.scrollTo(0, top);
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
