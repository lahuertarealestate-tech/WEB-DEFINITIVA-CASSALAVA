import type { Metadata } from "next";
import CabeceraPagina from "@/components/CabeceraPagina";
import ProyectoFicha from "@/components/ProyectoFicha";
import { proyectos } from "@/lib/proyectos";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Viviendas, reformas y ampliaciones proyectadas y construidas por CASSALAVA.",
  alternates: { canonical: "/proyectos" },
};

export default function Proyectos() {
  return (
    <>
      <CabeceraPagina
        titulo="Proyectos"
        entradilla="Casas nuevas, reformas integrales y ampliaciones. Cada ficha explica el encargo, cómo lo resolvimos y qué parte del trabajo hicimos."
      />
      <div className="mx-auto grid max-w-[92rem] gap-x-10 gap-y-16 px-5 pb-28 md:grid-cols-2 md:px-12 md:pb-36">
        {proyectos.map((p, i) => (
          <div key={p.slug} className={i % 2 === 1 ? "md:mt-28" : ""}>
            <ProyectoFicha proyecto={p} prioridad={i < 2} />
          </div>
        ))}
      </div>
    </>
  );
}
