// Ingresos de la plataforma: traducción fiel de NS_Tokenomics/sim/platform_revenue_sim.py (v0.1, 2026-10-17).
// Todo es ilustrativo y deliberadamente no optimista; no es un pronóstico.

import { CONSUMO_MENSUAL_USD } from "./fuentes";

export const MESES = 36;
export const PARTE_ANUAL = 0.6;
/** USD por miembro que paga, por mes. */
export const ARPU = (PARTE_ANUAL * 100) / 12 + (1 - PARTE_ANUAL) * 10;
export const PRECIO_TRIBU = 60;
export const MINIMO_PASE_USD = 75000;

export type EscenarioPlataforma = "bajo" | "base" | "bueno";
export const IDS_PLATAFORMA: readonly EscenarioPlataforma[] = ["bajo", "base", "bueno"];

export type ParametrosPlataforma = {
  clave: EscenarioPlataforma;
  etiqueta: string;
  inicio: number;
  crecimiento: number;
  pagan: number;
  baja: number;
  tribus: readonly [number, number, number];
};

export const ESCENARIOS_PLATAFORMA: Record<EscenarioPlataforma, ParametrosPlataforma> = {
  bajo: { clave: "bajo", etiqueta: "Bajo", inicio: 300, crecimiento: 25, pagan: 0.03, baja: 0.03, tribus: [2, 4, 6] },
  base: {
    clave: "base",
    etiqueta: "Base (no optimista)",
    inicio: 500,
    crecimiento: 60,
    pagan: 0.05,
    baja: 0.025,
    tribus: [4, 8, 10],
  },
  bueno: { clave: "bueno", etiqueta: "Bueno", inicio: 800, crecimiento: 120, pagan: 0.07, baja: 0.02, tribus: [6, 12, 16] },
};

/** `round()` de Python 3: la mitad va al par (0,5 → 0; 1,5 → 2; 2,5 → 2; 3,5 → 4). `Math.round` cambiaría los totales. */
export function redondearComoPython(x: number): number {
  const piso = Math.floor(x);
  if (x - piso === 0.5) return piso % 2 === 0 ? piso : piso + 1;
  return Math.round(x);
}

export function tribusEn(mes: number, t: readonly [number, number, number]): number {
  if (mes <= 12) return redondearComoPython((t[0] * mes) / 12);
  if (mes <= 24) return redondearComoPython(t[0] + ((t[1] - t[0]) * (mes - 12)) / 12);
  return redondearComoPython(t[1] + ((t[2] - t[1]) * (mes - 24)) / 12);
}

export type FilaPlataforma = {
  mes: number;
  usuarios: number;
  pagan: number;
  tribus: number;
  ingreso: number;
  pctConsumo: number | null;
};

export type ResultadoPlataforma = {
  filas: FilaPlataforma[];
  total: number;
  mesesCubiertos: number | null;
};

export function correrPlataforma(p: ParametrosPlataforma): ResultadoPlataforma {
  const consumo = CONSUMO_MENSUAL_USD.valor;
  let usuarios = p.inicio;
  let pagan = usuarios * p.pagan;
  let total = 0;
  const filas: FilaPlataforma[] = [];
  for (let mes = 1; mes <= MESES; mes++) {
    usuarios += p.crecimiento;
    pagan = pagan * (1 - p.baja) + p.crecimiento * p.pagan;
    const tribus = tribusEn(mes, p.tribus);
    const ingreso = pagan * ARPU + tribus * PRECIO_TRIBU;
    total += ingreso;
    filas.push({ mes, usuarios, pagan, tribus, ingreso, pctConsumo: consumo ? ingreso / consumo : null });
  }
  return { filas, total, mesesCubiertos: consumo ? total / consumo : null };
}

/** Pase Fundador: cantidad vendida por nivel (Semilla USD 300 · Brote 1.500 · Raíz 5.000). */
export const PRECIOS_PASE = [300, 1500, 5000] as const;
export const PASE_ESCENARIOS: Record<EscenarioPlataforma, readonly [number, number, number]> = {
  bajo: [40, 15, 3],
  base: [70, 30, 6],
  bueno: [120, 50, 12],
};

export function recaudacionPase(escenario: EscenarioPlataforma): {
  recaudado: number;
  alcanzaMinimo: boolean;
  destino: "procomun";
} {
  const [s, b, r] = PASE_ESCENARIOS[escenario];
  const recaudado = s * PRECIOS_PASE[0] + b * PRECIOS_PASE[1] + r * PRECIOS_PASE[2];
  return { recaudado, alcanzaMinimo: recaudado >= MINIMO_PASE_USD, destino: "procomun" };
}
