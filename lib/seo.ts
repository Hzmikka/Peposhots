import type { Metadata } from "next";
import { business } from "@/data/business";

export const siteMetadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} | Bartender para eventos en Miami`,
    template: `%s | ${business.name}`
  },
  description: business.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "PepoShots | Event Bartender Miami",
    description: business.description,
    images: ["/images/peposhots/hero/mojito-hero.webp"]
  },
  robots: { index: true, follow: true }
};

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: business.siteUrl,
    description: business.description,
    areaServed: "Miami-Dade County, Florida",
    telephone: business.contact.phone,
    email: business.contact.email
  };
}
