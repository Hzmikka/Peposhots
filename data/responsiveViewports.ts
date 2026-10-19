export type ReviewViewport = {
  id: string;
  label: string;
  width: number;
  height: number;
  group: "Móviles" | "Tablets" | "Computadoras" | "Límites de diseño";
};

// CSS viewport references, not physical panel pixels. Actual browser settings
// and browser chrome can change these dimensions. Sources: RESPONSIVE_REVIEW.md.
export const responsiveViewports: ReviewViewport[] = [
  { id: "small", label: "Pantalla pequeña", width: 320, height: 658, group: "Móviles" },
  { id: "folded", label: "Plegable cerrado", width: 344, height: 882, group: "Móviles" },
  { id: "s24", label: "Samsung Galaxy S24", width: 360, height: 780, group: "Móviles" },
  { id: "se", label: "iPhone SE", width: 375, height: 667, group: "Móviles" },
  { id: "iphone12", label: "iPhone 12 / 13 / 14", width: 390, height: 844, group: "Móviles" },
  { id: "iphone15", label: "iPhone 15 / 16", width: 393, height: 852, group: "Móviles" },
  { id: "iphonepro", label: "iPhone Pro · referencia", width: 402, height: 874, group: "Móviles" },
  { id: "androidwide", label: "Android ancho · referencia", width: 412, height: 915, group: "Móviles" },
  { id: "promax", label: "iPhone 14 Pro Max", width: 430, height: 932, group: "Móviles" },
  { id: "largemobile", label: "iPhone grande · referencia", width: 440, height: 956, group: "Móviles" },
  { id: "a55", label: "Samsung Galaxy A55", width: 480, height: 1040, group: "Móviles" },
  { id: "tabletcompact", label: "Tablet compacta", width: 600, height: 960, group: "Tablets" },
  { id: "tabs9", label: "Samsung Galaxy Tab S9", width: 640, height: 1024, group: "Tablets" },
  { id: "mini", label: "iPad Mini · referencia", width: 768, height: 1024, group: "Tablets" },
  { id: "tablet820", label: "Tablet de 820 px", width: 820, height: 1180, group: "Tablets" },
  { id: "tablet834", label: "Tablet de 834 px", width: 834, height: 1194, group: "Tablets" },
  { id: "tabletlandscape", label: "Tablet horizontal", width: 1024, height: 768, group: "Tablets" },
  { id: "laptop", label: "Laptop compacta", width: 1280, height: 800, group: "Computadoras" },
  { id: "laptop1366", label: "Laptop de 1366 px", width: 1366, height: 768, group: "Computadoras" },
  { id: "desktop", label: "Escritorio de 1440 px", width: 1440, height: 900, group: "Computadoras" },
  { id: "fullhd", label: "Escritorio de 1920 px", width: 1920, height: 1080, group: "Computadoras" },
  { id: "ultrawide", label: "Pantalla amplia", width: 2560, height: 1440, group: "Computadoras" },
  ...[599, 600, 601, 899, 900, 901, 1023, 1024, 1025, 1279, 1280, 1281].map((width) => ({
    id: `boundary-${width}`, label: `Corte · ${width} px`, width, height: 900, group: "Límites de diseño" as const,
  })),
];
