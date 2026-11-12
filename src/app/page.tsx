import type { Metadata } from "next";
import Image from "next/image";
import FormularioContacto from "@/components/FormularioContacto";
import Recorrido, { type Tramo } from "@/components/recorrido/Recorrido";

export const metadata: Metadata = {
  title: { absolute: "CASSALAVA | Arquitectura, diseño y construcción" },
  alternates: { canonical: "/" },
};

// Textos sincronizados con el recorrido (0 = calle, 0.19 = vestíbulo, 0.24–0.42 = escalera, 0.5 = puerta del piso, 0.59–0.9 = derrumbe)
const tramos: Tramo[] = [
  {
    desde: 0,
    hasta: 0.06,
    principal: true,
    titulo: "Arquitectura, diseño y construcción",
    texto: "Proyectamos y construimos tu casa de principio a fin, con un solo equipo y un solo interlocutor.",
  },
  {
    desde: 0.1,
    hasta: 0.26,
    titulo: "Arquitectura",
    marca: true,
    texto: "Proyectamos viviendas y rehabilitamos edificios respetando lo que ya tienen de valor.",
  },
  {
    desde: 0.44,
    hasta: 0.58,
    titulo: "Diseño",
    marca: true,
    texto: "Distribución, luz, materiales y mobiliario a medida, pensados contigo y cerrados antes de empezar la obra.",
  },
  {
    desde: 0.9,
    hasta: 0.975,
    titulo: "Construcción",
    marca: true,
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
        className="mx-auto grid max-w-[92rem] items-center gap-12 px-5 py-24 md:grid-cols-12 md:gap-10 md:px-12 md:py-36"
      >
        <div className="md:col-span-6">
          <h2 id="titulo-fundador" className="text-titulo font-normal">
            Ignacio Lahuerta
          </h2>
          <p className="mt-2 text-entradilla text-piedra">Arquitecto y fundador de CASSALAVA</p>
          <div className="mt-8 max-w-[38rem] space-y-5 text-tinta/85">
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
          <p className="mt-8 text-entradilla italic">Si tienes una casa que transformar, me encantará conocerla.</p>
          <a href="#contacto" className="enlace mt-6 inline-block">
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
      <section
        id="contacto"
        aria-labelledby="titulo-contacto"
        className="scroll-mt-[72px] border-t border-tinta/10"
      >
        <div className="mx-auto grid max-w-[92rem] gap-12 px-5 py-24 md:grid-cols-12 md:gap-10 md:px-12 md:py-32">
          <div className="md:col-span-4">
            <h2 id="titulo-contacto" className="text-titulo font-normal">
              Cuéntanos tu proyecto
            </h2>
            <p className="mt-6 max-w-[28rem] text-tinta/80">
              Te respondemos en un día laborable para concertar una primera visita, sin compromiso.
            </p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <FormularioContacto />
          </div>
        </div>
      </section>
    </>
  );
}
