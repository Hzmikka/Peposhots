import Image from "next/image";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <>
      <section className="pepo-hero" id="top">
        <Image
          className="pepo-hero-image"
          src="/images/peposhots/hero/peposhots-bar-hero.webp"
          alt="Barra iluminada de PepoShots con botellas, cristalería y servicio de cócteles"
          fill
          priority
          sizes="(max-width: 400px) 100vw, 400px"
        />
        <div className="pepo-hero-overlay" />
        <Container className="pepo-hero-inner">
          <div className="pepo-hero-copy">
            <p className="kicker light">BARTENDER &amp; WAITER · MIAMI</p>
            <h1>Disfruta tu fiesta.<span>Nosotros nos encargamos de la barra.</span></h1>
            <p className="hero-support">Servicio para bodas, graduaciones y celebraciones privadas.</p>
            <Image
              className="hero-card-art"
              src="/images/peposhots/hero/martini-hero.webp"
              alt="Martini clásico con aceitunas"
              width={1777}
              height={887}
              sizes="(max-width: 400px) 82vw, 328px"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
