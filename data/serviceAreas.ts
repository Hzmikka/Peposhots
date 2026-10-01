export const serviceAreas = [
  {
    id: "design-district",
    label: "Design District",
    x: 49.532,
    y: 27.737,
    signature: {
      name: "Chrome Garden",
      image: "/images/peposhots/signature/design-district-chrome-garden.webp"
    }
  },
  {
    id: "wynwood",
    label: "Wynwood",
    x: 49.959,
    y: 45.705,
    signature: {
      name: "Wet Paint",
      image: "/images/peposhots/signature/wynwood-wet-paint.webp"
    }
  },
  {
    id: "little-havana",
    label: "Little Havana",
    x: 31.524,
    y: 53.654,
    signature: {
      name: "Cafecito Nocturno",
      image: "/images/peposhots/signature/little-havana-cafecito-nocturno.webp"
    }
  },
  {
    id: "brickell",
    label: "Brickell",
    x: 55.089,
    y: 53.792,
    signature: {
      name: "Afterglow",
      image: "/images/peposhots/signature/brickell-afterglow.webp"
    }
  },
  {
    id: "coconut-grove",
    label: "Coconut Grove",
    x: 51.682,
    y: 61.033,
    signature: {
      name: "Canopy",
      image: "/images/peposhots/signature/coconut-grove-canopy.webp"
    }
  },
  {
    id: "coral-gables",
    label: "Coral Gables",
    x: 30.291,
    y: 80.995,
    signature: {
      name: "Bougainvillea",
      image: "/images/peposhots/signature/coral-gables-bougainvillea.webp"
    }
  },
  {
    id: "south-beach",
    label: "South Beach",
    x: 86.995,
    y: 48.742,
    signature: {
      name: "Salt Mirage",
      image: "/images/peposhots/signature/south-beach-salt-mirage.webp"
    }
  }
] as const;

export type ServiceAreaId = (typeof serviceAreas)[number]["id"];
