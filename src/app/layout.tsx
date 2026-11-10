import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const garamond = localFont({
  src: [{ path: "../fonts/eb-garamond-latin-wght-normal.woff2", weight: "400 800", style: "normal" }],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "CASSALAVA | Arquitectura, diseño y construcción",
  description: "Estudio de arquitectura, diseño y construcción. Nueva web muy pronto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={garamond.variable}>
      <body>{children}</body>
    </html>
  );
}
