"use client";

import Link from "next/link";
import { useState } from "react";
import { cormorant, inter } from "@/lib/fuentes";

type Estado = { tipo: "inicial" } | { tipo: "enviando" } | { tipo: "enviado" } | { tipo: "error"; mensaje: string };

const tipos = ["Obra nueva", "Reforma integral", "Ampliación", "Diseño de interiores", "Otro"];

// Formato copiado del formulario de cassabela.com: etiquetas en Inter 11 px en
// mayúsculas espaciadas, campos con solo una línea inferior y texto Inter fino.
const etiqueta = `${inter.className} mb-1 block text-[11px] font-bold uppercase tracking-[0.25em] text-granate/70`;
const campo = `${inter.className} w-full rounded-none border-0 border-b border-granate/30 bg-transparent px-0 py-3 text-base font-light text-granate outline-none transition-colors placeholder:text-granate/30 focus:border-granate focus:ring-0 sm:text-lg`;

export default function FormularioContacto() {
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" });

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const datos = Object.fromEntries(new FormData(form));
    setEstado({ tipo: "enviando" });
    try {
      const r = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, privacidad: datos.privacidad === "on" }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(j.error ?? "No se ha podido enviar el mensaje.");
      form.reset();
      setEstado({ tipo: "enviado" });
    } catch (err) {
      setEstado({
        tipo: "error",
        mensaje: err instanceof Error ? err.message : "No se ha podido enviar el mensaje.",
      });
    }
  }

  if (estado.tipo === "enviado") {
    return (
      <div role="status" className="border-t border-granate/15 pt-8 text-granate">
        <p className={`${cormorant.className} text-4xl font-light leading-tight`}>Solicitud enviada.</p>
        <p className={`${inter.className} mt-4 text-base font-light text-granate/70 md:text-lg`}>
          Te escribiremos o llamaremos en un día laborable para concertar la primera visita.
        </p>
        <button
          type="button"
          onClick={() => setEstado({ tipo: "inicial" })}
          className={`${inter.className} mt-8 text-[11px] font-bold uppercase tracking-[0.25em] underline underline-offset-4`}
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-8 text-granate">
      <div>
        <label htmlFor="f-tipo" className={etiqueta}>
          Tipo de proyecto
        </label>
        <div className="relative">
          <select id="f-tipo" name="tipo" defaultValue={tipos[0]} className={`${campo} cursor-pointer appearance-none pr-8`}>
            {tipos.map((t) => (
              <option key={t} value={t} className="bg-cal text-granate">
                {t}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-granate/60"
          >
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div>
        <label htmlFor="f-nombre" className={etiqueta}>
          Nombre
        </label>
        <input id="f-nombre" name="nombre" required autoComplete="name" placeholder="Tu nombre completo" className={campo} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="f-telefono" className={etiqueta}>
            Teléfono
          </label>
          <input id="f-telefono" name="telefono" type="tel" autoComplete="tel" placeholder="+34 600 000 000" className={campo} />
        </div>
        <div>
          <label htmlFor="f-email" className={etiqueta}>
            Correo electrónico
          </label>
          <input
            id="f-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className={campo}
          />
        </div>
      </div>

      <div>
        <label htmlFor="f-mensaje" className={etiqueta}>
          Cuéntanos el proyecto
        </label>
        <textarea
          id="f-mensaje"
          name="mensaje"
          required
          rows={3}
          placeholder="Dónde está, qué te gustaría hacer y cuándo..."
          className={`${campo} resize-none`}
        />
      </div>

      {/* campo trampa para bots: las personas no lo ven */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Web
          <input name="web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className={`${inter.className} flex items-start gap-3 text-xs font-light leading-relaxed text-granate/70`}>
        <input
          name="privacidad"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-none border border-granate/40 bg-transparent bg-center bg-no-repeat checked:border-granate checked:bg-granate checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22%23fffff7%22%20stroke-width=%222%22/%3E%3C/svg%3E')] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
        />
        <span>
          He leído la{" "}
          <Link href="/privacidad" className="underline underline-offset-2" target="_blank">
            política de privacidad
          </Link>{" "}
          y acepto que CASSALAVA use mis datos para responder a esta consulta.
        </span>
      </label>

      {estado.tipo === "error" && (
        <p role="alert" className={`${inter.className} border-l-2 border-granate pl-4 text-sm font-light`}>
          {estado.mensaje}
        </p>
      )}

      <div className="space-y-4 pt-4">
        <button
          type="submit"
          disabled={estado.tipo === "enviando"}
          className={`${inter.className} w-full cursor-pointer rounded-none border border-granate bg-transparent py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-granate transition-all duration-300 hover:bg-granate hover:text-cal disabled:opacity-50`}
        >
          {estado.tipo === "enviando" ? "Enviando…" : "Enviar solicitud"}
        </button>
        <p className={`${inter.className} text-center text-[10px] font-light uppercase tracking-[0.25em] text-granate/60`}>
          Datos confidenciales.
        </p>
      </div>
    </form>
  );
}
