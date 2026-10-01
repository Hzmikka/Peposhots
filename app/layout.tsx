import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Bebas_Neue, Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { PepoExperienceProvider } from "@/components/peposhots/PepoExperienceContext";
import { siteMetadata, localBusinessJsonLd } from "@/lib/seo";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-web",
  display: "swap",
});

const displayCondensed = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-web",
  display: "swap",
});

const editorialSerif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-editorial-web",
  display: "swap",
});

export const metadata = siteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#094735",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = localBusinessJsonLd();

  return (
    <html lang="es">
      <body className={`${inter.variable} ${displayCondensed.variable} ${editorialSerif.variable}`}>
        <a href="#main" className="skip-link">Saltar al contenido</a>
        <PepoExperienceProvider>{children}</PepoExperienceProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
