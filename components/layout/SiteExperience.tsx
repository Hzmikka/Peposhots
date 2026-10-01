import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { Hero } from "@/components/sections/Hero";
import { PathBarsScene } from "@/components/sections/PathBarsScene";
import { DrinksExperience } from "@/components/sections/DrinksExperience";
import { WhatYouBring } from "@/components/sections/WhatYouBring";
import { RealWorkReviews } from "@/components/sections/RealWorkReviews";
import { WhereAndWhen } from "@/components/sections/WhereAndWhen";
import { BookingInquiry } from "@/components/sections/BookingInquiry";

function SiteSections() {
  return (
    <>
      <Hero />
      <PathBarsScene />
      <DrinksExperience />
      <WhatYouBring />
      <RealWorkReviews />
      <WhereAndWhen />
      <BookingInquiry />
    </>
  );
}

export function SiteExperience({ demo = false }: { demo?: boolean }) {
  const shell = (
    <div
      className={`page-shell ${demo ? "is-demo" : "is-live"}`}
      data-scroll-container={demo ? "true" : undefined}
    >
      <Header />
      <main id="main"><SiteSections /></main>
      <StickyMobileCTA />
      <Footer />
    </div>
  );

  if (!demo) {
    return <div className="live-site">{shell}</div>;
  }

  return (
    <div className="demo-site">
      <div className="page-canvas" aria-hidden="true" />
      <div className="device-stage">
        <div className="page-device">
          <div className="device-island" aria-hidden="true" />
          <div className="device-highlight" aria-hidden="true" />
          {shell}
        </div>
      </div>
    </div>
  );
}
