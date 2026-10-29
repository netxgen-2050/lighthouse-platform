import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import { HOUR_REF_USD } from "@/lib/pactos/datos";
import { META_SEMBRADOR, MESES } from "./datos";

/** Semillas de tiempo en 3 meses (como `seedsContrib()*3` del mock-up). `parteSemilla` en % (los pactos nuevos usan 100). */
export function semillasTiempo(horas: number, parteSemilla: number, factor = 1): number {
  return Math.round(horas * HOUR_REF_USD * (parteSemilla / 100) * factor) * MESES;
}

export function estadoMedidor(semillas: number): "Lista" | "En camino" {
  return semillas >= META_SEMBRADOR ? "Lista" : "En camino";
}

export type Notas = Record<string, number>;
export type Razones = Record<string, string>;

export function clave(i: number, d: string): string {
  return `${i}|${d}`;
}

const CRITERIOS = ["rol", "cultura"];

export type Falta = { clave: string; falta: "nota" | "razon" };

/** Lo que falta para enviar: cada compañero × criterio necesita su puntuación (1 a 5) y su explicación escrita. */
export function faltantes(notas: Notas, razones: Razones, companeros: number): Falta[] {
  const salida: Falta[] = [];
  for (let i = 0; i < companeros; i++) {
    for (const d of CRITERIOS) {
      const k = clave(i, d);
      const n = notas[k];
      if (!Number.isInteger(n) || n < 1 || n > 5) salida.push({ clave: k, falta: "nota" });
      else if (!(razones[k] ?? "").trim()) salida.push({ clave: k, falta: "razon" });
    }
  }
  return salida;
}

/** Aviso de por qué no se envió la ronda: dice qué falta (puntuaciones, explicaciones o ambas) y concuerda en número. */
export function mensajeFaltante(falta: Falta[], idioma: Idioma = "es"): string {
  const t = textos("semillas", idioma).ronda.faltante;
  const notas = falta.filter((f) => f.falta === "nota").length;
  const razones = falta.length - notas;
  const partes: string[] = [];
  if (notas > 0) partes.push(t.puntuaciones(notas));
  if (razones > 0) partes.push(t.explicaciones(razones));
  return t.mensaje(partes.join(t.y), falta.length === 1);
}

/** ¿Están todas las puntuaciones con su explicación? */
export function rondaCompleta(notas: Notas, razones: Razones, companeros: number): boolean {
  return faltantes(notas, razones, companeros).length === 0;
}

/** Factor de evaluación entre pares: fijo en 1,0, como en el mock-up (la ronda no lo cambia). */
export const FACTOR_EVALUACION = 1;

export type Parte = number | null;

/** Suma las partes que tienen dato; si ninguna lo tiene, el total es "sin dato" (null), no 0. */
export function totalConDato(partes: Parte[]): number | null {
  const con = partes.filter((p): p is number => p !== null);
  return con.length === 0 ? null : con.reduce((a, b) => a + b, 0);
}

/* ---------- Pacto de horas variables (openspec/changes/pactos-horas-variables, design §4 y §7) ---------- */

/** Semillas de las horas confirmadas de un mes: `round(horas × valor de la hora)`. Sin proyección a 3 meses. */
export function semillasDelMes(horas: number): number {
  return Math.round(Number((horas * HOUR_REF_USD).toFixed(6)));
}

/** Lo mínimo de una declaración que el cálculo necesita (el estado real es `DeclaracionMes`). */
export type DeclaracionCalculo = { horas: number; estado: "declarada" | "confirmada" | "a-revisar" };

/** Meses confirmados con más de 0 h, de todo el pacto: los que cuentan para el compromiso mínimo. Un mes con 0 h no cuenta. */
export function mesesCumplidos(declaradas: Readonly<Record<string, DeclaracionCalculo>>): number {
  return Object.values(declaradas).filter((d) => d.estado === "confirmada" && d.horas > 0).length;
}

/** El mes ("AAAA-MM") que está `atras` meses antes de `mes`. */
export function mesAtras(mes: string, atras: number): string {
  const [a, m] = mes.split("-").map(Number);
  const total = a * 12 + (m - 1) - atras;
  return `${String(Math.floor(total / 12)).padStart(4, "0")}-${String((total % 12) + 1).padStart(2, "0")}`;
}

export type EstadoSemillasMes = "pendientes" | "recibidas";

export type MesVariable = {
  mes: string;
  /** Las horas que declaró; null si no declaró ("sin dato"). */
  horas: number | null;
  estado: "declarada" | "confirmada" | "a-revisar" | null;
  /** Solo un mes confirmado con más de 0 h genera Semillas; si no, null. */
  semillas: number | null;
  semillasEstado: EstadoSemillasMes | null;
};

export type SemillasVariables = {
  /** [mes−2, mes−1, mes]. */
  meses: MesVariable[];
  cumplidos: number;
  compromisoMeses: number;
  /** ¿Ya cumplió el compromiso mínimo? */
  cumplido: boolean;
  /** Sobre todas las declaraciones, no solo la lista; null si no hay ("sin dato", nunca 0). */
  recibidas: number | null;
  pendientes: number | null;
};

/**
 * Semillas de un pacto variable. Solo lo confirmado genera Semillas. Mientras no se cumple el compromiso mínimo (meses confirmados
 * con más de 0 h) son "pendientes" y no suman; al cumplirlo se reciben. Los meses confirmados después del mínimo se reciben al
 * confirmarse (decisión de Gus, 28-oct).
 */
export function semillasVariables(
  declaradas: Readonly<Record<string, DeclaracionCalculo>>,
  mesActual: string,
  compromisoMeses: number,
): SemillasVariables {
  const cumplidos = mesesCumplidos(declaradas);
  const cumplido = cumplidos >= compromisoMeses;
  const grupo: EstadoSemillasMes = cumplido ? "recibidas" : "pendientes";
  const de = (mes: string): MesVariable => {
    const d = Object.hasOwn(declaradas, mes) ? declaradas[mes] : undefined;
    if (!d) return { mes, horas: null, estado: null, semillas: null, semillasEstado: null };
    const genera = d.estado === "confirmada" && d.horas > 0;
    return { mes, horas: d.horas, estado: d.estado, semillas: genera ? semillasDelMes(d.horas) : null, semillasEstado: genera ? grupo : null };
  };
  const confirmadas = Object.values(declaradas)
    .filter((d) => d.estado === "confirmada" && d.horas > 0)
    .map((d) => semillasDelMes(d.horas));
  const total = confirmadas.length > 0 ? confirmadas.reduce((a, b) => a + b, 0) : null;
  return {
    meses: [mesAtras(mesActual, 2), mesAtras(mesActual, 1), mesActual].map(de),
    cumplidos,
    compromisoMeses,
    cumplido,
    recibidas: cumplido ? total : null,
    pendientes: cumplido ? null : total,
  };
}
