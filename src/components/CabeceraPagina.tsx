export default function CabeceraPagina({ titulo, entradilla }: { titulo: string; entradilla?: string }) {
  return (
    <header className="mx-auto max-w-[92rem] px-5 pb-14 pt-[calc(72px+4rem)] md:px-12 md:pb-20 md:pt-[calc(72px+7rem)]">
      <h1 className="max-w-[16ch] text-portada font-normal tracking-[-0.015em] text-balance">{titulo}</h1>
      {entradilla && <p className="mt-8 max-w-[40rem] text-entradilla text-tinta/80">{entradilla}</p>}
    </header>
  );
}
