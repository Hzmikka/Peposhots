import Image from "next/image";

export function Footer() {
  return (
    <footer className="site-footer">
      <Image
        className="footer-logo"
        src="/images/peposhots/peposhots-footer-logo.webp"
        alt="PepoShots — Bartender & Waiter"
        width={1010}
        height={790}
      />
    </footer>
  );
}
