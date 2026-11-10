import type { Metadata } from "next";
import CabeceraPagina from "@/components/CabeceraPagina";
import FormularioContacto from "@/components/FormularioContacto";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Cuéntanos tu proyecto de arquitectura, reforma o construcción y te llamamos para concertar una primera visita.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  const c = site.contacto;
  return (
    <>
      <CabeceraPagina
        titulo="Cuéntanos tu proyecto"
        entradilla="Te respondemos en un día laborable para concertar una primera visita, sin compromiso."
      />
      <div className="mx-auto grid max-w-[92rem] gap-16 px-5 pb-28 md:grid-cols-12 md:px-12 md:pb-36">
        <div className="md:col-span-7">
          <FormularioContacto />
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <h2 className="text-piedra">Teléfono</h2>
          <a href={c.telefonoHref} className="enlace cifras mt-1 inline-block text-entradilla">
            {c.telefono}
          </a>
          <h2 className="mt-8 text-piedra">Email</h2>
          <a href={`mailto:${c.email}`} className="enlace mt-1 inline-block text-entradilla">
            {c.email}
          </a>
          <h2 className="mt-8 text-piedra">Estudio</h2>
          <address className="cifras mt-1 not-italic">
            {c.direccion.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <h2 className="mt-8 text-piedra">Horario</h2>
          <p className="cifras mt-1">{c.horario}</p>
        </aside>
      </div>
    </>
  );
}
