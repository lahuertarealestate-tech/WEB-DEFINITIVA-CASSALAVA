import localFont from "next/font/local";

// Fuentes de la pantalla de carga (mismo tipo y tamaño que la de Cassabela)
export const cormorant = localFont({
  src: "../fonts/cormorant-garamond-latin-300-normal.woff2",
  weight: "300",
  display: "block",
});

export const inter = localFont({
  src: "../fonts/inter-latin-300-normal.woff2",
  weight: "300",
  display: "block",
});
