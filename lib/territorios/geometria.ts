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

// --- Superposición y superficie (importador del loteo) ---

/**
 * Metros por grado en la zona del Lighthouse (lat ~ -39,1). Son los mismos factores de `boceto_loteo_norte.py`
 * (MX = 111320 × 0,7759, MY = 110540): así un lote de 32 × 42 m da 1.344 m².
 */
export const METROS_POR_GRADO_LNG = 111320 * 0.7759;
export const METROS_POR_GRADO_LAT = 110540;

/** Tolerancia con que se compara el borde de dos lotes vecinos: redondear a 6 decimales mueve un vértice ~10 cm. */
export const TOLERANCIA_BORDE_M = 0.5;

type Plano = [number, number];
const aMetros = (p: Punto): Plano => [p[0] * METROS_POR_GRADO_LNG, p[1] * METROS_POR_GRADO_LAT];

/** Área de un anillo en m² (fórmula del topógrafo sobre la proyección plana de arriba). */
export function areaM2(anillo: Anillo): number {
  const pts = anillo.map(aMetros);
  let s = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  return Math.abs(s) / 2;
}

function distanciaPuntoSegmentoM(p: Plano, a: Plano, b: Plano): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const largo2 = dx * dx + dy * dy;
  const t = largo2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / largo2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distancia en metros del punto al borde del anillo. */
export function distanciaAlBordeM(p: Punto, anillo: Anillo): number {
  const q = aMetros(p);
  const pts = anillo.map(aMetros);
  let min = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) min = Math.min(min, distanciaPuntoSegmentoM(q, pts[j], pts[i]));
  return min;
}

/**
 * ¿Los lados ab y cd se cruzan de verdad (no solo se tocan ni son colineales) y el cruce queda a más de `tol`
 * metros de los cuatro extremos?
 */
function seCruzan(a: Plano, b: Plano, c: Plano, d: Plano, tol: number): boolean {
  const r: Plano = [b[0] - a[0], b[1] - a[1]];
  const s: Plano = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return false; // paralelos o colineales
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  if (t <= 0 || t >= 1 || u <= 0 || u >= 1) return false;
  const lr = Math.hypot(r[0], r[1]);
  const ls = Math.hypot(s[0], s[1]);
  return t * lr > tol && (1 - t) * lr > tol && u * ls > tol && (1 - u) * ls > tol;
}

function ladosSeCruzan(a: Anillo, b: Anillo, tol: number): boolean {
  const pa = a.map(aMetros);
  const pb = b.map(aMetros);
  for (let i = 0, j = pa.length - 1; i < pa.length; j = i++) {
    for (let k = 0, l = pb.length - 1; k < pb.length; l = k++) {
      if (seCruzan(pa[j], pa[i], pb[l], pb[k], tol)) return true;
    }
  }
  return false;
}

/** Promedio de los vértices (sin repetir el de cierre). */
function centroide(anillo: Anillo): Punto {
  const cerrado = anillo.length > 1 && anillo[0][0] === anillo[anillo.length - 1][0] && anillo[0][1] === anillo[anillo.length - 1][1];
  const vertices = cerrado ? anillo.slice(0, -1) : anillo;
  const suma = vertices.reduce<Punto>((s, p) => [s[0] + p[0], s[1] + p[1]], [0, 0]);
  return [suma[0] / vertices.length, suma[1] / vertices.length];
}

/** Un punto está "bien adentro" si cae dentro del anillo y a más de `tol` metros de su borde. */
function bienAdentro(p: Punto, anillo: Anillo, tol: number): boolean {
  return puntoEnAnillo(p, anillo) && distanciaAlBordeM(p, anillo) > tol;
}

const MUESTRAS_POR_LADO = 25;

/**
 * Puntos apenas adentro del anillo, a lo largo de cada lado (a 1,5 × `tol` metros del borde). Sirven para los casos en
 * que todos los vértices de un anillo caen sobre el borde del otro: dos lotes iguales o corridos sobre una misma línea.
 */
function muestrasInteriores(anillo: Anillo, tol: number): Punto[] {
  const pts = anillo.map(aMetros);
  let signo = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) signo += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  const lado = signo >= 0 ? 1 : -1; // antihorario = el adentro queda a la izquierda
  const salida: Punto[] = [];
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j];
    const [bx, by] = pts[i];
    const largo = Math.hypot(bx - ax, by - ay);
    if (largo === 0) continue;
    const nx = (-(by - ay) / largo) * lado * tol * 1.5;
    const ny = ((bx - ax) / largo) * lado * tol * 1.5;
    for (let k = 0; k < MUESTRAS_POR_LADO; k++) {
      const t = (k + 0.5) / MUESTRAS_POR_LADO;
      salida.push([(ax + t * (bx - ax) + nx) / METROS_POR_GRADO_LNG, (ay + t * (by - ay) + ny) / METROS_POR_GRADO_LAT]);
    }
  }
  return salida;
}

/**
 * ¿Dos anillos se superponen? Compartir un lado (lotes vecinos) NO cuenta: un vértice de uno tiene que quedar dentro
 * del otro a más de `tol` metros de su borde, o dos lados tienen que cruzarse lejos de sus extremos. Cuando todos los
 * vértices caen sobre el borde del otro (lotes iguales o corridos sobre una misma línea) se prueban puntos apenas
 * adentro de cada lado: si están adentro del otro anillo, hay más de `tol` metros de solapamiento.
 */
export function seSuperponen(a: Anillo, b: Anillo, tol: number = TOLERANCIA_BORDE_M): boolean {
  if (a.some((p) => bienAdentro(p, b, tol)) || b.some((p) => bienAdentro(p, a, tol))) return true;
  if (ladosSeCruzan(a, b, tol)) return true;
  if (bienAdentro(centroide(a), b, tol) || bienAdentro(centroide(b), a, tol)) return true;
  return (
    muestrasInteriores(a, tol).some((p) => puntoEnAnillo(p, a) && bienAdentro(p, b, tol)) ||
    muestrasInteriores(b, tol).some((p) => puntoEnAnillo(p, b) && bienAdentro(p, a, tol))
  );
}

/** ¿El anillo `a` está dentro de `contenedor`? Todos sus vértices dentro y ningún lado cruza el borde. */
export function anilloDentro(a: Anillo, contenedor: Anillo): boolean {
  return a.every((p) => puntoEnAnillo(p, contenedor)) && !ladosSeCruzan(a, contenedor, 0);
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
