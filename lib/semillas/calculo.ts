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
export function mensajeFaltante(falta: Falta[]): string {
  const notas = falta.filter((f) => f.falta === "nota").length;
  const razones = falta.length - notas;
  const plural = (n: number, uno: string, varios: string) => (n === 1 ? `1 ${uno}` : `${n} ${varios}`);
  const partes: string[] = [];
  if (notas > 0) partes.push(plural(notas, "puntuación", "puntuaciones"));
  if (razones > 0) partes.push(plural(razones, "explicación", "explicaciones"));
  const verbo = falta.length === 1 ? "Falta" : "Faltan";
  return `Error: la ronda no se envió. ${verbo} ${partes.join(" y ")}.`;
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
