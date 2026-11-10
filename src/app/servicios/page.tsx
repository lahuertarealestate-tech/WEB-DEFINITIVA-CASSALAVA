import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CabeceraPagina from "@/components/CabeceraPagina";
import { proceso } from "@/lib/proceso";
import { servicios } from "@/lib/servicios";

export const metadata: Metadata = {
  title: "Servicios: arquitectura, diseño de interiores y construcción",
  description:
    "Proyecto de arquitectura, licencias, diseño de interiores y construcción de viviendas con un único equipo y presupuesto por partidas.",
  alternates: { canonical: "/servicios" },
};

export default function Servicios() {
  return (
    <>
      <CabeceraPagina
        titulo="Del primer boceto a la entrega de llaves"
        entradilla="Puedes contratarnos para una sola fase, pero donde más aportamos es cuando llevamos todo el proceso: arquitectura, interiorismo y obra con el mismo equipo."
      />

      {servicios.map((s, i) => (
        <section
          key={s.slug}
          id={s.slug}
          aria-labelledby={`titulo-${s.slug}`}
          className={`scroll-mt-[72px] ${i % 2 === 1 ? "bg-granate text-cal" : "border-t border-tinta/10"}`}
        >
          <div className="mx-auto grid max-w-[92rem] gap-10 px-5 py-20 md:grid-cols-12 md:gap-12 md:px-12 md:py-28">
            <div className={`md:col-span-6 ${i % 2 === 1 ? "md:order-2 md:col-start-7" : ""}`}>
              <div className="relative aspect-[4/3] overflow-hidden bg-yeso">
                <Image src={s.imagen} alt="" fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
              </div>
            </div>
            <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1 md:col-start-1" : "md:col-start-8"}`}>
              <h2 id={`titulo-${s.slug}`} className="text-titulo font-normal">
                {s.nombre}
              </h2>
              <p className="mt-6 text-entradilla">{s.resumen}</p>
              <p className={`mt-5 ${i % 2 === 1 ? "text-cal/80" : "text-tinta/80"}`}>{s.texto}</p>
              <h3 className={`mt-10 ${i % 2 === 1 ? "text-cal/65" : "text-piedra"}`}>Qué incluye</h3>
              <ul className={`mt-3 border-t ${i % 2 === 1 ? "border-cal/25" : "border-tinta/15"}`}>
                {s.incluye.map((x) => (
                  <li key={x} className={`border-b py-3 ${i % 2 === 1 ? "border-cal/25" : "border-tinta/15"}`}>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <section aria-labelledby="titulo-proceso" className="border-t border-tinta/10 bg-yeso">
        <div className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
          <h2 id="titulo-proceso" className="text-titulo font-normal">
            Las cinco fases de un proyecto
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
          <Link href="/contacto" className="enlace mt-14 inline-block text-entradilla">
            Cuéntanos tu proyecto
          </Link>
        </div>
      </section>
    </>
  );
}
