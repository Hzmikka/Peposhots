export type RealEvent = {
  src: string;
  alt: string;
  descriptor: string;
  rating: number;
  review: string;
  author?: string;
  sample?: boolean;
};

// Event photos with review text supplied by the site owner.
export const realEvents: RealEvent[] = [
  {
    src: "/images/peposhots/real-events/espresso-martini.webp",
    alt: "Espresso martini servido en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 0,
    review: "Contratamos a PepoShots para un cumpleaños en casa y quedamos muy contentos. Los mojitos fueron los favoritos de la noche. El bartender estuvo pendiente de los invitados y mantuvo su espacio organizado. Nos permitió disfrutar de la fiesta sin estar preparando bebidas a cada rato."
  },
  {
    src: "/images/peposhots/real-events/mojito-bar.webp",
    alt: "Cóctel fresco con menta y lima en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 0,
    review: "Era la primera vez que contrataba un servicio de bartender y tenía bastantes dudas con las compras. Me ayudaron a organizar lo que necesitaba y la comunicación fue muy clara. El día del evento todo resultó mucho más sencillo de lo que esperaba."
  },
  {
    src: "/images/peposhots/real-events/spiced-cocktail.webp",
    alt: "Cóctel tropical amarillo preparado en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 0,
    review: "Muy buena atención. Hicimos una reunión pequeña y nos gustó que se tomaran el tiempo de preguntar cómo prefería cada persona su bebida. Pedí una margarita menos dulce y quedó buenísima. Varios amigos me pidieron el contacto."
  },
  {
    src: "/images/peposhots/real-events/shot-service.webp",
    alt: "Presentación de shots durante un evento real",
    descriptor: "SHOTS DEL EVENTO",
    rating: 0,
    review: "Los tuvimos en nuestra boda y nos dejaron una muy buena impresión. Había bastante movimiento en la barra, pero el trato siempre fue amable. Agradecimos especialmente la organización antes del evento, porque teníamos muchas cosas que coordinar."
  },
  {
    src: "/images/peposhots/real-events/lime-highball.webp",
    alt: "Highball con lima servido durante un evento real",
    descriptor: "SERVICIO DE BARRA",
    rating: 0,
    review: "Reservamos bartender y mesero para una celebración familiar. Tener ayuda con las bebidas y el servicio hizo una diferencia enorme: por una vez pudimos sentarnos a conversar con nuestros invitados. Fueron atentos y estuvieron pendientes de lo que hacía falta."
  },
  {
    src: "/images/peposhots/real-events/mojitos-group.webp",
    alt: "Varios mojitos listos para servir en un evento real",
    descriptor: "SERVICIO PARA INVITADOS",
    rating: 0,
    review: "La barra quedó muy bonita en el espacio que teníamos preparado. Todo se veía cuidado y combinaba con la decoración. Además de la presentación, los cócteles estuvieron muy buenos; el mojito y la piña colada fueron los que más se pidieron."
  },
  {
    src: "/images/peposhots/real-events/mint-martini.webp",
    alt: "Cóctel verde brillante preparado durante un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 0,
    review: "Lo que más me gustó fue la claridad desde el principio. Me explicaron qué incluía el servicio y qué debía tener listo yo. Llegamos al día de la fiesta con todo coordinado y pude dedicarme a recibir a mis invitados."
  },
  {
    src: "/images/peposhots/real-events/citrus-foam-martini.webp",
    alt: "Cóctel cremoso de estilo tropical en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 0,
    review: "Excelente trato de Jovel y su equipo. Hicimos una fiesta en el patio y estuvieron muy pendientes de nuestros invitados. Me gustó que las bebidas estuvieran equilibradas, con buen sabor. Al terminar, dejaron su área recogida. Los volvería a contratar."
  }
];

export const realWorkLookups = [
  "/images/peposhots/real-work/look-up-1.webp",
  "/images/peposhots/real-work/look-up-2.webp",
  "/images/peposhots/real-work/look-up-3.webp"
] as const;
