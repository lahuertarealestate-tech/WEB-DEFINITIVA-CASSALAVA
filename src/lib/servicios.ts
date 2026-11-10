export type Servicio = {
  slug: "arquitectura" | "diseno" | "construccion";
  nombre: string;
  resumen: string;
  texto: string;
  incluye: string[];
  imagen: string;
};

export const servicios: Servicio[] = [
  {
    slug: "arquitectura",
    nombre: "Arquitectura",
    resumen:
      "Proyectamos la casa a partir del terreno, la orientación y la forma en que vas a vivir en ella.",
    texto:
      "Empezamos visitando el terreno o la vivienda y escuchando qué necesitas. Con eso dibujamos un anteproyecto que puedes recorrer en 3D, y cuando lo das por bueno preparamos el proyecto básico y de ejecución, tramitamos la licencia y dirigimos la obra.",
    incluye: [
      "Estudio del terreno y de la normativa urbanística",
      "Anteproyecto con visitas virtuales en 3D",
      "Proyecto básico y de ejecución",
      "Tramitación de licencias",
      "Dirección de obra",
    ],
    imagen: "/proyectos/villa-voladizo.webp",
  },
  {
    slug: "diseno",
    nombre: "Diseño de interiores",
    resumen:
      "Distribución, materiales, iluminación y mobiliario a medida, decididos antes de empezar la obra.",
    texto:
      "El interior se diseña a la vez que la arquitectura, no después. Elegimos contigo cada acabado sobre muestras reales, resolvemos la iluminación y dibujamos los muebles a medida, de forma que el presupuesto ya los incluye desde el principio.",
    incluye: [
      "Distribución y estudio de luz natural",
      "Selección de materiales y acabados con muestras",
      "Proyecto de iluminación",
      "Cocinas, baños y mobiliario a medida",
      "Decoración y estilismo final",
    ],
    imagen: "/proyectos/salon-mirador.webp",
  },
  {
    slug: "construccion",
    nombre: "Construcción",
    resumen:
      "Obra nueva, ampliaciones y reformas integrales con equipo propio y plazos por escrito.",
    texto:
      "Construimos lo que proyectamos. Un jefe de obra se encarga de tu casa de principio a fin y te informa cada semana del avance, del calendario y de cualquier decisión pendiente. Al terminar, te entregamos la documentación completa y la garantía.",
    incluye: [
      "Obra nueva y ampliaciones",
      "Reformas integrales",
      "Jefe de obra dedicado e informe semanal",
      "Presupuesto cerrado por partidas",
      "Entrega con documentación y garantía",
    ],
    imagen: "/proyectos/ampliacion-en-obra.webp",
  },
];
