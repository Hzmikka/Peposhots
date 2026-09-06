import type { Metadata } from "next";
import "./globals.css";
import { BookingQuizProvider } from "@/context/BookingQuizContext";

export const metadata: Metadata = {
  title: "PepoShots Event Bartender | Miami",
  description: "Servicio móvil de bartending para celebraciones en Miami.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BookingQuizProvider><div className="page-frame">{children}</div></BookingQuizProvider>
      </body>
    </html>
  );
}
