import type { Anillo } from "@/lib/territorios/biopueblo";

/**
 * Los puntos (`x,y x,y …`) del polígono de un lote dentro de un cuadrado de `tam` px, con `margen` px de aire.
 * Respeta la proporción real (la longitud se achica con el coseno de la latitud) y el norte queda arriba.
 * Devuelve "" si el anillo no tiene al menos tres puntos.
 */
export function puntosDelPlano(anillo: Anillo, tam = 64, margen = 4): string {
  if (anillo.length < 3) return "";
  const lat0 = anillo.reduce((s, p) => s + p[1], 0) / anillo.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const xs = anillo.map((p) => p[0] * k);
  const ys = anillo.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const ancho = Math.max(...xs) - minX;
  const alto = maxY - Math.min(...ys);
  const lado = Math.max(ancho, alto);
  if (lado === 0) return "";
  const util = tam - margen * 2;
  const escala = util / lado;
  const dx = margen + (util - ancho * escala) / 2;
  const dy = margen + (util - alto * escala) / 2;
  const redondo = (n: number) => Math.round(n * 10) / 10;
  return anillo.map((_, i) => `${redondo(dx + (xs[i] - minX) * escala)},${redondo(dy + (maxY - ys[i]) * escala)}`).join(" ");
}

/** Plano del lote: su polígono dibujado en SVG, decorativo (el nombre y el estado van en texto al lado). */
export function PlanoLote({ anillo, tam = 64, className = "" }: { anillo: Anillo; tam?: number; className?: string }) {
  const puntos = puntosDelPlano(anillo, tam);
  return (
    <svg aria-hidden="true" focusable="false" width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} className={`shrink-0 ${className}`}>
      {puntos && <polygon points={puntos} fill="var(--color-green-soft)" stroke="var(--color-deep)" strokeWidth={2} strokeLinejoin="round" />}
    </svg>
  );
}
