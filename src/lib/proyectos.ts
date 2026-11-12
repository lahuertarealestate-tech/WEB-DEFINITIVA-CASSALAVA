// ⚠️ PROYECTOS PROVISIONALES: nombres, datos e imágenes son de ejemplo
// (las imágenes son renders generados para maquetar). Sustitúyelos por obras reales.

export type Proyecto = {
  slug: string;
  titulo: string;
  lugar: string;
  anio: number;
  superficie: string;
  servicios: string[];
  estado: "Terminado" | "En obra";
  resumen: string;
  descripcion: string[];
  portada: string;
  galeria: string[];
};

export const proyectos: Proyecto[] = [
  {
    slug: "casa-del-encinar",
    titulo: "Casa del Encinar",
    lugar: "Segovia",
    anio: 2025,
    superficie: "320 m²",
    servicios: ["Arquitectura", "Diseño de interiores", "Construcción"],
    estado: "Terminado",
    resumen: "Villa mediterránea de dos plantas con jardín de olivos, porches de pilares blancos y piscina desbordante.",
    descripcion: [
      "Conservamos el olivo centenario de la parcela y organizamos la entrada a su alrededor, con un camino de piedra natural entre lavandas y cipreses hasta la puerta pivotante de roble.",
      "En la fachada trasera, los porches de pilares blancos dan sombra a la planta baja, que se abre por completo a la terraza y a la piscina con grandes correderas de perfil negro.",
    ],
    portada: "/proyectos/villa-entrada.webp",
    galeria: ["/proyectos/villa-salon.webp", "/proyectos/villa-cocina.webp", "/proyectos/villa-terraza.webp"],
  },
  {
    slug: "salon-mirador",
    titulo: "Salón mirador",
    lugar: "Madrid",
    anio: 2025,
    superficie: "140 m²",
    servicios: ["Diseño de interiores", "Construcción"],
    estado: "Terminado",
    resumen: "Salón a doble altura que se abre por completo a la terraza y a la piscina.",
    descripcion: [
      "Las correderas de suelo a techo desaparecen al abrirse, de modo que el salón y la terraza funcionan como un único espacio con el mismo pavimento de piedra clara.",
      "La escalera de peldaños volados de roble sube junto a la doble altura sin tapar la luz que entra por los ventanales.",
    ],
    portada: "/proyectos/villa-salon.webp",
    galeria: ["/proyectos/villa-cocina.webp", "/proyectos/villa-terraza.webp"],
  },
  {
    slug: "cocina-isla",
    titulo: "Cocina con isla de mármol",
    lugar: "Valencia",
    anio: 2024,
    superficie: "45 m²",
    servicios: ["Diseño de interiores", "Construcción"],
    estado: "Terminado",
    resumen: "Cocina abierta con isla de mármol y frente de roble, conectada con el comedor exterior.",
    descripcion: [
      "La isla de mármol baja en cascada hasta el suelo y se orienta hacia la terraza, para cocinar mirando al jardín y a la piscina.",
      "Los armarios de roble llegan al techo y esconden electrodomésticos y despensa; solo queda a la vista una hornacina iluminada.",
    ],
    portada: "/proyectos/villa-cocina.webp",
    galeria: ["/proyectos/villa-salon.webp", "/proyectos/villa-terraza.webp"],
  },
  {
    slug: "terraza-piscina",
    titulo: "Terraza y piscina",
    lugar: "Málaga",
    anio: 2024,
    superficie: "210 m² exteriores",
    servicios: ["Arquitectura", "Construcción"],
    estado: "Terminado",
    resumen: "Terraza con piscina desbordante, porche de pilares y zona de estar hundida con fuego exterior.",
    descripcion: [
      "La piscina desborda hacia el jardín y queda a ras de la terraza, que usa la misma piedra clara que el interior de la casa.",
      "Junto al agua, una zona de estar hundida con sofás de obra y fuego exterior alarga el uso de la terraza hasta la noche.",
    ],
    portada: "/proyectos/villa-terraza.webp",
    galeria: ["/proyectos/villa-entrada.webp", "/proyectos/villa-salon.webp"],
  },
  {
    slug: "villa-voladizo",
    titulo: "Villa del voladizo",
    lugar: "Toledo",
    anio: 2023,
    superficie: "280 m²",
    servicios: ["Arquitectura", "Construcción"],
    estado: "Terminado",
    resumen: "Casa en ladera con una planta alta que vuela seis metros sobre el acceso.",
    descripcion: [
      "El voladizo resuelve a la vez la sombra de la entrada y las vistas de los dormitorios. Las lamas de madera filtran el sol de poniente.",
    ],
    portada: "/proyectos/villa-voladizo.webp",
    galeria: ["/proyectos/villa-entrada.webp"],
  },
  {
    slug: "ampliacion-en-obra",
    titulo: "Ampliación en curso",
    lugar: "Madrid",
    anio: 2026,
    superficie: "190 m²",
    servicios: ["Arquitectura", "Construcción"],
    estado: "En obra",
    resumen: "Ampliación de dos plantas con estructura de hormigón. Actualmente en fase de estructura.",
    descripcion: [
      "La estructura de planta baja está terminada y se está levantando la segunda planta. La entrega está prevista para la primavera.",
    ],
    portada: "/proyectos/ampliacion-en-obra.webp",
    galeria: ["/proyectos/villa-terraza.webp"],
  },
];

export function getProyecto(slug: string) {
  return proyectos.find((p) => p.slug === slug);
}
