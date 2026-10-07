import type { Metadata } from "next";
import { SiteExperience } from "@/components/layout/SiteExperience";

const title = "Celeste Web Studio · Webs para elegir y reservar";
const description =
  "Conoce PepoShots: un proyecto de diseño web que ayuda a elegir servicios, conocer precios y consultar fechas para eventos.";

export const metadata: Metadata = {
  metadataBase: new URL("https://peposhots.com"),
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Celeste Web Studio",
    url: "/celeste",
    title,
    description,
    images: [
      {
        url: "/celeste/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Una web que ayuda a elegir y reservar. PepoShots, un proyecto de Celeste Web Studio.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/celeste/opengraph-image"],
  },
};

export default function CelesteProjectPage() {
  return <SiteExperience />;
}
