"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENTO_ABRIR, guardarConsentimiento, leerConsentimiento } from "@/lib/cookies";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [detalle, setDetalle] = useState(false);
  const [analitica, setAnalitica] = useState(false);

  useEffect(() => {
    const previo = leerConsentimiento();
    // se muestra un instante después para no tapar la precarga de la portada
    const t = window.setTimeout(() => {
      if (!previo) setVisible(true);
      else setAnalitica(previo.analitica);
    }, 600);
    const abrir = () => {
      setAnalitica(leerConsentimiento()?.analitica ?? false);
      setDetalle(true);
      setVisible(true);
    };
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(EVENTO_ABRIR, abrir);
    };
  }, []);

  if (!visible) return null;

  const decidir = (valor: boolean) => {
    guardarConsentimiento(valor);
    setVisible(false);
    setDetalle(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-3 bottom-3 z-50 max-w-[34rem] border border-tinta/15 bg-fondo p-5 text-tinta shadow-[0_18px_50px_-20px_rgba(29,23,22,0.45)] md:inset-x-auto md:right-6 md:bottom-6 md:max-w-[26rem] md:p-6"
    >
      <p className="text-[1.0625rem] leading-snug">
        Usamos almacenamiento técnico para que la web funcione. Si lo aceptas, también usaremos cookies de
        analítica para saber qué páginas se visitan. Más información en la{" "}
        <Link href="/cookies" className="enlace">
          política de cookies
        </Link>
        .
      </p>

      {detalle && (
        <fieldset className="mt-4 space-y-3 border-t border-tinta/10 pt-4 text-[1.0625rem]">
          <legend className="sr-only">Tipos de cookies</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked disabled className="mt-1.5 accent-granate" />
            <span>
              Técnicas <span className="text-piedra">— siempre activas, necesarias para la web</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={analitica}
              onChange={(e) => setAnalitica(e.target.checked)}
              className="mt-1.5 accent-granate"
            />
            <span>Analítica</span>
          </label>
        </fieldset>
      )}

      <div className="mt-5 flex flex-wrap gap-2 text-[1.0625rem]">
        {detalle ? (
          <button type="button" onClick={() => decidir(analitica)} className="bg-granate px-4 py-2 text-cal hover:bg-granate-oscuro">
            Guardar preferencias
          </button>
        ) : (
          <>
            <button type="button" onClick={() => decidir(true)} className="bg-granate px-4 py-2 text-cal hover:bg-granate-oscuro">
              Aceptar
            </button>
            <button type="button" onClick={() => decidir(false)} className="bg-granate px-4 py-2 text-cal hover:bg-granate-oscuro">
              Rechazar
            </button>
            <button type="button" onClick={() => setDetalle(true)} className="px-2 py-2 underline underline-offset-[0.2em]">
              Configurar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
