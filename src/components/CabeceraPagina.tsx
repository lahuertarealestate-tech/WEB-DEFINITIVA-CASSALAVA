import Image from "next/image";

type Ilustracion = { src: string; ancho: number; alto: number };

export default function CabeceraPagina({
  titulo,
  entradilla,
  ilustracion,
  foto,
}: {
  titulo: string;
  entradilla?: string;
  /** Dibujo decorativo a la derecha del título (solo en pantallas anchas) */
  ilustracion?: Ilustracion;
  /** Foto a la derecha del texto, con la misma altura que el título y la entradilla (en móvil va debajo) */
  foto?: string;
}) {
  const conLado = Boolean(ilustracion || foto);
  return (
    <header className="mx-auto max-w-[92rem] px-5 pb-8 pt-[calc(72px+2.5rem)] md:px-12 md:pb-12 md:pt-[calc(72px+4rem)]">
      <div
        className={
          conLado ? `md:grid md:grid-cols-12 md:gap-8 lg:gap-12 ${foto ? "md:items-stretch" : "md:items-center"}` : undefined
        }
      >
        <div className={conLado ? "md:col-span-7" : undefined}>
          {/* Con foto, el bloque de texto se recorta a la altura de las mayúsculas arriba y a la línea base abajo,
              para que la foto empiece y acabe exactamente donde empieza y acaba el texto */}
          <h1
            className={`max-w-[16ch] text-portada font-normal tracking-[-0.015em] text-balance ${
              foto ? "md:[text-box:trim-start_cap_alphabetic]" : ""
            }`}
          >
            {titulo}
          </h1>
          {entradilla && (
            <p
              className={`mt-5 max-w-[40rem] text-entradilla text-tinta/80 ${
                foto ? "md:mt-7 md:[text-box:trim-end_cap_alphabetic]" : ""
              }`}
            >
              {entradilla}
            </p>
          )}
        </div>
        {ilustracion && (
          <div className="hidden md:col-span-5 md:flex md:justify-end">
            <Image
              src={ilustracion.src}
              alt=""
              width={ilustracion.ancho}
              height={ilustracion.alto}
              sizes="(min-width: 1536px) 560px, 40vw"
              priority
              className="h-auto w-full max-w-[560px]"
            />
          </div>
        )}
        {foto && (
          // En escritorio la foto se estira a la altura exacta del texto de al lado (de la parte de arriba
          // del título al final de la entradilla); en móvil va debajo, en formato 16:9.
          <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-yeso md:col-span-5 md:mt-0 md:aspect-auto">
            <Image
              src={foto}
              alt=""
              fill
              sizes="(min-width: 1536px) 580px, (min-width: 768px) 40vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}
