import FormularioContacto from "@/components/FormularioContacto";
import { cormorant, inter } from "@/lib/fuentes";
import { site } from "@/lib/site";

// Sección de contacto con el mismo formato que la de cassabela.com:
// columna izquierda con presentación y datos, formulario a la derecha.
// Medidas copiadas de su web (Cormorant Garamond + Inter), colores CASSALAVA.
export default function SeccionContacto({ como = "h2" }: { como?: "h1" | "h2" }) {
  const c = site.contacto;
  const Titulo = como;
  const etiqueta = `${inter.className} block text-[10px] font-bold uppercase tracking-[0.25em] text-granate/60`;
  const dato = `${cormorant.className} text-2xl font-normal text-granate transition-colors hover:text-granate/70`;
  return (
    <section id="contacto" aria-labelledby="titulo-contacto" className="scroll-mt-[72px] bg-cal text-granate">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between gap-8 lg:col-span-5 lg:self-stretch">
            <div>
              <span
                className={`${inter.className} mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-granate/60 md:text-[11px]`}
              >
                Contacto
              </span>
              <Titulo
                id="titulo-contacto"
                className={`${cormorant.className} mb-6 text-4xl font-light leading-tight tracking-[-0.025em] sm:text-5xl lg:text-6xl`}
              >
                Cuéntanos tu proyecto.
              </Titulo>
              <p className={`${inter.className} text-base font-light leading-relaxed text-granate/70 md:text-lg`}>
                Te respondemos en un día laborable para concertar una primera visita, sin compromiso. Dinos qué
                quieres hacer y dónde, y nos ponemos en marcha.
              </p>
            </div>

            <div className="space-y-6 border-t border-granate/15 pt-6">
              <div>
                <span className={etiqueta}>Email</span>
                <a href={`mailto:${c.email}`} className={dato}>
                  {c.email}
                </a>
              </div>
              <div>
                <span className={etiqueta}>Teléfono</span>
                <a href={c.telefonoHref} className={dato}>
                  {c.telefono}
                </a>
              </div>
              <div>
                <span className={etiqueta}>Estudio</span>
                <address className={`${dato} not-italic hover:text-granate`}>{c.direccion.join(", ")}</address>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <FormularioContacto />
          </div>
        </div>
      </div>
    </section>
  );
}
