import Image from "next/image";
import Link from "next/link";
import type { Proyecto } from "@/lib/proyectos";

export default function ProyectoFicha({
  proyecto,
  tamano = "normal",
  prioridad = false,
}: {
  proyecto: Proyecto;
  tamano?: "normal" | "grande";
  prioridad?: boolean;
}) {
  return (
    <Link href={`/proyectos/${proyecto.slug}`} className="group block">
      <figure>
        <div className={`relative overflow-hidden bg-yeso ${tamano === "grande" ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
          <Image
            src={proyecto.portada}
            alt={proyecto.resumen}
            fill
            priority={prioridad}
            sizes={tamano === "grande" ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 42vw, 100vw"}
            className="object-cover transition-transform duration-[900ms] ease-[var(--ease-suave)] group-hover:scale-[1.03]"
          />
          {proyecto.estado === "En obra" && (
            <span className="absolute left-3 top-3 bg-granate px-3 py-1 text-base text-cal">En obra</span>
          )}
        </div>
        <figcaption className="mt-4 flex items-baseline justify-between gap-4">
          <span className="text-[1.5rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.2em]">
            {proyecto.titulo}
          </span>
          <span className="cifras shrink-0 text-piedra">
            {proyecto.lugar}, {proyecto.anio}
          </span>
        </figcaption>
      </figure>
    </Link>
  );
}
