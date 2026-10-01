export type EventPathId = "wedding" | "graduation" | "private-party" | "corporate";

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
