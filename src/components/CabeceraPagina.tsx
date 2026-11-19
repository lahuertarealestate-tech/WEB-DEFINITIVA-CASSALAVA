export default function CabeceraPagina({
  titulo,
  entradilla,
  logo = false,
}: {
  titulo: string;
  entradilla?: string;
  /** Muestra el logo de CASSALAVA a la derecha del título (solo en pantallas anchas) */
  logo?: boolean;
}) {
  return (
    <header className="mx-auto max-w-[92rem] px-5 pb-8 pt-[calc(72px+2.5rem)] md:px-12 md:pb-12 md:pt-[calc(72px+4rem)]">
      <div className={logo ? "md:grid md:grid-cols-12 md:items-center md:gap-8" : undefined}>
        <div className={logo ? "md:col-span-7" : undefined}>
          <h1 className="max-w-[16ch] text-portada font-normal tracking-[-0.015em] text-balance">{titulo}</h1>
          {entradilla && <p className="mt-5 max-w-[40rem] text-entradilla text-tinta/80">{entradilla}</p>}
        </div>
        {logo && (
          <div aria-hidden className="hidden md:col-span-5 md:flex md:justify-end">
            {/* -mr compensa el espaciado de la última letra para que el logo quede alineado a la derecha */}
            <span className="logo -mr-[0.2em] whitespace-nowrap text-[2.75rem] leading-none text-granate lg:text-[3.75rem] xl:text-[4.5rem]">
              CASSALAVA
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
