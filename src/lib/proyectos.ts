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
    resumen: "Vivienda unifamiliar de dos volúmenes entre encinas, con zócalo de piedra y planta alta en voladizo.",
    descripcion: [
      "La parcela tenía encinas que queríamos conservar, así que la casa se coloca entre ellas. La planta baja se apoya en un zócalo de piedra de la zona y la planta alta vuela sobre la entrada para dar sombra a la fachada sur.",
      "Dentro, un pasillo de entrada lleva directamente al salón, que se abre al jardín con un ventanal de suelo a techo.",
    ],
    portada: "/proyectos/casa-del-encinar.webp",
    galeria: ["/proyectos/pasillo-galeria.webp", "/proyectos/salon-mirador.webp", "/proyectos/terraza-piscina.webp"],
  },
  {
    slug: "salon-mirador",
    titulo: "Salón mirador",
    lugar: "Madrid",
    anio: 2025,
    superficie: "140 m²",
    servicios: ["Diseño de interiores", "Construcción"],
    estado: "Terminado",
    resumen: "Reforma de la planta baja de una vivienda para unir salón, cocina y comedor frente al jardín.",
    descripcion: [
      "Eliminamos tres tabiques y reforzamos la estructura para conseguir un único espacio de casi diez metros de fondo que termina en un ventanal corrido.",
      "La librería de nogal ocupa toda la pared lateral y esconde instalaciones y almacenaje.",
    ],
    portada: "/proyectos/salon-mirador.webp",
    galeria: ["/proyectos/cocina-isla.webp", "/proyectos/pasillo-galeria.webp"],
  },
  {
    slug: "cocina-isla",
    titulo: "Cocina con isla de mármol",
    lugar: "Valencia",
    anio: 2024,
    superficie: "45 m²",
    servicios: ["Diseño de interiores", "Construcción"],
    estado: "Terminado",
    resumen: "Cocina abierta con isla de mármol iluminada por un lateral acristalado.",
    descripcion: [
      "La isla se orienta hacia las ventanas para cocinar con luz natural. La encimera continúa en un único bloque de mármol hasta el suelo.",
    ],
    portada: "/proyectos/cocina-isla.webp",
    galeria: ["/proyectos/salon-mirador.webp"],
  },
  {
    slug: "terraza-piscina",
    titulo: "Terraza y piscina",
    lugar: "Málaga",
    anio: 2024,
    superficie: "210 m² exteriores",
    servicios: ["Arquitectura", "Construcción"],
    estado: "Terminado",
    resumen: "Ampliación de la terraza trasera con piscina desbordante al nivel del pavimento.",
    descripcion: [
      "La piscina queda enrasada con la terraza para que el agua parezca continuar el suelo de la casa. El pavimento exterior es la misma piedra que el interior.",
    ],
    portada: "/proyectos/terraza-piscina.webp",
    galeria: ["/proyectos/casa-del-encinar.webp"],
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
    galeria: ["/proyectos/casa-del-encinar.webp"],
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
    galeria: ["/proyectos/terraza-piscina.webp"],
  },
];

export function getProyecto(slug: string) {
  return proyectos.find((p) => p.slug === slug);
}
