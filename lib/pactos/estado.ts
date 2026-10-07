import { HORAS, MONTO_USD, PARTE_SEMILLA } from "./datos";

/**
 * Clave de localStorage donde queda el pacto (simulado, solo en este navegador).
 * `semillas-libro` la lee: el JSON es un EstadoPactos y el pacto está aceptado si `paso === 2`.
 * No cambiar el valor: borraría lo ya guardado.
 */
export const CLAVE_PACTOS = "lh-pactos";

export type Pestana = "tiempo" | "plata" | "convivencia";
/** 0 = Borrador, 1 = En revisión, 2 = Aceptado. */
export type Paso = 0 | 1 | 2;

export type EstadoPactos = {
  pestana: Pestana;
  horas: number;
  parteSemilla: number;
  montoUsd: number;
  paso: Paso;
};

export const INICIAL: EstadoPactos = {
  pestana: "tiempo",
  horas: HORAS.inicial,
  parteSemilla: PARTE_SEMILLA.inicial,
  montoUsd: MONTO_USD.inicial,
  paso: 0,
};

export type Accion =
  | { tipo: "pestana"; pestana: Pestana }
  | { tipo: "horas"; horas: number }
  | { tipo: "parte"; parteSemilla: number }
  | { tipo: "monto"; montoUsd: number }
  | { tipo: "avanzar" };

function acotar(n: number, min: number, max: number, paso: number): number {
  const v = Math.min(max, Math.max(min, n));
  return Math.round((v - min) / paso) * paso + min;
}

export function reducir(e: EstadoPactos, a: Accion): EstadoPactos {
  switch (a.tipo) {
    case "pestana":
      return { ...e, pestana: a.pestana };
    case "horas":
      return { ...e, horas: acotar(a.horas, HORAS.min, HORAS.max, HORAS.paso) };
    case "parte":
      return { ...e, parteSemilla: acotar(a.parteSemilla, PARTE_SEMILLA.min, PARTE_SEMILLA.max, PARTE_SEMILLA.paso) };
    case "monto":
      return { ...e, montoUsd: acotar(a.montoUsd, MONTO_USD.min, MONTO_USD.max, MONTO_USD.paso) };
    case "avanzar":
      return e.paso >= 2 ? e : { ...e, paso: (e.paso + 1) as Paso };
  }
}

function numero(x: unknown, def: number, min: number, max: number, paso: number): number {
  return typeof x === "number" && Number.isFinite(x) ? acotar(x, min, max, paso) : def;
}

/** Lee lo guardado; cualquier cosa rara vuelve al valor inicial campo por campo. */
export function leer(crudo: string | null): EstadoPactos {
  if (!crudo) return INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    return {
      pestana: o.pestana === "plata" || o.pestana === "convivencia" ? o.pestana : "tiempo",
      horas: numero(o.horas, INICIAL.horas, HORAS.min, HORAS.max, HORAS.paso),
      parteSemilla: numero(o.parteSemilla, INICIAL.parteSemilla, PARTE_SEMILLA.min, PARTE_SEMILLA.max, PARTE_SEMILLA.paso),
      montoUsd: numero(o.montoUsd, INICIAL.montoUsd, MONTO_USD.min, MONTO_USD.max, MONTO_USD.paso),
      paso: o.paso === 1 || o.paso === 2 ? o.paso : 0,
    };
  } catch {
    return INICIAL;
  }
}
