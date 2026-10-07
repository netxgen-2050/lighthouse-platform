import { semillasPorMes } from "@/lib/pactos/calculo";
import { META_SEMBRADOR, MESES } from "./datos";

/** Semillas de tiempo en 3 meses (como `seedsContrib()*3` del mock-up). */
export function semillasTiempo(horas: number, parteSemilla: number, factor = 1): number {
  return semillasPorMes(horas, parteSemilla, factor) * MESES;
}

export function estadoMedidor(semillas: number): "Lista" | "En camino" {
  return semillas >= META_SEMBRADOR ? "Lista" : "En camino";
}

export type Notas = Record<string, number>;

export function clave(i: number, d: string): string {
  return `${i}|${d}`;
}

/** ¿Están las 4 notas (2 compañeros × rol y cultura) puestas, de 1 a 5? */
export function rondaCompleta(notas: Notas, companeros: number): boolean {
  for (let i = 0; i < companeros; i++) {
    for (const d of ["rol", "cultura"]) {
      const n = notas[clave(i, d)];
      if (!Number.isInteger(n) || n < 1 || n > 5) return false;
    }
  }
  return true;
}

/**
 * Factor de evaluación (simulado): promedio de las notas dividido 3, así 3 de 5 es neutro (1,0).
 * Va de 0,33 a 1,67. El mock-up solo muestra 1,0; esta fórmula es de ejemplo.
 */
export function factorEvaluacion(notas: Notas, companeros: number): number | null {
  if (!rondaCompleta(notas, companeros)) return null;
  let suma = 0;
  for (let i = 0; i < companeros; i++) suma += notas[clave(i, "rol")] + notas[clave(i, "cultura")];
  return Math.round((suma / (companeros * 2) / 3) * 100) / 100;
}
