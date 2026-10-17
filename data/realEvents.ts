export type RealEvent = {
  src: string;
  alt: string;
  descriptor: string;
  rating: number;
  review: string;
  author?: string;
  sample?: boolean;
};

// Photos are real; review text and author names are fictional demo examples.
export const realEvents: RealEvent[] = [
  {
    src: "/images/peposhots/real-events/espresso-martini.webp",
    alt: "Espresso martini servido en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 5,
    author: "LAURA M.",
    sample: true,
    review: "El espresso martini quedó buenísimo. Lo pedí un poco menos dulce y me lo prepararon como me gusta. Muy buena atención."
  },
  {
    src: "/images/peposhots/real-events/mojito-bar.webp",
    alt: "Cóctel fresco con menta y lima en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 5,
    author: "ANDRÉS R.",
    sample: true,
    review: "Los mojitos fueron los favoritos de la noche. Se sentía la menta fresca y estaban bien balanceados. Repetiríamos."
  },
  {
    src: "/images/peposhots/real-events/spiced-cocktail.webp",
    alt: "Cóctel tropical amarillo preparado en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 4,
    author: "DANIELA P.",
    sample: true,
    review: "Hicimos un cumpleaños en casa y nos ayudaron con la lista de compras. Todo salió bien; solo habría coordinado el montaje un poco antes."
  },
  {
    src: "/images/peposhots/real-events/shot-service.webp",
    alt: "Presentación de shots durante un evento real",
    descriptor: "SHOTS DEL EVENTO",
    rating: 5,
    author: "MARCOS A.",
    sample: true,
    review: "Pedimos shots para el brindis y quedaron lindísimos. El bartender súper amable con todos, hasta con los que no sabían qué pedir."
  },
  {
    src: "/images/peposhots/real-events/lime-highball.webp",
    alt: "Highball con lima servido durante un evento real",
    descriptor: "SERVICIO DE BARRA",
    rating: 5,
    author: "ISABEL C.",
    sample: true,
    review: "La comunicación fue fácil y llegaron a la hora acordada. Nos explicaron qué alcohol comprar y eso nos quitó bastante trabajo."
  },
  {
    src: "/images/peposhots/real-events/mojitos-group.webp",
    alt: "Varios mojitos listos para servir en un evento real",
    descriptor: "SERVICIO PARA INVITADOS",
    rating: 5,
    author: "RICARDO L.",
    sample: true,
    review: "Éramos casi 100 y me preocupaba la fila. La barra se movió rápido y nadie se quedó esperando demasiado. Los mojitos volaron."
  },
  {
    src: "/images/peposhots/real-events/mint-martini.webp",
    alt: "Cóctel verde brillante preparado durante un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 5,
    author: "ELENA S.",
    sample: true,
    review: "No sabía qué pedir y me recomendaron algo fresco, que no fuera tan dulce. Le dieron justo al gusto. ¡Gracias por la paciencia!"
  },
  {
    src: "/images/peposhots/real-events/citrus-foam-martini.webp",
    alt: "Cóctel cremoso de estilo tropical en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 4,
    author: "CAROLINA V.",
    sample: true,
    review: "Nos encantaron los tragos y la presentación. Para la próxima pondríamos la barra en otro rincón, porque al final todos querían estar ahí."
  }
];

export const realWorkLookups = [
  "/images/peposhots/real-work/look-up-1.webp",
  "/images/peposhots/real-work/look-up-2.webp",
  "/images/peposhots/real-work/look-up-3.webp"
] as const;
