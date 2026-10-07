import { CLAVES } from "@/lib/demo/claves";
import { leer as leerPactos } from "@/lib/pactos/estado";
import { clave,type Notas } from "./calculo";

export const CLAVE_RONDA = CLAVES.semillasRonda;
/** Clave que usa /sumarte (todavía no está en CLAVES; no cambiar el valor). */
export const CLAVE_SUMARTE = "lh-sumarte";

export type Ronda = { notas: Notas; enviada: boolean };

export const RONDA_INICIAL: Ronda = { notas: {}, enviada: false };

export function ponerNota(r: Ronda, i: number, d: string, n: number): Ronda {
  if (r.enviada || !Number.isInteger(n) || n < 1 || n > 5) return r;
  return { ...r, notas: { ...r.notas, [clave(i, d)]: n } };
}

export function leerRonda(crudo: string | null): Ronda {
  if (!crudo) return RONDA_INICIAL;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    const notas: Notas = {};
    if (o.notas && typeof o.notas === "object") {
      for (const [k, v] of Object.entries(o.notas as Record<string, unknown>)) {
        if (/^\d\|(rol|cultura)$/.test(k) && typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) notas[k] = v;
      }
    }
    return { notas, enviada: o.enviada === true };
  } catch {
    return RONDA_INICIAL;
  }
}

/** Pacto de tiempo aceptado (paso 2) guardado por /pactos, o null. */
export function pactoAceptado(crudo: string | null): { horas: number; parteSemilla: number } | null {
  if (!crudo) return null;
  // leer() de /pactos acota horas y porcentaje a sus rangos válidos.
  const e = leerPactos(crudo);
  return e.paso === 2 ? { horas: e.horas, parteSemilla: e.parteSemilla } : null;
}

/** Nivel del Pase activo guardado por /sumarte, o null. */
export function paseActivo(crudo: string | null): string | null {
  if (!crudo) return null;
  try {
    const p = (JSON.parse(crudo) as Record<string, unknown>).pase;
    return p === "semilla" || p === "brote" || p === "raiz" ? p : null;
  } catch {
    return null;
  }
}
