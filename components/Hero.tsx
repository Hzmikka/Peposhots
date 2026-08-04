import { ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="hero" id="top">
      <Image
        className="hero-image"
        src="/images/hero/hero.png"
        alt="Peposhots, bebidas cítricas frías con lima, menta y hielo"
        fill
        priority
        sizes="(max-width: 680px) calc(100vw - 1.7rem), (max-width: 1180px) 100vw, 1180px"
      />
      <div className="container hero-grid">
        <p className="hero-service-label">Bartender &amp; Waiter</p>
        <div className="hero-badges" aria-label="Información del servicio">
          <span className="hero-badge">
            <ShieldCheck size={16} strokeWidth={1.9} />
            Bartender &amp; Waiter
          </span>
          <span className="hero-badge">
            <Sparkles size={16} strokeWidth={1.9} />
            Reserva con 2 semanas
          </span>
        </div>
        <p className="hero-tagline">
          Bartender y waiter para cumpleaños, bodas, graduaciones y reuniones privadas
        </p>
      </div>
    </section>
  );
}
