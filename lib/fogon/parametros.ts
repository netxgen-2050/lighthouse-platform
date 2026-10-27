// Cómo se muestran los parámetros opcionales de una decisión. Puro: servidor y navegador dicen lo mismo.
import type { Idioma } from "@/lib/idioma/tipos";

/**
 * La fecha de cierre (AAAA-MM-DD) en lenguaje de la persona. Se formatea en UTC: `new Date("2026-11-15")` es medianoche
 * UTC y en Argentina (UTC−3) se vería el 14. Una fecha que no tiene esa forma devuelve null (se muestra "sin dato").
 */
export function formatearFechaCierre(cierra: string, idioma: Idioma): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cierra);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  if (Number.isNaN(fecha.getTime()) || fecha.getUTCDate() !== dia) return null;
  return new Intl.DateTimeFormat(idioma, { dateStyle: "long", timeZone: "UTC" }).format(fecha);
}

/** El monto en dólares (simulados). Una cantidad que no es un número finito es "sin dato" (null), nunca 0. */
export function formatearMonto(cantidad: number | null | undefined, idioma: Idioma): string | null {
  if (typeof cantidad !== "number" || !Number.isFinite(cantidad)) return null;
  return new Intl.NumberFormat(idioma, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cantidad);
}
