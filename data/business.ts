import type { BusinessConfig } from "@/lib/types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const business: BusinessConfig = {
  name: "PepoShots",
  city: "Miami",
  region: "FL",
  siteUrl,
  description:
    "Servicio de bartender y waiter para bodas, graduaciones, cumpleaños, eventos corporativos y celebraciones privadas en Miami.",
  contact: {
    phone: "+17866067684",
    email: "peposchots5@gmail.com"
  }
};
