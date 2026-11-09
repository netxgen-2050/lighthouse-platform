// Tokens del bien común de Lighthouse VRN: valores de EJEMPLO para conversar en el equipo (spec bien-comun-tokens).
// Puro: sin React ni Next. Nada se emite, nada se cobra y nada está decidido. Todos los números salen de acá: las pantallas
// los leen (lo vigila `lib/lotes/sin-numeros-escritos.test.ts`).

export const VERSION_BIEN_COMUN = {
  version: "v0.1",
  fecha: "2026-11-08",
  fuente: "Exploración de Gus y Claude, 8-nov-2026 [criterio]",
} as const;

/** Nombre provisorio del token del bien común (Lighthouse es un faro). */
export const NOMBRE_TOKEN = "FARO";

/** Cantidad total de tokens, de ejemplo. */
export const SUMINISTRO = 10_000_000;

export type IdGrupoReparto = "lotes" | "venta" | "tesoro" | "netxgen";

/** Reparto del suministro, en partes por cien. Suma 100. */
export const REPARTO: readonly { id: IdGrupoReparto; pct: number }[] = [
  { id: "lotes", pct: 35 },
  { id: "venta", pct: 30 },
  { id: "tesoro", pct: 20 },
  { id: "netxgen", pct: 15 },
];

/** Tokens que trae cada m² de lote privado. */
export const FARO_POR_M2 = 10;

/** Aporte de entrada: parte de cada compra que va al tesoro del bien común (fracción). */
export const APORTE_DE_ENTRADA = 0.1;

/** Monto mínimo de la calculadora, en USD. */
export const MONTO_MINIMO_USD = 10;

/** Tramos de la venta temprana: cantidad y precio en USD por token. */
export const TRAMOS: readonly { cantidad: number; precio: number }[] = [
  { cantidad: 750_000, precio: 0.05 },
  { cantidad: 750_000, precio: 0.08 },
  { cantidad: 750_000, precio: 0.12 },
  { cantidad: 750_000, precio: 0.18 },
];

/** Avance de ejemplo: parte (fracción) del tramo 1 que ya estaría vendida. */
export const AVANCE_DE_EJEMPLO = { tramo: 0, fraccion: 0.4 } as const;

/** NetXGen: se libera en años, con un año de espera. */
export const LIBERACION_NETXGEN = { anios: 4, esperaAnios: 1 } as const;

/** Staking A: bloquear suma voz, sin tokens nuevos. Staking B: bloquear da tokens nuevos por año (fracción). */
export const STAKING = { mesesA: 12, anualB: 0.05 } as const;

/** Tokens que traería un lote de `m2` metros cuadrados. Sin superficie, null (nunca 0). */
export function faroDeLote(m2: number | null | undefined): number | null {
  if (typeof m2 !== "number" || !Number.isFinite(m2) || m2 <= 0) return null;
  return Math.round(m2 * FARO_POR_M2);
}

/** Centro de un contorno [longitud, latitud]: el promedio de sus vértices (sin contar el que cierra el anillo). Sin vértices, null. */
export function centroDeAnillo(anillo: readonly (readonly [number, number])[]): { lat: number; lng: number } | null {
  const abierto = anillo.length > 1 && anillo[0][0] === anillo[anillo.length - 1][0] && anillo[0][1] === anillo[anillo.length - 1][1]
    ? anillo.slice(0, -1)
    : anillo;
  if (abierto.length === 0) return null;
  const lng = abierto.reduce((s, p) => s + p[0], 0) / abierto.length;
  const lat = abierto.reduce((s, p) => s + p[1], 0) / abierto.length;
  return { lat, lng };
}

/** Cantidad de tokens de un grupo del reparto. */
export const faroDeGrupo = (id: IdGrupoReparto): number =>
  Math.round((SUMINISTRO * (REPARTO.find((g) => g.id === id)?.pct ?? 0)) / 100);

/** El reparto con sus tokens; los porcentajes suman 100. */
export const reparto = () => REPARTO.map((g) => ({ ...g, faro: faroDeGrupo(g.id) }));

/** Total en USD de un tramo, a su precio. */
export const totalPorTramo = () => TRAMOS.map((t) => ({ ...t, totalUsd: t.cantidad * t.precio }));

/** Lo que queda por vender de cada tramo, desde el avance de ejemplo. */
export function disponiblePorTramo(): number[] {
  return TRAMOS.map((t, i) =>
    i < AVANCE_DE_EJEMPLO.tramo ? 0 : i === AVANCE_DE_EJEMPLO.tramo ? Math.round(t.cantidad * (1 - AVANCE_DE_EJEMPLO.fraccion)) : t.cantidad,
  );
}

export type Cotizacion =
  | { ok: false; motivo: "monto-minimo" | "invalido" }
  | {
      ok: true;
      faro: number;
      precioPromedio: number;
      /** Índices (desde 0) de los tramos que toca. */
      tramos: number[];
      aporteAlTesoro: number;
      /** Dólares que no alcanzaron a usarse porque los tramos se agotan; 0 si todo entró. */
      sobrante: number;
    };

/** Cuántos tokens recibiría quien pusiera `usd`, recorriendo los tramos desde el avance de ejemplo. Es una simulación. */
export function cotizar(usd: number): Cotizacion {
  if (!Number.isFinite(usd) || usd < 0) return { ok: false, motivo: "invalido" };
  if (usd < MONTO_MINIMO_USD) return { ok: false, motivo: "monto-minimo" };
  const disponible = disponiblePorTramo();
  let resto = usd;
  let faro = 0;
  const tramos: number[] = [];
  for (let i = 0; i < TRAMOS.length && resto > 1e-9; i++) {
    if (disponible[i] <= 0) continue;
    const alcanza = resto / TRAMOS[i].precio;
    const tomo = Math.min(alcanza, disponible[i]);
    faro += tomo;
    resto -= tomo * TRAMOS[i].precio;
    tramos.push(i);
  }
  const usado = usd - resto;
  return {
    ok: true,
    faro: Math.floor(faro),
    precioPromedio: faro > 0 ? usado / faro : 0,
    tramos,
    aporteAlTesoro: usado * APORTE_DE_ENTRADA,
    sobrante: resto < 1e-6 ? 0 : resto,
  };
}
