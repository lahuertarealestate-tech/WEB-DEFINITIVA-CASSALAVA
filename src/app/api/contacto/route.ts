import { Resend } from "resend";

/*
  Envía por email el formulario de contacto usando Resend.
  Variables de entorno (Vercel → Settings → Environment Variables):
    RESEND_API_KEY      clave de API de Resend
    CONTACT_TO_EMAIL    dónde se reciben los mensajes (p. ej. hola@cassalava.es)
    CONTACT_FROM_EMAIL  remitente verificado en Resend (p. ej. "Web CASSALAVA <web@cassalava.es>")
*/

type Datos = {
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  tipo?: unknown;
  mensaje?: unknown;
  privacidad?: unknown;
  web?: unknown;
};

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function respuesta(status: number, body: Record<string, unknown>) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let d: Datos;
  try {
    d = (await request.json()) as Datos;
  } catch {
    return respuesta(400, { error: "El formulario no ha llegado bien. Vuelve a intentarlo." });
  }

  // Campo trampa relleno: es un bot. Respondemos como si todo fuera bien.
  if (texto(d.web, 200)) return respuesta(200, { ok: true });

  const nombre = texto(d.nombre, 120);
  const email = texto(d.email, 200);
  const telefono = texto(d.telefono, 40);
  const tipo = texto(d.tipo, 60);
  const mensaje = texto(d.mensaje, 5000);

  if (!nombre || !mensaje) return respuesta(400, { error: "Escribe tu nombre y cuéntanos el proyecto." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respuesta(400, { error: "Revisa el email: no parece válido." });
  if (d.privacidad !== true) return respuesta(400, { error: "Acepta la política de privacidad para enviar el mensaje." });

  const clave = process.env.RESEND_API_KEY;
  const para = process.env.CONTACT_TO_EMAIL;
  const de = process.env.CONTACT_FROM_EMAIL ?? "Web CASSALAVA <onboarding@resend.dev>";
  if (!clave || !para) {
    console.error("Contacto: faltan RESEND_API_KEY o CONTACT_TO_EMAIL");
    return respuesta(503, {
      error: "El formulario todavía no está activo. Escríbenos por email o llámanos mientras tanto.",
    });
  }

  const resend = new Resend(clave);
  const { error } = await resend.emails.send({
    from: de,
    to: para.split(",").map((s) => s.trim()),
    replyTo: email,
    subject: `Nueva consulta web: ${tipo || "Proyecto"} — ${nombre}`,
    text: [
      `Nombre: ${nombre}`,
      `Email: ${email}`,
      `Teléfono: ${telefono || "—"}`,
      `Tipo de proyecto: ${tipo || "—"}`,
      "",
      mensaje,
    ].join("\n"),
  });

  if (error) {
    console.error("Contacto: error de Resend", error);
    return respuesta(502, { error: "No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos." });
  }
  return respuesta(200, { ok: true });
}
