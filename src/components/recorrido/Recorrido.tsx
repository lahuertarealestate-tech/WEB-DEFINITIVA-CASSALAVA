"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/SmoothScroll";

/*
  Recorrido por scroll: un <canvas> fijo pinta un fotograma distinto según
  la posición del scroll (la técnica de las páginas de producto de Apple).

  Los fotogramas están en /public/recorrido/{escritorio,movil}/0000.webp…
  y se describen en /public/recorrido/manifest.json. Para cambiar el vídeo
  basta con ejecutar scripts/video-a-fotogramas.sh (ver README).
*/

type Juego = {
  carpeta: string;
  total: number;
  ancho: number;
  alto: number;
  ext: string;
  digitos: number;
};

type Manifest = {
  version: string;
  escritorio: Juego;
  movil: Juego;
  /** Progreso de scroll (0–1) de cada fotograma, para que la cámara avance a ritmo constante */
  ritmo?: number[];
};

export type Tramo = {
  /** Progreso del recorrido (0–1) en el que aparece el texto */
  desde: number;
  /** Progreso en el que desaparece */
  hasta: number;
  titulo: string;
  texto?: string;
  /** El primer tramo es el titular de la página */
  principal?: boolean;
  lado?: "izquierda" | "derecha";
};

const MAX_ESPERA_MS = 20000;
const CONCURRENCIA = 6;

