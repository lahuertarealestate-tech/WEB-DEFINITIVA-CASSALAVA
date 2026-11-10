import type { Metadata } from "next";
import Image from "next/image";
import CabeceraPagina from "@/components/CabeceraPagina";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "CASSALAVA reúne arquitectos, interioristas y equipo de obra propio para proyectar y construir viviendas.",
  alternates: { canonical: "/nosotros" },
};

// ⚠️ Textos provisionales: sustituir por la historia y el equipo reales.
const principios = [
  {
    titulo: "Un solo responsable",
    texto:
      "El mismo equipo proyecta y construye. Si algo no sale como estaba previsto, no hay a quién pasar la pelota: lo resolvemos nosotros.",
  },
  {
    titulo: "Decidir antes de construir",
    texto:
      "Cerramos materiales, instalaciones y mobiliario sobre plano. Los cambios en obra son los más caros, así que los evitamos con trabajo previo.",
  },
  {
    titulo: "Números a la vista",
    texto:
      "El presupuesto va por partidas y se actualiza con cada decisión. Sabes en todo momento cuánto cuesta lo que estás eligiendo.",
  },
];

const equipo = [
  { nombre: "Nombre Apellido", cargo: "Arquitecta, dirección de proyectos" },
  { nombre: "Nombre Apellido", cargo: "Interiorismo" },
  { nombre: "Nombre Apellido", cargo: "Jefe de obra" },
  { nombre: "Nombre Apellido", cargo: "Presupuestos y compras" },
];

export default function Nosotros() {
  return (
    <>
      <CabeceraPagina
        titulo="Arquitectos que también construyen"
        entradilla="CASSALAVA nació para que quien encarga una casa tenga delante a un único equipo: el que la diseña, el que la presupuesta y el que la levanta."
      />

      <div className="relative mx-auto aspect-[16/9] max-w-[92rem] overflow-hidden bg-yeso md:aspect-[16/7]">
        <Image src="/proyectos/pasillo-galeria.webp" alt="" fill sizes="100vw" className="object-cover" />
      </div>

      <section aria-labelledby="titulo-principios" className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
        <h2 id="titulo-principios" className="text-titulo font-normal">
          Cómo entendemos el oficio
        </h2>
        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
          {principios.map((p) => (
            <div key={p.titulo} className="border-t border-tinta/15 pt-6">
              <h3 className="text-[1.6rem] leading-tight">{p.titulo}</h3>
              <p className="mt-4 text-tinta/80">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="titulo-equipo" className="bg-granate text-cal">
        <div className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
          <h2 id="titulo-equipo" className="text-titulo font-normal">
            Equipo
          </h2>
          <ul className="mt-12 border-t border-cal/25">
            {equipo.map((m, i) => (
              <li key={i} className="grid gap-1 border-b border-cal/25 py-6 md:grid-cols-2 md:items-baseline">
                <span className="text-[1.75rem] leading-tight">{m.nombre}</span>
                <span className="text-cal/75">{m.cargo}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
