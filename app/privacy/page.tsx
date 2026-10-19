import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PrivacyContent } from "@/components/privacy/PrivacyContent";

export const metadata: Metadata = { title: "Privacidad", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <main id="main"><Container className="privacy-page"><PrivacyContent /></Container></main>;
}
