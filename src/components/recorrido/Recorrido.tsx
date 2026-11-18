"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/components/SmoothScroll";
import { cormorant, inter } from "@/lib/fuentes";
// El manifest va dentro del código: así no hay que esperar a descargarlo antes de pedir el primer fotograma
import datosManifest from "../../../public/recorrido/manifest.json";

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

const manifest = datosManifest as Manifest;
const urlFotograma = (juego: Juego, i: number) =>
  `${juego.carpeta}/${String(i).padStart(juego.digitos, "0")}.${juego.ext}?v=${encodeURIComponent(manifest.version)}`;

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
  /** Al desaparecer, el título se queda como marca en la esquina superior izquierda */
  marca?: boolean;
};

const MAX_ESPERA_MS = 20000;
/** Media query del juego vertical (móvil); el resto usa el horizontal */
const MQ_MOVIL = "(max-width: 767px), (orientation: portrait) and (max-width: 1024px)";
const MQ_ESCRITORIO = "(min-width: 768px) and (orientation: landscape), (min-width: 1025px)";
/** La precarga solo espera a los fotogramas del principio del recorrido (hasta este progreso) */
const ARRANQUE = 0.04;

function suave(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function Recorrido({ tramos }: { tramos: Tramo[] }) {
  const seccion = useRef<HTMLElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const textos = useRef<(HTMLDivElement | null)[]>([]);
  const marcas = useRef<(HTMLLIElement | null)[]>([]);
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
      // se mide con el bloque fijo (no con la ventana): en móvil la ventana cambia al ocultarse la barra
      const alto = canvas.parentElement?.clientHeight || window.innerHeight;
      const recorrido = r.height - alto;
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
      // fracción del recorrido que dura cada fundido de texto (el recorrido mide ~1500vh: ≈19vh de scroll)
      const fundido = 0.0125;
      tramos.forEach((t, i) => {
        const el = textos.current[i];
        if (!el) return;
        const entra = t.desde <= 0 ? 1 : suave(t.desde, t.desde + fundido, p);
        const sale = t.hasta >= 1 ? 1 : 1 - suave(t.hasta - fundido, t.hasta, p);
        const o = entra * sale;
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * 28}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
        // la marca aparece arriba a la izquierda mientras el texto grande se va
        const mk = marcas.current[i];
        if (mk) {
          // primero aparece la raya y después las letras, una a una, al ritmo del scroll
          const m = Math.min(1, Math.max(0, (p - (t.hasta - fundido * 0.6)) / (fundido * 2.2)));
          mk.style.opacity = m > 0 ? "1" : "0";
          const raya = mk.firstElementChild as HTMLElement | null;
          if (raya) raya.style.transform = `scaleX(${Math.min(1, m * 4)})`;
          const letras = mk.querySelectorAll<HTMLElement>("[data-letra]");
          const n = letras.length;
          const avance = Math.max(0, (m - 0.15) / 0.85) * (n + 2);
          letras.forEach((l, k) => {
            const o = Math.min(1, Math.max(0, avance - k));
            l.style.opacity = String(o);
            l.style.transform = `translate3d(0, ${(1 - o) * 0.25}em, 0)`;
          });
        }
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
    const movil = window.matchMedia(MQ_MOVIL).matches;
    const juego = movil ? manifest.movil : manifest.escritorio;
    total = juego.total;
    ritmo = manifest.ritmo ?? null;
    imagenes = new Array(total).fill(null);
    const pedido = new Uint8Array(total);

    // Para entrar solo hace falta el principio del recorrido (lo que se ve antes de hacer scroll):
    // el fotograma 0 y uno de cada 3 hasta ARRANQUE. Todo lo demás se descarga después, en segundo plano.
    let finArranque = 0;
    while (finArranque < total - 1 && (ritmo ? ritmo[finArranque] : finArranque / (total - 1)) < ARRANQUE) finArranque++;
    const arranque: number[] = [];
    for (let i = 0; i <= finArranque; i += 3) arranque.push(i);
    if (arranque[arranque.length - 1] !== finArranque) arranque.push(finArranque);
    const enArranque = new Set(arranque);

    // Orden de fondo: primero uno de cada 8 en todo el recorrido (ya se ve entero), luego más densidad
    const fondo: number[] = [];
    for (const paso of [8, 4, 2, 1]) for (let i = 0; i < total; i += paso) fondo.push(i);
    let cursorFondo = 0;
    let cursorArranque = 0;

    // Siguiente fotograma a pedir: primero el arranque; después, lo que tiene delante la posición
    // actual del scroll (para que nunca falte el fotograma que se va a ver); y si no, el orden de fondo.
    const siguienteFotograma = (): number => {
      while (cursorArranque < arranque.length) {
        const i = arranque[cursorArranque++];
        if (!pedido[i]) return i;
      }
      const cur = Math.max(0, Math.round(actual));
      for (const [paso, alcance] of [
        [4, 60],
        [2, 30],
        [1, 12],
      ]) {
        const desde = Math.ceil(cur / paso) * paso;
        for (let i = desde; i <= Math.min(total - 1, cur + alcance); i += paso) if (!pedido[i]) return i;
      }
      while (cursorFondo < fondo.length) {
        const i = fondo[cursorFondo++];
        if (!pedido[i]) return i;
      }
      return -1;
    };

    let hechosArranque = 0;
    const cargar = async (): Promise<void> => {
      while (!cancelado) {
        const i = siguienteFotograma();
        if (i < 0) return;
        pedido[i] = 1;
        const img = new Image();
        img.decoding = "async";
        if (i === 0) img.fetchPriority = "high";
        img.src = urlFotograma(juego, i);
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
        if (!terminado && enArranque.has(i)) {
          hechosArranque++;
          setPorcentaje(Math.round((hechosArranque / arranque.length) * 100));
          if (hechosArranque === arranque.length) desbloquear();
        }
      }
    };
    const concurrencia = movil ? 6 : 10;
    Promise.all(Array.from({ length: concurrencia }, cargar)).then(() => {
      if (!cancelado) desbloquear();
    });

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
      className="relative h-[1080vh] md:h-[1500vh]"
    >
      <div className="sobre-oscuro alto-recorrido sticky top-0 w-full overflow-hidden bg-tinta text-cal">
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
              className={`absolute bottom-[calc(11svh+var(--barra-movil,0px))] px-5 will-change-transform md:bottom-[calc(12svh+var(--barra-movil,0px))] md:px-12 ${
                t.lado === "derecha" ? "right-0 text-left md:max-w-[36rem]" : "left-0 max-w-[48rem]"
              }`}
            >
              <Titulo
                className={
                  t.principal
                    ? "text-[2.25rem] font-normal leading-none tracking-[-0.015em] sm:text-portada"
                    : "text-titulo font-normal tracking-[-0.01em] text-balance"
                }
              >
                {t.titulo.split("\n").map((linea) => (
                  <span key={linea} className="block whitespace-nowrap">
                    {linea}
                  </span>
                ))}
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
          className="absolute bottom-[calc(1.5rem+var(--barra-movil,0px))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-base text-cal/80 md:bottom-[calc(2rem+var(--barra-movil,0px))]"
        >
          <span>Desliza para entrar</span>
          <span className="block h-8 w-px animate-pulse bg-cal/70" />
        </div>

        {/* marcas: cada servicio se queda arriba a la izquierda al pasar su tramo */}
        <ul
          aria-hidden
          className="pointer-events-none absolute left-5 top-[calc(72px+3rem)] flex flex-col gap-3 md:left-12 md:top-[calc(72px+6rem)] md:gap-5"
        >
          {tramos.map((t, i) =>
            t.marca ? (
              <li
                key={t.titulo}
                ref={(el) => {
                  marcas.current[i] = el;
                }}
                style={{ opacity: 0 }}
                className="flex items-center gap-4 text-[1.625rem] leading-snug text-cal md:text-[2.25rem]"
              >
                <span className="block h-[2px] w-7 origin-left bg-cal/80 md:w-10" style={{ transform: "scaleX(0)" }} />
                <span className="whitespace-nowrap">
                  {Array.from(t.titulo).map((letra, k) => (
                    <span key={k} data-letra className="inline-block opacity-0">
                      {letra === " " ? "\u00a0" : letra}
                    </span>
                  ))}
                </span>
              </li>
            ) : null,
          )}
        </ul>

        {/* progreso del recorrido */}
        <div aria-hidden className="absolute right-4 top-1/2 h-[30svh] w-px -translate-y-1/2 bg-cal/25 md:right-8">
          <div ref={barra} className="h-full w-full origin-top scale-y-0 bg-cal" />
        </div>
      </div>

      {/* El primer fotograma se pide desde el <head>, antes de que cargue el JavaScript */}
      <link rel="preload" as="image" href={urlFotograma(manifest.escritorio, 0)} media={MQ_ESCRITORIO} fetchPriority="high" />
      <link rel="preload" as="image" href={urlFotograma(manifest.movil, 0)} media={MQ_MOVIL} fetchPriority="high" />

      {!oculto && (
        <div
          className={`precarga fixed inset-0 z-[60] flex items-center justify-center bg-granate text-cal transition-opacity duration-700 ease-[var(--ease-suave)] ${
            listo ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {/* Tipos y tamaños como la precarga de Cassabela, con los colores de CASSALAVA */}
          <div className="flex flex-col items-center px-5 text-center">
            <p
              className={`${cormorant.className} whitespace-nowrap text-[72px] leading-none tracking-[-0.05em] md:text-[128px]`}
            >
              CASSALAVA
            </p>
            <div
              role="progressbar"
              aria-label="Cargando el recorrido"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={porcentaje}
              className="mt-8 h-px w-[192px] overflow-hidden bg-cal/20"
            >
              <div
                className="h-full origin-left bg-cal transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${porcentaje / 100})` }}
              />
            </div>
            <p
              className={`${inter.className} mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[14px] uppercase leading-5 tracking-[0.4em] text-cal/60`}
            >
              {["Arquitectura", "Diseño", "Construcción"].map((palabra, k) => (
                <span key={palabra} className="precarga-palabra" style={{ animationDelay: `${0.3 + k * 0.45}s` }}>
                  {palabra}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}
      <noscript>
        <style>{".precarga{display:none}"}</style>
      </noscript>
    </section>
  );
}
