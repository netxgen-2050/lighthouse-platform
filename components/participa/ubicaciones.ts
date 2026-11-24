// Dónde va cada equipo en el mapa ilustrado (viewBox 1200 × 900, norte arriba). `x, y` es el centro del suelo de la forma;
// la etiqueta (el cartel) se dibuja debajo. Los ids son los de `CIRCULOS_DEL_COMUN`.

export const ANCHO_MAPA = 1200;
export const ALTO_MAPA = 900;

export type Ubicacion = { x: number; y: number };

export const UBICACIONES: Record<string, Ubicacion> = {
  "comun-legal": { x: 168, y: 296 },
  "comun-token": { x: 404, y: 282 },
  "comun-cuidado": { x: 806, y: 232 },
  "comun-contratistas": { x: 1030, y: 338 },
  "comun-permacultura": { x: 296, y: 428 },
  "comun-agua": { x: 628, y: 358 },
  "comun-marketing": { x: 872, y: 530 },
  "comun-plataforma": { x: 900, y: 742 },
  "comun-gobernanza": { x: 596, y: 654 },
};

/** Lugares de reserva para un círculo nuevo sin ubicación propia: una grilla en la meseta, sin pisar las otras. */
export function ubicacionDe(circuloId: string, indice: number): Ubicacion {
  if (Object.hasOwn(UBICACIONES, circuloId)) return UBICACIONES[circuloId];
  return { x: 200 + (indice % 4) * 150, y: 760 + Math.floor(indice / 4) * 10 };
}

/** Las líneas de un nombre para el cartel: se parte en el espacio más cercano al medio si es largo. */
export function lineasDeNombre(nombre: string, maximo = 15): string[] {
  if (nombre.length <= maximo) return [nombre];
  const palabras = nombre.split(" ");
  let mejor = 1;
  let diferencia = Infinity;
  for (let i = 1; i < palabras.length; i++) {
    const izquierda = palabras.slice(0, i).join(" ").length;
    const derecha = palabras.slice(i).join(" ").length;
    const d = Math.abs(izquierda - derecha);
    if (d < diferencia) {
      diferencia = d;
      mejor = i;
    }
  }
  return [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
}
