import type { Metadata } from "next";
import PaginaLegal from "@/components/PaginaLegal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso legal",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: false },
};

export default function AvisoLegal() {
  const l = site.legal;
  return (
    <PaginaLegal titulo="Aviso legal">
      <h2>Titular de la web</h2>
      <p>
        En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico
        (LSSI-CE), se informa de que este sitio web pertenece a:
      </p>
      <ul>
        <li>Razón social: {l.razonSocial}</li>
        <li>CIF: {l.cif}</li>
        <li>Domicilio: {l.domicilio}</li>
        <li>Inscripción: {l.registro}</li>
        <li>Email: {site.contacto.email}</li>
        <li>Teléfono: {site.contacto.telefono}</li>
      </ul>

      <h2>Objeto</h2>
      <p>
        Esta web informa sobre los servicios de arquitectura, diseño de interiores y construcción de {site.nombre} y
        permite contactar con la empresa. El acceso es gratuito y no exige registro.
      </p>

      <h2>Condiciones de uso</h2>
      <p>
        Quien navega por la web se compromete a hacer un uso adecuado de sus contenidos y a no emplearlos para
        actividades ilícitas o que puedan dañar los derechos de {site.nombre} o de terceros.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, imágenes, planos, renders, logotipos y diseño de esta web son propiedad de {site.nombre} o se usan
        con autorización. No se permite su reproducción, distribución o transformación sin permiso por escrito.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        {site.nombre} no se hace responsable de los daños derivados de interrupciones del servicio, errores en los
        contenidos o del uso de enlaces a webs de terceros, cuyo contenido no controla.
      </p>

      <h2>Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a
        los juzgados y tribunales que correspondan conforme a la normativa vigente.
      </p>
    </PaginaLegal>
  );
}
