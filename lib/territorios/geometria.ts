// Geometría ILUSTRATIVA del Lighthouse, copiada de LH_POLY, barrioRect() y COMMONS_RECT del mock-up v6
// (docs/referencia/netx-tribus-mockup-v6.html). Coordenadas inventadas, a la espera del GIS de ARQVA.
// Para reemplazarla por el GeoJSON real basta cambiar este archivo: la pantalla no se toca.

/** Punto [longitud, latitud], como en GeoJSON. */
export type Punto = [number, number];
/** Anillo cerrado: el primer punto se repite al final. */
export type Poligono = Punto[];

export type GeometriaTerritorio = {
  ilustrativa: true;
  contorno: Poligono;
  nucleo: Poligono;
  /** Clave: número de barrio, 1 a 12. */
  barrios: Record<number, Poligono>;
};

const LH_W = -67.314;
const LH_E = -67.292;
const ROW_N: [number, number] = [-39.124, -39.132];
const CORE: [number, number] = [-39.1326, -39.1366];
const ROW_S: [number, number] = [-39.1372, -39.1452];
const GAP = 0.0004;

function rectangulo(x0: number, x1: number, y0: number, y1: number): Poligono {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
    [x0, y0],
  ];
}

/** i: 1 a 12. 1-6 fila norte de oeste a este; 7-12 fila sur. */
function barrioRect(i: number): Poligono {
  const col = (i - 1) % 6;
  const fila = i <= 6 ? ROW_N : ROW_S;
  const w = (LH_E - LH_W) / 6;
  return rectangulo(LH_W + col * w + GAP, LH_W + (col + 1) * w - GAP, fila[0], fila[1]);
}

const BARRIOS: Record<number, Poligono> = {};
for (let i = 1; i <= 12; i++) BARRIOS[i] = barrioRect(i);

const LIGHTHOUSE: GeometriaTerritorio = {
  ilustrativa: true,
  contorno: [
    [-67.3165, -39.113],
    [-67.307, -39.1145],
    [-67.298, -39.1165],
    [-67.2895, -39.1195],
    [-67.2895, -39.1495],
    [-67.3165, -39.15],
    [-67.3165, -39.113],
  ],
  nucleo: rectangulo(LH_W + GAP, LH_E - GAP, CORE[0], CORE[1]),
  barrios: BARRIOS,
};

const GEOMETRIAS: Record<string, GeometriaTerritorio> = { lighthouse: LIGHTHOUSE };

export function geometriaDe(id: string): GeometriaTerritorio | undefined {
  return Object.hasOwn(GEOMETRIAS, id) ? GEOMETRIAS[id] : undefined;
}
