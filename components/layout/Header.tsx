import { Container } from "@/components/ui/Container";

export function Header() {
  return (
    <header className="site-header">
      <Container className="header-inner">
        <a href="#top" className="brand-lockup" aria-label="PepoShots, volver al inicio">
          <span className="brand-name">PEPOSHOTS</span>
          <span className="brand-sub">BARTENDER &amp; WAITER · MIAMI</span>
        </a>
      </Container>
    </header>
  );
}
