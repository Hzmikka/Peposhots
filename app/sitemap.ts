import type { MetadataRoute } from "next";
import { business } from "@/data/business";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: business.siteUrl,
      changeFrequency: "monthly",
      priority: 1
    },
    {
      url: `${business.siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2
    }
  ];
}
