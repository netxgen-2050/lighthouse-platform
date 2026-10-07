/** Porcentaje entero (redondeado) de `parte` sobre `total`; null si no se puede calcular (no es 0). */
export function porcentaje(parte: number, total: number): number | null {
  if (!Number.isFinite(parte) || !Number.isFinite(total) || total <= 0) return null;
  return Math.round((parte / total) * 100);
}

/** Conversión de cada etapa respecto de la anterior; la primera no tiene. */
export function conversiones(etapas: readonly { valor: number }[]): (number | null)[] {
  return etapas.map((e, i) => (i === 0 ? null : porcentaje(e.valor, etapas[i - 1].valor)));
}

/** Ancho de la barra del embudo en % del máximo, con un mínimo de 1,5 para que se vea (como el mock-up). */
export function anchoBarra(valor: number, maximo: number): number {
  const p = maximo > 0 ? (valor / maximo) * 100 : 0;
  return Math.max(1.5, Math.min(100, p));
}

export function formatear(n: number | null | undefined): string {
  return n == null || Number.isNaN(n) ? "sin dato" : n.toLocaleString("es-AR");
}
