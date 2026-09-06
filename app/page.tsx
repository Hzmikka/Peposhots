import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HeroQuickSelector } from "@/components/HeroQuickSelector";
import { OffersSection } from "@/components/OffersSection";
import { MiamiServiceMap } from "@/components/MiamiServiceMap";
import { BookingSection } from "@/components/BookingSection";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { EventRibbon } from "@/components/EventRibbon";
import { CocktailTextures } from "@/components/CocktailTextures";
import { CommentsSection } from "@/components/sections/CommentsSection";

export default function Home() {
  return (
    <>
        <Header />
      <main>
        <Hero />
        <HeroQuickSelector />
        <CocktailTextures />
        <EventRibbon />
        <Reveal><MiamiServiceMap /></Reveal>
        <Reveal><OffersSection /></Reveal>
        <Reveal>
          <div className="experiences-band">
            <CommentsSection />
          </div>
        </Reveal>
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
