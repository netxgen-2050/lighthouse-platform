import type { Anillo } from "@/lib/territorios/biopueblo";

// La vista satelital de un lote, armada con mosaicos del mismo servicio que el mapa. Puro: sin React ni red.
// Las coordenadas de salida son píxeles relativos al recuadro: los absolutos de Web Mercator pasan de 40 millones y el SVG no los dibuja.

// En esta zona, Esri no tiene imagen a zoom 18: devuelve un mosaico gris (4-nov-2026).
const ZOOM = 17;
const LADO = 256;
const PROPORCION = 16 / 9;
const MARGEN = 2; // qué tanto más grande que el lote se ve el recuadro

const aPixel = ([lng, lat]: [number, number] | number[]): [number, number] => {
  const n = 2 ** ZOOM * LADO;
  const sen = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * n, (0.5 - Math.log((1 + sen) / (1 - sen)) / (4 * Math.PI)) * n];
};

const urlDeMosaico = (x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${y}/${x}`;

export type VistaDeLote = {
  viewBox: string;
  trazo: number;
  mosaicos: { href: string; x: number; y: number; lado: number }[];
  contorno: [number, number][];
  vecinos: [number, number][][];
};

export function vistaDeLote(anillo: Anillo, otros: readonly Anillo[] = []): VistaDeLote {
  const contorno = anillo.map(aPixel);
  const xs = contorno.map((p) => p[0]);
  const ys = contorno.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Recuadro de 16:9 centrado en el lote, que lo contiene con margen.
  const alto = Math.max((maxY - minY) * MARGEN, ((maxX - minX) * MARGEN) / PROPORCION);
  const ancho = alto * PROPORCION;
  const izq = (minX + maxX) / 2 - ancho / 2;
  const arriba = (minY + maxY) / 2 - alto / 2;

  const mosaicos: VistaDeLote["mosaicos"] = [];
  for (let tx = Math.floor(izq / LADO); tx <= Math.floor((izq + ancho) / LADO); tx++) {
    for (let ty = Math.floor(arriba / LADO); ty <= Math.floor((arriba + alto) / LADO); ty++) {
      mosaicos.push({ href: urlDeMosaico(tx, ty), x: tx * LADO - izq, y: ty * LADO - arriba, lado: LADO });
    }
  }
  const relativo = (a: [number, number][]): [number, number][] => a.map(([x, y]) => [x - izq, y - arriba]);
  const dentro = (a: [number, number][]) => a.some(([x, y]) => x >= 0 && x <= ancho && y >= 0 && y <= alto);
  return {
    viewBox: `0 0 ${ancho} ${alto}`,
    trazo: alto / 90,
    mosaicos,
    contorno: relativo(contorno),
    vecinos: otros.map((o) => relativo(o.map(aPixel))).filter(dentro),
  };
}
