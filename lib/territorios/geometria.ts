import type { Anillo, Punto } from "./biopueblo";

/**
 * ¿El punto está dentro del anillo? Ray casting. Un punto sobre el borde cuenta como DENTRO (se comprueba antes
 * del conteo, así el resultado no depende del sentido del anillo ni de cómo caiga el rayo).
 */
export function puntoEnAnillo(p: Punto, anillo: Anillo): boolean {
  const [x, y] = p;
  const n = anillo.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    if (sobreSegmento(p, anillo[j], anillo[i])) return true;
  }
  let dentro = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

function sobreSegmento(p: Punto, a: Punto, b: Punto): boolean {
  const cruz = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  if (Math.abs(cruz) > 1e-12) return false;
  return (
    p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1])
  );
}

/** Distancia aproximada en metros entre dos puntos [lng, lat] (haversine). */
export function distanciaM(a: Punto, b: Punto): number {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
