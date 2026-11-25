// Geometría y azar determinista para dibujar la ilustración de Participa a mano, sin librerías.
// Todo es puro y repetible: el mismo número da el mismo dibujo en el servidor y en el navegador (sin Math.random).

export type Punto = readonly [number, number];

/** Generador de azar repetible (mulberry32): devuelve números en [0, 1). */
export function azar(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number): string => (Math.round(n * 10) / 10).toString();

/** Segmento de Catmull-Rom entre p1 y p2, como curva de Bézier cúbica con los puntos de control c1 y c2. */
function control(p0: Punto, p1: Punto, p2: Punto, p3: Punto): [Punto, Punto] {
  return [
    [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
    [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
  ];
}

/** Curva suave que pasa por los puntos (cerrada o abierta), como `d` de un path. */
export function suave(puntos: readonly Punto[], cerrada = false): string {
  const n = puntos.length;
  if (n < 2) return "";
  const en = (i: number): Punto => (cerrada ? puntos[((i % n) + n) % n] : puntos[Math.min(Math.max(i, 0), n - 1)]);
  let d = `M${r1(puntos[0][0])} ${r1(puntos[0][1])}`;
  const segmentos = cerrada ? n : n - 1;
  for (let i = 0; i < segmentos; i++) {
    const [c1, c2] = control(en(i - 1), en(i), en(i + 1), en(i + 2));
    const p2 = en(i + 1);
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return cerrada ? `${d}Z` : d;
}

/** Un punto de la curva abierta que pasa por `puntos`, con `t` entre 0 y 1 a lo largo de todos los segmentos. */
export function puntoEnCurva(puntos: readonly Punto[], t: number): Punto {
  const n = puntos.length;
  const segmentos = n - 1;
  const x = Math.min(Math.max(t, 0), 1) * segmentos;
  const i = Math.min(Math.floor(x), segmentos - 1);
  const u = x - i;
  const en = (k: number): Punto => puntos[Math.min(Math.max(k, 0), n - 1)];
  const [c1, c2] = control(en(i - 1), en(i), en(i + 1), en(i + 2));
  const p0 = en(i);
  const p3 = en(i + 1);
  const m = 1 - u;
  const f = (k: 0 | 1) => m * m * m * p0[k] + 3 * m * m * u * c1[k] + 3 * m * u * u * c2[k] + u * u * u * p3[k];
  return [f(0), f(1)];
}

/** Muestras repartidas a lo largo de la curva. */
export function muestrear(puntos: readonly Punto[], cantidad: number): Punto[] {
  return Array.from({ length: cantidad }, (_, i) => puntoEnCurva(puntos, cantidad === 1 ? 0 : i / (cantidad - 1)));
}

/** Forma orgánica cerrada (una mancha, una copa, una piedra): una elipse con el borde irregular. */
export function mancha(cx: number, cy: number, rx: number, ry: number, semilla: number, irregular = 0.12, vertices = 9): string {
  const a = azar(semilla);
  const pts: Punto[] = Array.from({ length: vertices }, (_, i) => {
    const ang = (i / vertices) * Math.PI * 2 + a() * 0.25;
    const k = 1 + (a() - 0.5) * 2 * irregular;
    return [cx + Math.cos(ang) * rx * k, cy + Math.sin(ang) * ry * k] as Punto;
  });
  return suave(pts, true);
}

/** Arco de elipse entre dos ángulos (en radianes, el eje y va hacia abajo), como `d` de un path. */
export function arcoDeElipse(cx: number, cy: number, rx: number, ry: number, desde: number, hasta: number): string {
  const x0 = cx + Math.cos(desde) * rx;
  const y0 = cy + Math.sin(desde) * ry;
  const x1 = cx + Math.cos(hasta) * rx;
  const y1 = cy + Math.sin(hasta) * ry;
  const grande = Math.abs(hasta - desde) > Math.PI ? 1 : 0;
  return `M${r1(x0)} ${r1(y0)}A${r1(rx)} ${r1(ry)} 0 ${grande} 1 ${r1(x1)} ${r1(y1)}`;
}

/** Interpola linealmente el valor de una polilínea (x, y) en una posición x. */
export function yEn(linea: readonly Punto[], x: number): number {
  if (x <= linea[0][0]) return linea[0][1];
  for (let i = 1; i < linea.length; i++) {
    if (x <= linea[i][0]) {
      const [xa, ya] = linea[i - 1];
      const [xb, yb] = linea[i];
      return ya + ((x - xa) / (xb - xa)) * (yb - ya);
    }
  }
  return linea[linea.length - 1][1];
}

/** Distancia entre dos puntos. */
export function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/** Redondea a un decimal para que el HTML del servidor y el del navegador coincidan siempre. */
export function n1(n: number): number {
  return Math.round(n * 10) / 10;
}