function suave(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function Recorrido({ tramos }: { tramos: Tramo[] }) {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const textos = useRef<(HTMLDivElement | null)[]>([]);
  const pista = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const [porcentaje, setPorcentaje] = useState(0);
  const [listo, setListo] = useState(false);
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const canvas = lienzo.current;
    const sec = seccion.current;
    if (!canvas || !sec) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cancelado = false;
    let imagenes: (HTMLImageElement | null)[] = [];
    let total = 0;
    let ritmo: number[] | null = null;
    let actual = 0; // fotograma (con decimales) pintado
    let pintado = -1;
    let raf = 0;
    let terminado = false;

    // ---------------------------------------------------- bloqueo de scroll
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const html = document.documentElement;
    html.style.overflow = "hidden";
    const pararLenis = () => getLenis()?.stop();
    pararLenis();
    const reintento = window.setTimeout(pararLenis, 50);

    const desbloquear = () => {
      if (terminado) return;
      terminado = true;
      html.style.overflow = "";
      getLenis()?.start();
      setListo(true);
      window.setTimeout(() => !cancelado && setOculto(true), 900);
    };
    const limite = window.setTimeout(desbloquear, MAX_ESPERA_MS);

    // ---------------------------------------------------------- dibujo
    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        pintado = -1;
      }
    };

    const masCercana = (i: number) => {
      if (imagenes[i]) return imagenes[i];
      for (let d = 1; d < total; d++) {
        if (imagenes[i - d]) return imagenes[i - d];
        if (imagenes[i + d]) return imagenes[i + d];
      }
      return null;
    };

    const cubrir = (img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * escala;
      const dh = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const pintar = (pos: number) => {
      if (!total) return;
      // fotograma entero más cercano: mezclar dos fotogramas crea imágenes dobles
      const img = masCercana(Math.min(total - 1, Math.max(0, Math.round(pos))));
      if (img) cubrir(img);
    };

    const progreso = () => {
      const r = sec.getBoundingClientRect();
      const recorrido = r.height - window.innerHeight;
      return recorrido > 0 ? Math.min(1, Math.max(0, -r.top / recorrido)) : 0;
    };

    // progreso del scroll (0–1) → fotograma (con decimales)
    const fotogramaDe = (p: number) => {
      if (!ritmo || ritmo.length !== total) return p * (total - 1);
      let lo = 0;
      let hi = total - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ritmo[mid] <= p) lo = mid;
        else hi = mid;
      }
      const tramo = ritmo[hi] - ritmo[lo];
      return lo + (tramo > 0 ? Math.min(1, Math.max(0, (p - ritmo[lo]) / tramo)) : 0);
    };

    const actualizarTextos = (p: number) => {
      const fundido = 0.025;
      tramos.forEach((t, i) => {
        const el = textos.current[i];
        if (!el) return;
        const entra = t.desde <= 0 ? 1 : suave(t.desde, t.desde + fundido, p);
        const sale = t.hasta >= 1 ? 1 : 1 - suave(t.hasta - fundido, t.hasta, p);
        const o = entra * sale;
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * 28}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      if (pista.current) pista.current.style.opacity = String(1 - suave(0.01, 0.04, p));
      if (barra.current) barra.current.style.transform = `scaleY(${p})`;
    };

    const bucle = () => {
      raf = requestAnimationFrame(bucle);
      if (!total) return;
      const p = progreso();
      const objetivo = fotogramaDe(p);
      // pequeña inercia extra para que el táctil también sea suave
      actual += (objetivo - actual) * 0.35;
      if (Math.abs(objetivo - actual) < 0.01) actual = objetivo;
      if (Math.round(actual) !== pintado) {
        ajustar();
        pintar(actual);
        pintado = Math.round(actual);
      }
      actualizarTextos(p);
    };

    const alRedimensionar = () => {
      ajustar();
      pintar(actual);
    };
    window.addEventListener("resize", alRedimensionar);

    // ---------------------------------------------------------- precarga
    const movil = window.matchMedia("(max-width: 767px), (orientation: portrait) and (max-width: 1024px)").matches;

    fetch("/recorrido/manifest.json")
      .then((r) => r.json() as Promise<Manifest>)
      .then((m) => {
        if (cancelado) return;
        const juego = movil ? m.movil : m.escritorio;
        total = juego.total;
        ritmo = m.ritmo ?? null;
        imagenes = new Array(total).fill(null);
        const url = (i: number) =>
          `${juego.carpeta}/${String(i).padStart(juego.digitos, "0")}.${juego.ext}?v=${encodeURIComponent(m.version)}`;

        // orden: primero el fotograma 0, luego uno de cada 8, después el resto
        const orden: number[] = [0];
        for (const paso of [8, 4, 2, 1]) {
          for (let i = 0; i < total; i += paso) if (!orden.includes(i)) orden.push(i);
        }

        let hechos = 0;
        let siguiente = 0;
        const cargar = async (): Promise<void> => {
          while (siguiente < orden.length && !cancelado) {
            const i = orden[siguiente++];
            const img = new Image();
            img.decoding = "async";
            img.src = url(i);
            try {
              await img.decode();
              imagenes[i] = img;
              if (i === 0) {
                ajustar();
                pintar(0);
              }
            } catch {
              /* si un fotograma falla se usa el vecino más cercano */
            }
            hechos++;
            setPorcentaje(Math.round((hechos / total) * 100));
          }
        };
        Promise.all(Array.from({ length: CONCURRENCIA }, cargar)).then(() => {
          if (!cancelado) desbloquear();
        });
      })
      .catch(desbloquear);

    raf = requestAnimationFrame(bucle);

    return () => {
      cancelado = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(limite);
      window.clearTimeout(reintento);
      window.removeEventListener("resize", alRedimensionar);
      html.style.overflow = "";
      getLenis()?.start();
    };
  }, [tramos]);

  return (
    <section
      id="recorrido"
      ref={seccion}
      aria-label="Recorrido por una vivienda: de la fachada al interior y a la obra"
      className="relative h-[520vh] md:h-[720vh]"
    >
      <div className="sobre-oscuro sticky top-0 h-[100svh] w-full overflow-hidden bg-tinta text-cal">
        <canvas ref={lienzo} aria-hidden className="absolute inset-0 h-full w-full" />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/recorrido/escritorio/0000.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        </noscript>

        {/* velo para que el texto se lea sobre cualquier fotograma */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(20,10,9,0.72)_0%,rgba(20,10,9,0.25)_38%,rgba(20,10,9,0)_60%),linear-gradient(to_bottom,rgba(20,10,9,0.45)_0%,rgba(20,10,9,0)_22%)]"
        />

        {tramos.map((t, i) => {
          const Titulo = t.principal ? "h1" : "h2";
          return (
            <div
              key={t.titulo}
              ref={(el) => {
                textos.current[i] = el;
              }}
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              className={`absolute bottom-[11svh] px-5 will-change-transform md:bottom-[12svh] md:px-12 ${
                t.lado === "derecha" ? "right-0 text-left md:max-w-[36rem]" : "left-0 max-w-[48rem]"
              }`}
            >
              <Titulo
                className={
                  t.principal
                    ? "text-portada font-normal tracking-[-0.015em] text-balance"
                    : "text-titulo font-normal tracking-[-0.01em] text-balance"
                }
              >
                {t.titulo}
              </Titulo>
              {t.texto && (
                <p className="mt-4 max-w-[34rem] text-entradilla text-cal/85 md:mt-5">{t.texto}</p>
              )}
            </div>
          );
        })}

        <div
          ref={pista}
          aria-hidden
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-base text-cal/80 md:bottom-8"
        >
          <span>Desliza para entrar</span>
          <span className="block h-8 w-px animate-pulse bg-cal/70" />
        </div>

        {/* progreso del recorrido */}
        <div aria-hidden className="absolute right-4 top-1/2 h-[30svh] w-px -translate-y-1/2 bg-cal/25 md:right-8">
          <div ref={barra} className="h-full w-full origin-top scale-y-0 bg-cal" />
        </div>
      </div>

      {!oculto && (
        <div
          role="status"
          aria-live="polite"
          aria-label={`Cargando el recorrido: ${porcentaje} por ciento`}
          className={`precarga fixed inset-0 z-[60] flex flex-col items-center justify-center bg-granate text-cal transition-opacity duration-700 ease-[var(--ease-suave)] ${
            listo ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <p className="logo text-3xl md:text-5xl">CASSALAVA</p>
          <p className="mt-6 text-2xl text-cal/80 [font-variant-numeric:oldstyle-nums_tabular-nums]" aria-hidden>
            {porcentaje} %
          </p>
          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-cal/15">
            <div
              className="h-full origin-left bg-cal transition-transform duration-300"
              style={{ transform: `scaleX(${porcentaje / 100})` }}
            />
          </div>
        </div>
      )}
      <noscript>
        <style>{".precarga{display:none}"}</style>
      </noscript>
    </section>
  );
}
