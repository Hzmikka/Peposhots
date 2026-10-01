import type { Metadata } from "next";
import { SiteExperience } from "@/components/layout/SiteExperience";

export const metadata: Metadata = {
  title: "PepoShots · Portfolio Demo",
  robots: { index: false, follow: false }
};

export default function DemoPage() {
  return <SiteExperience demo />;
}
