"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navegacion } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [sobreRecorrido, setSobreRecorrido] = useState(pathname === "/");
  // el menú móvil se cierra solo al cambiar de página
  const [menuEn, setMenuEn] = useState<string | null>(null);
  const abierto = menuEn === pathname;

  // En la portada la cabecera es transparente mientras se ve el recorrido
  useEffect(() => {
    const comprobar = () => {
      const r = document.getElementById("recorrido")?.getBoundingClientRect();
      setSobreRecorrido(!!r && r.bottom > 72);
    };
    comprobar();
    window.addEventListener("scroll", comprobar, { passive: true });
    window.addEventListener("resize", comprobar);
    return () => {
      window.removeEventListener("scroll", comprobar);
      window.removeEventListener("resize", comprobar);
    };
  }, [pathname]);

  const claro = sobreRecorrido && !abierto;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        claro ? "sobre-oscuro bg-transparent text-cal" : "border-b border-tinta/10 bg-cal/95 text-tinta backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[92rem] items-center justify-between px-5 md:px-12">
        <Link href="/" className="logo text-[1.35rem] leading-none md:text-[1.5rem]" aria-label="CASSALAVA, inicio">
          CASSALAVA
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-9 text-[1.125rem]">
            {navegacion.map((n) => {
              const activo = pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={activo ? "page" : undefined}
                    className={`underline-offset-[0.3em] decoration-1 hover:underline ${activo ? "underline" : ""}`}
                  >
                    {n.texto}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 p-2 text-[1.125rem] md:hidden"
          aria-expanded={abierto}
          aria-controls="menu-movil"
          onClick={() => setMenuEn(abierto ? null : pathname)}
        >
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </div>

      {abierto && (
        <nav id="menu-movil" aria-label="Principal" className="h-[calc(100svh-72px)] bg-cal px-5 pt-6 md:hidden" data-lenis-prevent>
          <ul className="flex flex-col gap-1">
            {navegacion.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="block py-2 text-[2.25rem] leading-tight">
                  {n.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
