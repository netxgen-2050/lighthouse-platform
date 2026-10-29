// Constancia base de Semillas de un pacto puntual verificado (forma de ADR-012; ADR-020; design §3 de
// pacto-puntual-verificacion). Se guarda congelada: nunca se recalcula ni se edita. Sin email ni nombre.
import { repartirConTopeTotal, type Tope } from "@/lib/tribus/necesidades";
import { type ConstanciaPacto, horasDeConstancia } from "./constancias";
import { HOUR_REF_USD } from "./datos";
import type { YaRepartido } from "./horas";
import { mesDe } from "./mes";

export type ConstanciaBase = {
  /** `ejemplo-base-puntual-<id de la postulación pre-admitida>`: una por persona y tarea. */
  uid: string;
  schema: "semillas-base";
  afirma: "netx";
  /** `puntual:<comunidad>:<necesidadId>` (la tarea; la persona la da `datos.pacto`). */
  sobre: string;
  apunta_a: null;
  datos: {
    tipo: "puntual";
    pacto: string;
    necesidad: string;
    fecha_tarea: string;
    horas: number;
    horas_con_semillas: number;
    horas_sin_semillas: number;
    tope_unidad: "horas" | "semillas" | null;
    tope_valor: number | null;
    tope_total_unidad: "horas" | "semillas" | null;
    tope_total_valor: number | null;
    valor_hora_usd: number;
    periodo: string;
    version_pacto: 1;
    confirmacion: string;
    semillas: number;
  };
  /** ISO: el `cuando` de la verificación (no el reloj de quien concilia). */
  creada_en: string;
  revocada_en: null;
  vence_en: null;
};

export const PREFIJO_UID_BASE = "ejemplo-base-puntual-";

/** Lo que la constancia necesita saber del pacto puntual pre-admitido. */
export type PuntualVisto = {
  necesidadId: string;
  /** Id de la postulación pre-admitida de esta persona. */
  postulacionId: string;
  fecha: string;
  tope: Tope | null;
  topeTotal: Tope | null;
};

/**
 * Arma la constancia base de una verificación. Las horas salen de la confirmación (lo que vio el holón). `ya` es lo repartido por
 * las verificaciones anteriores de la misma tarea (máximo total, por orden de verificación).
 */
export function constanciaBasePuntual(
  comunidad: string,
  p: PuntualVisto,
  confirmacion: ConstanciaPacto,
  ya: YaRepartido = { horasConSemillas: 0, semillas: 0 },
): ConstanciaBase | null {
  const horas = horasDeConstancia(confirmacion);
  if (horas === null) return null;
  let resto: Tope | null = p.topeTotal;
  if (p.topeTotal) {
    const gastado = p.topeTotal.unidad === "horas" ? ya.horasConSemillas : ya.semillas;
    resto = { unidad: p.topeTotal.unidad, valor: Math.max(0, p.topeTotal.valor - gastado) };
  }
  const r = repartirConTopeTotal([{ persona: p.postulacionId, horas }], p.tope, resto, HOUR_REF_USD).personas[0];
  return {
    uid: `${PREFIJO_UID_BASE}${p.postulacionId}`,
    schema: "semillas-base",
    afirma: "netx",
    sobre: `puntual:${comunidad}:${p.necesidadId}`,
    apunta_a: null,
    datos: {
      tipo: "puntual",
      pacto: p.postulacionId,
      necesidad: p.necesidadId,
      fecha_tarea: p.fecha,
      horas,
      horas_con_semillas: r.horasConSemillas,
      horas_sin_semillas: r.horasSinSemillas,
      tope_unidad: p.tope?.unidad ?? null,
      tope_valor: p.tope?.valor ?? null,
      tope_total_unidad: p.topeTotal?.unidad ?? null,
      tope_total_valor: p.topeTotal?.valor ?? null,
      valor_hora_usd: HOUR_REF_USD,
      periodo: mesDe(confirmacion.cuando),
      version_pacto: 1,
      confirmacion: confirmacion.id,
      semillas: r.semillas,
    },
    creada_en: confirmacion.cuando,
    revocada_en: null,
    vence_en: null,
  };
}

const entero = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0;
const finito = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0;
const texto = (x: unknown): x is string => typeof x === "string" && x.length > 0;
const unidad = (x: unknown): x is "horas" | "semillas" => x === "horas" || x === "semillas";

/** Lee una constancia guardada. Valida tipos y números finitos, pero NO recalcula: se lee tal como se guardó. */
export function leerConstanciaBase(x: unknown): ConstanciaBase | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  const d = o.datos;
  if (typeof d !== "object" || d === null) return null;
  const a = d as Record<string, unknown>;
  if (!texto(o.uid) || !o.uid.startsWith("ejemplo-") || o.schema !== "semillas-base" || o.afirma !== "netx" || o.apunta_a !== null) return null;
  if (!texto(o.sobre) || !texto(o.creada_en) || Number.isNaN(Date.parse(o.creada_en))) return null;
  if (a.tipo !== "puntual" || !texto(a.pacto) || !texto(a.necesidad) || !texto(a.fecha_tarea) || !texto(a.confirmacion) || !texto(a.periodo)) return null;
  if (!entero(a.horas) || a.horas < 1 || !entero(a.horas_con_semillas) || !entero(a.horas_sin_semillas) || a.horas_con_semillas + a.horas_sin_semillas !== a.horas) return null;
  if (!entero(a.semillas) || !finito(a.valor_hora_usd) || a.version_pacto !== 1) return null;
  const tope = unidad(a.tope_unidad) && entero(a.tope_valor) ? { u: a.tope_unidad, v: a.tope_valor } : null;
  if ((a.tope_unidad !== null && a.tope_unidad !== undefined && !tope) || (tope === null && a.tope_valor != null)) return null;
  const total = unidad(a.tope_total_unidad) && entero(a.tope_total_valor) ? { u: a.tope_total_unidad, v: a.tope_total_valor } : null;
  if ((a.tope_total_unidad != null && !total) || (total === null && a.tope_total_valor != null)) return null;
  return {
    uid: o.uid,
    schema: "semillas-base",
    afirma: "netx",
    sobre: o.sobre,
    apunta_a: null,
    datos: {
      tipo: "puntual",
      pacto: a.pacto,
      necesidad: a.necesidad,
      fecha_tarea: a.fecha_tarea,
      horas: a.horas,
      horas_con_semillas: a.horas_con_semillas,
      horas_sin_semillas: a.horas_sin_semillas,
      tope_unidad: tope ? tope.u : null,
      tope_valor: tope ? tope.v : null,
      tope_total_unidad: total ? total.u : null,
      tope_total_valor: total ? total.v : null,
      valor_hora_usd: a.valor_hora_usd,
      periodo: a.periodo,
      version_pacto: 1,
      confirmacion: a.confirmacion,
      semillas: a.semillas,
    },
    creada_en: o.creada_en,
    revocada_en: null,
    vence_en: null,
  };
}
