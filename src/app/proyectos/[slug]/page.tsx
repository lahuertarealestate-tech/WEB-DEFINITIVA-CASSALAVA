import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProyecto, proyectos } from "@/lib/proyectos";

export function generateStaticParams() {
  return proyectos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/proyectos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProyecto(slug);
  if (!p) return {};
  return {
    title: `${p.titulo}, ${p.lugar}`,
    description: p.resumen,
    alternates: { canonical: `/proyectos/${p.slug}` },
    openGraph: { images: [{ url: p.portada, width: 1800, height: 1208 }] },
  };
}

export default async function FichaProyecto({ params }: PageProps<"/proyectos/[slug]">) {
  const { slug } = await params;
  const p = getProyecto(slug);
  if (!p) notFound();

  const indice = proyectos.findIndex((x) => x.slug === p.slug);
  const siguiente = proyectos[(indice + 1) % proyectos.length];

  const datos = [
    ["Ubicación", p.lugar],
    ["Año", String(p.anio)],
    ["Superficie", p.superficie],
    ["Estado", p.estado],
    ["Qué hicimos", p.servicios.join(", ")],
  ];

  return (
    <article>
      <header className="mx-auto max-w-[92rem] px-5 pb-12 pt-[calc(72px+4rem)] md:px-12 md:pb-16 md:pt-[calc(72px+6rem)]">
        <Link href="/proyectos" className="enlace text-piedra">
          Proyectos
        </Link>
        <h1 className="mt-6 max-w-[18ch] text-portada font-normal tracking-[-0.015em] text-balance">{p.titulo}</h1>
        <p className="mt-6 max-w-[40rem] text-entradilla text-tinta/80">{p.resumen}</p>
      </header>

      <div className="relative mx-auto aspect-[16/10] max-w-[92rem] overflow-hidden bg-yeso md:aspect-[16/8]">
        <Image src={p.portada} alt={p.resumen} fill priority sizes="100vw" className="object-cover" />
      </div>

      <div className="mx-auto grid max-w-[92rem] gap-12 px-5 py-20 md:grid-cols-12 md:px-12 md:py-28">
        <dl className="cifras md:col-span-4">
          {datos.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-tinta/15 py-3 first:border-t">
              <dt className="text-piedra">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-6 text-entradilla md:col-span-7 md:col-start-6">
          {p.descripcion.map((t) => (
            <p key={t.slice(0, 24)}>{t}</p>
          ))}
        </div>
      </div>

      {p.galeria.length > 0 && (
        <div className="mx-auto grid max-w-[92rem] gap-6 px-5 md:grid-cols-2 md:px-12">
          {p.galeria.map((src, i) => (
            <div
              key={src}
              className={`relative overflow-hidden bg-yeso ${
                p.galeria.length % 2 === 1 && i === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/3]"
              }`}
            >
              <Image src={src} alt="" fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <nav aria-label="Siguiente proyecto" className="mx-auto max-w-[92rem] px-5 py-24 md:px-12 md:py-32">
        <Link href={`/proyectos/${siguiente.slug}`} className="group block border-t border-tinta/15 pt-8">
          <span className="text-piedra">Siguiente proyecto</span>
          <span className="mt-2 block text-titulo group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.15em]">
            {siguiente.titulo}
          </span>
        </Link>
      </nav>
    </article>
  );
}
