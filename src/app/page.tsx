import type { Metadata } from "next";
import Image from "next/image";
import SeccionContacto from "@/components/SeccionContacto";
import Recorrido, { type Tramo } from "@/components/recorrido/Recorrido";

export const metadata: Metadata = {
  title: { absolute: "CASSALAVA | Arquitectura, diseño y construcción" },
  alternates: { canonical: "/" },
};

// Textos sincronizados con el recorrido (0–0.063 = acercamiento a la fachada, 0.063–0.181 = entrada por la ventana del torreón,
// 0.181–0.354 = reforma del salón, 0.354–0.438 = giro hacia la puerta y paso al pasillo, 0.438–0.479 = reforma del pasillo,
// 0.479–0.528 = recorrido hasta la cocina, 0.528–0.694 = reforma de la cocina, 0.694–0.771 = vuelta en la cocina y salida
// al pasillo hacia el dormitorio, 0.771–0.854 = entrada en el dormitorio, 0.854–1 = reforma del dormitorio)
const tramos: Tramo[] = [
  {
    desde: 0,
    hasta: 0.021,
    principal: true,
    // "\n" marca el salto de línea: "diseño y construcción" siempre en la misma línea
    titulo: "Arquitectura,\ndiseño y construcción",
    texto: "Proyectamos y construimos tu casa de principio a fin, con un solo equipo y un solo interlocutor.",
  },
  {
    desde: 0.028,
    hasta: 0.097,
    titulo: "Arquitectura",
    texto: "Proyectamos viviendas y rehabilitamos edificios respetando lo que ya tienen de valor.",
  },
  {
    desde: 0.111,
    hasta: 0.188,
    titulo: "Diseño",
    texto: "Distribución, luz, materiales y mobiliario a medida, pensados contigo y cerrados antes de empezar la obra.",
  },
  {
    desde: 0.201,
    hasta: 0.292,
    titulo: "Construcción",
    texto: "Demolemos, reforzamos y reconstruimos con equipo propio, de la estructura al último acabado.",
  },
];

export default function Inicio() {
  return (
    <>
      <Recorrido tramos={tramos} />

      {/* Quién soy. La foto está en public/images/ignacio-lahuerta.jpg:
          para cambiarla basta con subir otra con el mismo nombre (formato vertical 4:5). */}
      <section
        aria-labelledby="titulo-fundador"
        className="mx-auto grid max-w-[92rem] items-center gap-8 px-5 py-14 md:grid-cols-12 md:gap-10 md:px-12 md:py-20"
      >
        <div className="md:col-span-6">
          <h2 id="titulo-fundador" className="text-titulo font-normal">
            Ignacio Lahuerta
          </h2>
          <p className="mt-2 text-entradilla text-piedra">Arquitecto y fundador de CASSALAVA</p>
          <div className="mt-5 max-w-[38rem] space-y-4 text-tinta/85">
            <p>
              Soy arquitecto y también dirijo Cassabela, mi inmobiliaria boutique en Madrid. Desde ahí he visto muchas
              viviendas con un enorme potencial que sus propietarios no se atrevían a reformar. Tenían que coordinar a
              un arquitecto, un interiorista y una constructora, y al final nadie respondía por el conjunto.
            </p>
            <p>
              Fundé CASSALAVA para resolverlo. Proyectamos, diseñamos y construimos con un solo equipo, de modo que
              quien dibuja tu casa es también quien la levanta. Tendrás un único interlocutor, un presupuesto cerrado
              desde el principio y a alguien que responde de cada decisión, desde la primera visita hasta la entrega
              de llaves.
            </p>
            <p>
              Conocer el mercado inmobiliario me permite ver lo que una vivienda puede llegar a ser antes de tocarla, y
              saber qué reformas aportan valor de verdad. Con ese criterio trabajamos en cada proyecto en Madrid.
            </p>
          </div>
          <p className="mt-5 text-entradilla italic">Si tienes una casa que transformar, me encantará conocerla.</p>
          <a href="#contacto" className="enlace mt-4 inline-block">
            Cuéntame tu proyecto
          </a>
        </div>
        <figure className="md:col-span-5 md:col-start-8">
          <div className="relative aspect-[4/5] overflow-hidden bg-yeso">
            <Image
              src="/images/ignacio-lahuerta.jpg"
              alt="Ignacio Lahuerta, arquitecto y fundador de CASSALAVA"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      </section>

      {/* Contacto: lo único que hay debajo de la presentación */}
      <SeccionContacto />
    </>
  );
}
