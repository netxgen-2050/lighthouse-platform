// Bitácora de exposición (regla C11): qué se le mostró a la persona y cuándo.
// Funciones puras: el guardado en el navegador vive en `anotar-en-bitacora.ts`.

export type EntradaBitacora = {
  /** Fecha y hora ISO. */
  fecha: string;
  ruta: string;
  tipo: "estado-loteo" | "termino-legal";
  /** Clave del término, o id del proyecto en el estado del loteo. */
  clave: string;
  /** Qué se mostró, tal como se leía en pantalla. */
  mostrado: string;
  huella: string;
  borrador: boolean;
};

export type Bitacora = EntradaBitacora[];

export const MINUTOS_SIN_REPETIR = 30;
export const TOPE_ENTRADAS = 300;

/** Código corto y estable (djb2, 8 caracteres hexadecimales) del título y el texto mostrados. */
export function huella(titulo: string, texto: string): string {
  const s = `${titulo}\n${texto}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 33) + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function esEntrada(x: unknown): x is EntradaBitacora {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.fecha === "string" &&
    !Number.isNaN(Date.parse(e.fecha)) &&
    typeof e.ruta === "string" &&
    (e.tipo === "estado-loteo" || e.tipo === "termino-legal") &&
    typeof e.clave === "string" &&
    typeof e.mostrado === "string" &&
    typeof e.huella === "string" &&
    typeof e.borrador === "boolean"
  );
}

/** Lee la bitácora guardada. Si falta o es inválida, devuelve una bitácora vacía. */
export function leer(texto: string | null | undefined): Bitacora {
  if (!texto) return [];
  try {
    const v: unknown = JSON.parse(texto);
    return Array.isArray(v) ? v.filter(esEntrada) : [];
  } catch {
    return [];
  }
}

/**
 * Suma una entrada (la fecha la pone `ahora`). La misma cosa (tipo, clave, ruta y huella)
 * no se repite dentro de 30 minutos; se guardan como máximo las últimas 300.
 */
export function anotar(
  bitacora: Bitacora,
  entrada: Omit<EntradaBitacora, "fecha">,
  ahora: Date,
): Bitacora {
  const limite = ahora.getTime() - MINUTOS_SIN_REPETIR * 60_000;
  const repetida = bitacora.some(
    (e) =>
      e.tipo === entrada.tipo &&
      e.clave === entrada.clave &&
      e.ruta === entrada.ruta &&
      e.huella === entrada.huella &&
      Date.parse(e.fecha) >= limite,
  );
  if (repetida) return bitacora;
  const nueva = [...bitacora, { ...entrada, fecha: ahora.toISOString() }];
  return nueva.length > TOPE_ENTRADAS ? nueva.slice(nueva.length - TOPE_ENTRADAS) : nueva;
}
