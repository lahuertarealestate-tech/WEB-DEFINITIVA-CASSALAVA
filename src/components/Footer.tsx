import Link from "next/link";
import { navegacion, site } from "@/lib/site";
import { servicios } from "@/lib/servicios";
import AbrirCookies from "./AbrirCookies";
import CtaPie from "./CtaPie";

export default function Footer() {
  const c = site.contacto;
  return (
    <footer className="bg-granate text-cal">
      <div className="mx-auto max-w-[92rem] px-5 pb-10 pt-20 md:px-12 md:pt-28">
        <CtaPie />

        <div className="grid gap-10 border-t border-cal/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="logo text-xl">CASSALAVA</p>
            <p className="mt-3 max-w-[28ch] text-cal/75">Arquitectura, diseño y construcción.</p>
          </div>
          <div>
            <h2 className="text-cal/60">Contacto</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <a className="enlace" href={c.telefonoHref}>
                  {c.telefono}
                </a>
              </li>
              <li>
                <a className="enlace" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              </li>
              {c.direccion.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-cal/60">Servicios</h2>
            <ul className="mt-3 space-y-1">
              {servicios.map((s) => (
                <li key={s.slug}>
                  <Link className="hover:underline" href={`/servicios#${s.slug}`}>
                    {s.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-cal/60">Estudio</h2>
            <ul className="mt-3 space-y-1">
              {navegacion
                .filter((n) => n.href !== "/servicios")
                .map((n) => (
                  <li key={n.href}>
                    <Link className="hover:underline" href={n.href}>
                      {n.texto}
                    </Link>
                  </li>
                ))}
              {site.redes.map((r) => (
                <li key={r.nombre}>
                  <a className="hover:underline" href={r.href} target="_blank" rel="noopener noreferrer">
                    {r.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 text-base text-cal/65 md:flex-row md:items-center md:justify-between">
          <p>© {site.legal.razonSocial}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link className="hover:text-cal" href="/aviso-legal">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link className="hover:text-cal" href="/privacidad">
                Privacidad
              </Link>
            </li>
            <li>
              <Link className="hover:text-cal" href="/cookies">
                Cookies
              </Link>
            </li>
            <li>
              <AbrirCookies className="hover:text-cal" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
