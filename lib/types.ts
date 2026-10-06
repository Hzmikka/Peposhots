export type EventPathId = "up-to-50" | "51-100" | "101-150" | "151-200" | "over-200";

export type BusinessConfig = {
  name: string;
  city: string;
  region: string;
  siteUrl: string;
  description: string;
  contact: {
    phone?: string;
    email?: string;
  };
};
