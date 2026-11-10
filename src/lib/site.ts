// Datos generales de la empresa.
// ⚠️ PROVISIONALES: teléfono, email, dirección y datos fiscales son inventados.
// Cámbialos aquí y se actualizan en toda la web (cabecera, pie, contacto y legales).

export const site = {
  nombre: "CASSALAVA",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://cassalava.vercel.app",
  descripcion:
    "Estudio de arquitectura, diseño y construcción. Proyectamos y construimos viviendas de principio a fin, con un solo equipo.",

  contacto: {
    telefono: "+34 600 000 000",
    telefonoHref: "tel:+34600000000",
    email: "hola@cassalava.es",
    direccion: ["Calle Ejemplo 12, bajo", "28001 Madrid"],
    horario: "Lunes a viernes, de 9:00 a 18:00",
  },

  legal: {
    razonSocial: "CASSALAVA, S.L.",
    cif: "B00000000",
    domicilio: "Calle Ejemplo 12, bajo, 28001 Madrid",
    registro: "Registro Mercantil de Madrid, tomo 0000, folio 00, hoja M-000000",
  },

  redes: [
    { nombre: "Instagram", href: "https://instagram.com/" },
    { nombre: "LinkedIn", href: "https://linkedin.com/" },
  ],
} as const;

export const navegacion = [
  { href: "/servicios", texto: "Servicios" },
  { href: "/proyectos", texto: "Proyectos" },
  { href: "/nosotros", texto: "Nosotros" },
  { href: "/contacto", texto: "Contacto" },
] as const;
