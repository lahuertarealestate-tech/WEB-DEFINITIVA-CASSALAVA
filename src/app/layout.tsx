import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/lib/site";
import "./globals.css";

const garamond = localFont({
  src: [
    { path: "../fonts/eb-garamond-latin-wght-normal.woff2", weight: "400 800", style: "normal" },
    { path: "../fonts/eb-garamond-latin-wght-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--font-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "CASSALAVA | Arquitectura, diseño y construcción",
    template: "%s | CASSALAVA",
  },
  description: site.descripcion,
  applicationName: "CASSALAVA",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "CASSALAVA",
    images: [{ url: "/proyectos/casa-del-encinar.webp", width: 1600, height: 1000 }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: site.indexar ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#550000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${garamond.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="fixed left-3 top-3 z-[70] -translate-y-20 bg-granate px-4 py-2 text-cal focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <SmoothScroll />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
