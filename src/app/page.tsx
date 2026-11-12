import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProyectoFicha from "@/components/ProyectoFicha";
import Recorrido, { type Tramo } from "@/components/recorrido/Recorrido";
import { proceso } from "@/lib/proceso";
import { proyectos } from "@/lib/proyectos";
import { servicios } from "@/lib/servicios";

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
  const destacados = proyectos.slice(0, 4);
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
          <Link href="/contacto" className="enlace mt-6 inline-block">
            Cuéntame tu proyecto
          </Link>
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

      {/* Servicios */}
      <section aria-labelledby="titulo-servicios" className="bg-granate text-cal">
        <div className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
          <h2 id="titulo-servicios" className="text-entradilla text-cal/70">
            Qué hacemos
          </h2>
          <ul className="mt-10 border-t border-cal/25">
            {servicios.map((s) => (
              <li key={s.slug} className="border-b border-cal/25">
                <Link
                  href={`/servicios#${s.slug}`}
                  className="group grid gap-3 py-10 md:grid-cols-12 md:items-baseline md:gap-8 md:py-14"
                >
                  <span className="text-[clamp(2.4rem,1.6rem+3.2vw,4.5rem)] leading-none tracking-[-0.015em] transition-transform duration-500 ease-[var(--ease-suave)] md:col-span-6 md:group-hover:translate-x-3">
                    {s.nombre}
                  </span>
                  <span className="max-w-[34rem] text-cal/80 md:col-span-5 md:col-start-8">{s.resumen}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Proyectos */}
      <section aria-labelledby="titulo-proyectos" className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-36">
        <div className="flex items-baseline justify-between gap-6">
          <h2 id="titulo-proyectos" className="text-titulo font-normal">
            Obras recientes
          </h2>
          <Link href="/proyectos" className="enlace shrink-0">
            Ver todos los proyectos
          </Link>
        </div>
        <div className="mt-14 grid gap-x-10 gap-y-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <ProyectoFicha proyecto={destacados[0]} tamano="grande" />
          </div>
          <div className="md:col-span-5 md:mt-40">
            <ProyectoFicha proyecto={destacados[1]} />
          </div>
          <div className="md:col-span-5 md:col-start-2">
            <ProyectoFicha proyecto={destacados[2]} />
          </div>
          <div className="md:col-span-5 md:col-start-8 md:-mt-24">
            <ProyectoFicha proyecto={destacados[3]} />
          </div>
        </div>
      </section>

      {/* Proceso: es una secuencia real, por eso va numerada */}
      <section aria-labelledby="titulo-proceso" className="border-t border-tinta/10 bg-yeso">
        <div className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
          <h2 id="titulo-proceso" className="text-titulo font-normal">
            Cómo trabajamos
          </h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-8">
            {proceso.map((p, i) => (
              <li key={p.titulo} className="border-t border-granate pt-5">
                <span className="cifras text-[2.25rem] leading-none text-granate">{i + 1}</span>
                <h3 className="mt-4 text-[1.4rem] leading-tight">{p.titulo}</h3>
                <p className="mt-3 text-tinta/75">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
