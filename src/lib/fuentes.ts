import localFont from "next/font/local";

// Fuentes tomadas de cassabela.com: Cormorant Garamond (títulos) e Inter (textos pequeños).
// Se usan en la pantalla de carga y en el formulario de contacto.
export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  display: "swap",
});

export const inter = localFont({
  src: [
    { path: "../fonts/inter-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});
