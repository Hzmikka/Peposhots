// Keep aligned with the named container queries in app/responsive.css.
// Width means available CSS pixels, never physical panel resolution or brand.
export const TABLET_MIN_WIDTH = 600;
export const DESKTOP_MIN_WIDTH = 1024;

export function getLayoutMode(width: number) {
  return width < TABLET_MIN_WIDTH ? "Móvil" : width < DESKTOP_MIN_WIDTH ? "Tablet" : "PC";
}
