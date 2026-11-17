export default function PaginaLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-[92rem] px-5 pb-16 pt-[calc(72px+2.5rem)] md:px-12 md:pt-[calc(72px+3.5rem)]">
      <h1 className="text-titulo font-normal">{titulo}</h1>
      <p className="mt-4 text-piedra">Última actualización: noviembre de 2026</p>
      {/* ⚠️ Texto orientativo: revisar con un asesor legal antes de publicar en main */}
      <div className="prosa mt-6 max-w-[44rem]">{children}</div>
    </article>
  );
}
