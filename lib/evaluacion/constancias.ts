import { HOUR_REF_USD } from "@/lib/pactos/datos";
import { semillasDelMes } from "@/lib/semillas/calculo";
import { PARAMETROS_DE_PARTIDA, VERSION_EVALUACION } from "./parametros";
import type { Parametros, Resultado } from "./tipos";

export type Constancia = {
  uid: string;
  schema: "semillas-base" | "semillas-ajuste";
  afirma: "netx";
  sobre: string;
  apunta_a: string | null;
  datos: Record<string, string | number>;
  creada_en: string;
  revocada_en: null;
  vence_en: null;
};

const CREADA_EN = "2026-10-31T00:00:00Z";

export type EntradaConstancias = {
  comunidad: string;
  periodo: string;
  pacto: string;
  /** Horas confirmadas de la ronda (un mes) de un pacto de horas fijas. */
  horas: number;
  resultado: Resultado;
  parametros?: Partial<Parametros>;
};

/** Semillas ajustadas sobre la base ya emitida, sin error de coma flotante (50 × 1,05 = 52,5 → 53). */
export function semillasAjustadas(base: number, factor: number): number {
  return Math.round(Number((base * factor).toFixed(6)));
}

/** Constancia base y de ajuste de una ronda cerrada (ADR-012). Afirma NetX, nunca una persona. Sin ids ni motivos. */
export function constanciasDeRonda(e: EntradaConstancias): { base: Constancia; ajuste: Constancia } {
  const p: Parametros = { ...PARAMETROS_DE_PARTIDA, ...e.parametros };
  const semillasBase = semillasDelMes(e.horas);
  const uidBase = `ejemplo-base-${e.comunidad}-${e.periodo}`;
  const base: Constancia = {
    uid: uidBase,
    schema: "semillas-base",
    afirma: "netx",
    sobre: e.comunidad,
    apunta_a: null,
    datos: {
      pacto: e.pacto,
      horas: e.horas,
      valor_hora_usd: HOUR_REF_USD,
      periodo: e.periodo,
      version_pacto: "v1-ejemplo",
      semillas: semillasBase,
    },
    creada_en: CREADA_EN,
    revocada_en: null,
    vence_en: null,
  };
  const ajuste: Constancia = {
    uid: `ejemplo-ajuste-${e.comunidad}-${e.periodo}-f${Math.round(e.resultado.fuerza * 100)}`,
    schema: "semillas-ajuste",
    afirma: "netx",
    sobre: e.comunidad,
    apunta_a: uidBase,
    datos: {
      f_eval: e.resultado.factor,
      semillas: semillasAjustadas(semillasBase, e.resultado.factor),
      version_evaluacion: VERSION_EVALUACION,
      fuerza: e.resultado.fuerza,
      agregado: p.agregado,
      reciprocidad_activa: p.reciprocidadActiva ? "si" : "no",
      umbral_reciprocidad: p.umbralReciprocidad,
      tope_por_evaluador: p.topePorEvaluador,
      minimo_evaluadores: p.minimoEvaluadores,
      peso_rol: p.pesoRol,
      evaluadores_rol: e.resultado.dimensiones.rol.evaluadores,
      evaluadores_cultura: e.resultado.dimensiones.cultura.evaluadores,
    },
    creada_en: CREADA_EN,
    revocada_en: null,
    vence_en: null,
  };
  return { base, ajuste };
}
