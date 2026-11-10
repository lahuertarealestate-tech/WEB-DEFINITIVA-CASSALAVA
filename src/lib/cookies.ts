// Consentimiento de cookies. Se guarda en localStorage (no es una cookie).
// Ahora mismo la web solo usa almacenamiento técnico; cuando se añada
// analítica (p. ej. Vercel Analytics o Google Analytics), cárgala solo si
// leerConsentimiento()?.analitica es true.

export type Consentimiento = { analitica: boolean; fecha: string };

const CLAVE = "cassalava-consentimiento";
export const EVENTO_ABRIR = "cassalava:abrir-cookies";
export const EVENTO_CAMBIO = "cassalava:consentimiento";

export function leerConsentimiento(): Consentimiento | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v ? (JSON.parse(v) as Consentimiento) : null;
  } catch {
    return null;
  }
}

export function guardarConsentimiento(analitica: boolean) {
  const c: Consentimiento = { analitica, fecha: new Date().toISOString() };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    /* navegación privada: se volverá a preguntar */
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: c }));
}

export function abrirPanelCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}
