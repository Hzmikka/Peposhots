export type RealEvent = {
  src: string;
  alt: string;
  descriptor: string;
  rating: number;
  review: string;
  author?: string;
  reviewSource?: string;
  sample?: boolean;
};

export const realEvents: RealEvent[] = [
  {
    src: "/images/peposhots/real-events/espresso-martini.webp",
    alt: "Espresso martini servido en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 5,
    author: "MARIAM MARWAN",
    reviewSource: "Reseña sobre Jovel · Google",
    review: "Jovel es muy acogedor y amable. Responde cualquier pregunta sobre tus gustos y preferencias con mucha atención y cuidado."
  },
  {
    src: "/images/peposhots/real-events/mojito-bar.webp",
    alt: "Cóctel fresco con menta y lima en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 5,
    sample: true,
    reviewSource: "Comentario de muestra",
    review: "Excelente atención de principio a fin. La barra siempre estuvo limpia, los tragos salían rápido y nuestros invitados estuvieron felices. Fue una de las cosas que más nos comentaron después de la fiesta."
  },
  {
    src: "/images/peposhots/real-events/spiced-cocktail.webp",
    alt: "Cóctel tropical amarillo preparado en un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 4,
    sample: true,
    reviewSource: "Comentario de muestra",
    review: "Contratamos el servicio para un cumpleaños y todo salió súper bien. Llegaron con tiempo, montaron rápido y estuvieron pendientes de la barra toda la noche. Varios invitados me preguntaron quiénes eran porque les gustó mucho el servicio."
  },
  {
    src: "/images/peposhots/real-events/shot-service.webp",
    alt: "Presentación de shots durante un evento real",
    descriptor: "SHOTS DEL EVENTO",
    rating: 5,
    sample: true,
    reviewSource: "Comentario de muestra",
    review: "Los contratamos para una celebración familiar y nos encantó. Fueron muy profesionales pero a la vez súper agradables con los invitados. Los detalles y la presentación hicieron que la fiesta se sintiera mucho más especial."
  },
  {
    src: "/images/peposhots/real-events/lime-highball.webp",
    alt: "Highball con lima servido durante un evento real",
    descriptor: "SERVICIO DE BARRA",
    rating: 5,
    sample: true,
    reviewSource: "Comentario de muestra",
    review: "Quedamos muy contentos con el servicio. Desde antes del evento nos explicaron bien qué teníamos que comprar y el día de la fiesta prácticamente no tuvimos que preocuparnos por nada."
  },
  {
    src: "/images/peposhots/real-events/mojitos-group.webp",
    alt: "Varios mojitos listos para servir en un evento real",
    descriptor: "SERVICIO PARA INVITADOS",
    rating: 5,
    sample: true,
    reviewSource: "Comentario de muestra",
    review: "Teníamos bastante gente y pensé que se iba a formar una fila enorme, pero trabajaron súper rápido. Nunca sentimos que la barra estuviera atrasada y todo se veía muy bien presentado."
  },
  {
    src: "/images/peposhots/real-events/mint-martini.webp",
    alt: "Cóctel verde brillante preparado durante un evento real",
    descriptor: "CÓCTEL DEL EVENTO",
    rating: 5,
    author: "ANTHONY CHAUMONT",
    reviewSource: "Reseña sobre Jovel · Google",
    review: "Jovel fue increíble. Nos atendió muchísimo mejor de lo que esperábamos y estuvo pendiente de nosotros todo el tiempo. Excelente experiencia."
  },
  {
    src: "/images/peposhots/real-events/citrus-foam-martini.webp",
    alt: "Cóctel cremoso de estilo tropical en un evento real",
    descriptor: "PREPARADO EN EL EVENTO",
    rating: 5,
    author: "DEYSI GUEVARA",
    reviewSource: "Reseña sobre Jovel · Google",
    review: "Pregunté quién estaba a cargo y felicité a Jovel por los buenos resultados. Muchas gracias por su atención y excelente servicio. Volveremos muy pronto."
  }
];

export const realWorkLookups = [
  "/images/peposhots/real-work/look-up-1.webp",
  "/images/peposhots/real-work/look-up-2.webp",
  "/images/peposhots/real-work/look-up-3.webp"
] as const;
