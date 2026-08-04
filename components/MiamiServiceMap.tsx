import Image from "next/image";

export type ServiceArea = { id: string; name: string };

export function MiamiServiceMap() {
  return (
    <section className="map-only-section" id="service-area" aria-label="Zonas de servicio de PepoShots en Miami">
      <Image className="map-leaf map-leaf-top" src="/hojas/hoja1.png" alt="" width={180} height={180} aria-hidden="true" />
      <Image className="map-leaf map-leaf-left" src="/hojas/hoja2.png" alt="" width={190} height={190} aria-hidden="true" />
      <Image className="map-leaf map-leaf-right" src="/hojas/hoja3.png" alt="" width={180} height={180} aria-hidden="true" />
      <Image className="map-leaf map-leaf-bottom-left" src="/hojas/hoja4.png" alt="" width={210} height={210} aria-hidden="true" />
      <Image className="map-leaf map-leaf-bottom-right" src="/hojas/hoja5.png" alt="" width={175} height={175} aria-hidden="true" />
      <div className="map-only-image">
        <Image
          src="/images/map/map.png"
          alt="Mapa de las zonas de servicio de PepoShots en Miami"
          fill
          sizes="(max-width: 760px) 100vw, 1180px"
          priority={false}
        />
      </div>
    </section>
  );
}
