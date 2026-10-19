import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResponsiveReview } from "@/components/review/ResponsiveReview";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Revisión local · PepoShots",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  // A development tool, never a new page for the public website.
  if (process.env.NODE_ENV === "production") notFound();
  return <ResponsiveReview />;
}
