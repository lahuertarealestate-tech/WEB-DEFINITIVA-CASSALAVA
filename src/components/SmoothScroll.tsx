"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

let instancia: Lenis | null = null;

/** Devuelve la instancia de Lenis activa (o null con movimiento reducido). */
export function getLenis() {
  return instancia;
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });
    instancia = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      instancia = null;
    };
  }, []);

  // Al cambiar de página, volver arriba sin animación
  useEffect(() => {
    instancia?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
