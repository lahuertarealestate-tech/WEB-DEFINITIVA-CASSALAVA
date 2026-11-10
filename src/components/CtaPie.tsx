"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Llamada a la acción del pie. En la página de contacto sobra.
export default function CtaPie() {
  if (usePathname() === "/contacto") return null;
  return (
    <div className="mb-20">
      <p className="max-w-[18ch] text-titulo">¿Tienes un terreno o una casa que transformar?</p>
      <Link
        href="/contacto"
        className="mt-8 inline-block border border-cal/60 px-6 py-3 text-[1.125rem] transition-colors hover:bg-cal hover:text-granate"
      >
        Pedir una primera visita
      </Link>
    </div>
  );
}
