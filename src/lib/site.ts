// Datos generales de la empresa.
// Teléfono, email y dirección: reales. ⚠️ Razón social, CIF y registro siguen siendo provisionales.
// Cámbialos aquí y se actualizan en toda la web (cabecera, pie, contacto y legales).

export const site = {
  nombre: "CASSALAVA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cassalava2.vercel.app",
  // Mientras haya datos provisionales, la web pide a Google que no la indexe.
  // Cámbialo a true cuando el contenido sea definitivo.
  indexar: false,
  descripcion:
    "Estudio de arquitectura, diseño y construcción. Proyectamos y construimos viviendas de principio a fin, con un solo equipo.",

  contacto: {
    telefono: "618 666 937",
    telefonoHref: "tel:+34618666937",
    email: "info@cassalava.com",
    direccion: ["Calle de Blasco de Garay, 61", "Madrid"],
    horario: "Lunes a viernes, de 9:00 a 18:00",
  },

  legal: {
    razonSocial: "CASSALAVA, S.L.",
    cif: "B00000000",
    domicilio: "Calle de Blasco de Garay, 61, Madrid",
    registro: "Registro Mercantil de Madrid, tomo 0000, folio 00, hoja M-000000",
  },

  redes: [
    { nombre: "Instagram", href: "https://instagram.com/" },
    { nombre: "LinkedIn", href: "https://linkedin.com/" },
  ],
} as const;

export const navegacion = [
  { href: "/servicios", texto: "Servicios" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/contacto", texto: "Contacto" },
] as const;
