export default function PaginaLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-[92rem] px-5 pb-28 pt-[calc(72px+4rem)] md:px-12 md:pt-[calc(72px+6rem)]">
      <h1 className="text-titulo font-normal">{titulo}</h1>
      <p className="mt-4 text-piedra">Última actualización: noviembre de 2026</p>
      {/* ⚠️ Texto orientativo: revisar con un asesor legal antes de publicar en main */}
      <div className="prosa mt-10 max-w-[44rem]">{children}</div>
    </article>
  );
}
