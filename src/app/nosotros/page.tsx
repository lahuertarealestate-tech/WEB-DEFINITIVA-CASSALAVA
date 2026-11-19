import type { Metadata } from "next";
import CabeceraPagina from "@/components/CabeceraPagina";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "CASSALAVA reúne arquitectos, interioristas y equipo de obra propio para proyectar y construir viviendas.",
  alternates: { canonical: "/nosotros" },
};

// ⚠️ Textos provisionales: sustituir por la historia real.
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

export default function Nosotros() {
  return (
    <>
      <CabeceraPagina
        titulo="Arquitectos que también construyen"
        entradilla="CASSALAVA nació para que quien encarga una casa tenga delante a un único equipo: el que la diseña, el que la presupuesta y el que la levanta."
        // Foto a la derecha del texto (public/images/nosotros.jpg: para cambiarla, sube otra con el mismo nombre)
        foto="/images/nosotros.jpg"
      />

      <section aria-labelledby="titulo-principios" className="mx-auto max-w-[92rem] px-5 py-14 md:px-12 md:py-20">
        <h2 id="titulo-principios" className="text-titulo font-normal">
          Cómo entendemos el oficio
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {principios.map((p) => (
            <div key={p.titulo} className="border-t border-tinta/15 pt-6">
              <h3 className="text-[1.6rem] leading-tight">{p.titulo}</h3>
              <p className="mt-4 text-tinta/80">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
