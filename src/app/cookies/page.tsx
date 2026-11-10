import type { Metadata } from "next";
import AbrirCookies from "@/components/AbrirCookies";
import PaginaLegal from "@/components/PaginaLegal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  alternates: { canonical: "/cookies" },
  robots: { index: false },
};

export default function Cookies() {
  return (
    <PaginaLegal titulo="Política de cookies">
      <h2>Qué son</h2>
      <p>
        Las cookies y tecnologías similares (como el almacenamiento local del navegador) guardan pequeños datos en tu
        dispositivo cuando visitas una web.
      </p>

      <h2>Qué usamos en esta web</h2>
      <p>
        <strong>Técnicas (siempre activas).</strong> Guardamos en el almacenamiento local de tu navegador la elección
        que haces en el aviso de cookies, para no volver a preguntarte en cada visita. No requieren consentimiento.
      </p>
      <p>
        <strong>Analítica (solo si la aceptas).</strong> Por ahora {site.nombre} no usa cookies de analítica. Si las
        incorporamos, solo se activarán con tu consentimiento y las detallaremos aquí: nombre, proveedor, finalidad y
        duración.
      </p>

      <h2>Cómo cambiar tu elección</h2>
      <p>
        Puedes cambiar tu decisión en cualquier momento desde <AbrirCookies className="underline underline-offset-[0.2em]" />,
        o borrar los datos guardados desde la configuración de tu navegador.
      </p>
    </PaginaLegal>
  );
}
