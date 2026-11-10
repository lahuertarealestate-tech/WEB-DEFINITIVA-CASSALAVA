import Link from "next/link";

export default function NoEncontrada() {
  return (
    <section className="mx-auto max-w-[92rem] px-5 pb-32 pt-[calc(72px+6rem)] md:px-12">
      <h1 className="text-portada font-normal">Esta página no existe</h1>
      <p className="mt-6 max-w-[36rem] text-entradilla text-tinta/80">
        Puede que el enlace haya cambiado. Desde la portada puedes llegar a cualquier sección.
      </p>
      <Link href="/" className="enlace mt-8 inline-block">
        Ir a la portada
      </Link>
    </section>
  );
}
