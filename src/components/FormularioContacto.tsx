"use client";

import Link from "next/link";
import { useState } from "react";

type Estado = { tipo: "inicial" } | { tipo: "enviando" } | { tipo: "enviado" } | { tipo: "error"; mensaje: string };

const tipos = ["Obra nueva", "Reforma integral", "Ampliación", "Diseño de interiores", "Otro"];

// Todo en formas rectas: cajas con borde, sin esquinas redondeadas ni círculos
const campo =
  "mt-2 block w-full rounded-none border border-tinta/25 bg-cal px-4 py-3 text-[1.2rem] text-tinta placeholder:text-tinta/35 focus:border-granate focus:outline-none focus:ring-1 focus:ring-granate";

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
      <div role="status" className="border-t border-granate pt-8">
        <p className="text-titulo">Mensaje enviado.</p>
        <p className="mt-4 max-w-[34rem] text-entradilla text-tinta/80">
          Te escribiremos o llamaremos en un día laborable para concertar la primera visita.
        </p>
        <button type="button" onClick={() => setEstado({ tipo: "inicial" })} className="enlace mt-8">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-9">
      <div className="grid gap-9 md:grid-cols-2">
        <label className="block">
          <span>Nombre</span>
          <input name="nombre" required autoComplete="name" className={campo} />
        </label>
        <label className="block">
          <span>Teléfono</span>
          <input name="telefono" type="tel" autoComplete="tel" className={campo} />
        </label>
      </div>
      <label className="block">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" className={campo} />
      </label>

      <fieldset>
        <legend>Qué necesitas</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {tipos.map((t, i) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name="tipo" value={t} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-none border border-tinta/25 px-4 py-2 transition-colors peer-checked:border-granate peer-checked:bg-granate peer-checked:text-cal peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-granate">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span>Cuéntanos el proyecto</span>
        <textarea
          name="mensaje"
          required
          rows={5}
          placeholder="Dónde está, qué te gustaría hacer y cuándo"
          className={`${campo} resize-y`}
        />
      </label>

      {/* campo trampa para bots: las personas no lo ven */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Web
          <input name="web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex items-start gap-3 text-[1.0625rem]">
        <input
          name="privacidad"
          type="checkbox"
          required
          className="mt-1 size-5 shrink-0 cursor-pointer appearance-none rounded-none border border-tinta/40 bg-cal bg-center bg-no-repeat checked:border-granate checked:bg-granate checked:bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M3.5%208.5l3%203%206-7%22%20fill=%22none%22%20stroke=%22%23fffff7%22%20stroke-width=%222%22/%3E%3C/svg%3E')] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate"
        />
        <span>
          He leído la{" "}
          <Link href="/privacidad" className="enlace" target="_blank">
            política de privacidad
          </Link>{" "}
          y acepto que CASSALAVA use mis datos para responder a esta consulta.
        </span>
      </label>

      {estado.tipo === "error" && (
        <p role="alert" className="border-l-2 border-granate pl-4 text-granate">
          {estado.mensaje}
        </p>
      )}

      <button
        type="submit"
        disabled={estado.tipo === "enviando"}
        className="rounded-none bg-granate px-8 py-3.5 text-[1.2rem] text-cal transition-colors hover:bg-granate-oscuro disabled:opacity-60"
      >
        {estado.tipo === "enviando" ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
