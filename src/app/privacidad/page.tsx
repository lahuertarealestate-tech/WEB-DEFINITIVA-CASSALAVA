import type { Metadata } from "next";
import PaginaLegal from "@/components/PaginaLegal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  alternates: { canonical: "/privacidad" },
  robots: { index: false },
};

export default function Privacidad() {
  const l = site.legal;
  return (
    <PaginaLegal titulo="Política de privacidad">
      <h2>Responsable del tratamiento</h2>
      <p>
        {l.razonSocial}, con CIF {l.cif} y domicilio en {l.domicilio}. Puedes escribirnos a{" "}
        <a href={`mailto:${site.contacto.email}`}>{site.contacto.email}</a> para cualquier cuestión sobre tus datos.
      </p>

      <h2>Qué datos tratamos</h2>
      <p>
        Los que nos facilitas en el formulario de contacto: nombre, email, teléfono, tipo de proyecto y el mensaje que
        escribas. No pedimos datos especialmente protegidos.
      </p>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Responder a tu consulta y, si lo deseas, concertar una visita.</li>
        <li>Preparar un presupuesto cuando nos lo pidas.</li>
      </ul>

      <h2>Base legal</h2>
      <p>
        Tu consentimiento, que das al marcar la casilla del formulario (artículo 6.1.a del RGPD), y, si llegamos a
        contratar, la ejecución del contrato (artículo 6.1.b).
      </p>

      <h2>Cuánto tiempo los conservamos</h2>
      <p>
        Mientras dure la relación comercial o, si no llega a producirse, un máximo de un año desde tu último contacto.
        Después se conservan bloqueados solo durante los plazos que exige la ley.
      </p>

      <h2>Con quién los compartimos</h2>
      <p>
        No cedemos tus datos a terceros salvo obligación legal. Usamos proveedores que tratan datos por nuestra cuenta
        con las garantías del RGPD: Vercel Inc. (alojamiento de la web) y Resend Inc. (envío de los emails del
        formulario). Pueden implicar transferencias internacionales amparadas por el Marco de Privacidad de Datos UE-EE.
        UU. o cláusulas contractuales tipo.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento, pedir la portabilidad de tus datos y
        retirar tu consentimiento escribiendo a {site.contacto.email}. Si consideras que no hemos atendido bien tu
        solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
      </p>
    </PaginaLegal>
  );
}
