import type { Metadata } from "next";
import SeccionContacto from "@/components/SeccionContacto";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Cuéntanos tu proyecto de arquitectura, reforma o construcción y te llamamos para concertar una primera visita.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  return (
    <div className="pt-[72px]">
      <SeccionContacto como="h1" />
    </div>
  );
}
