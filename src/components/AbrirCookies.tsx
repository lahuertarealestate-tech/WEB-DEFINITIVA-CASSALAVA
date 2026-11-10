"use client";

import { abrirPanelCookies } from "@/lib/cookies";

export default function AbrirCookies({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={abrirPanelCookies}>
      Configurar cookies
    </button>
  );
}
