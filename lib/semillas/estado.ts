import { CLAVES } from "@/lib/demo/claves";
import { deComunidad, leer as leerPactos, pactosAceptados, totalAportes } from "@/lib/pactos/estado";
import { semillasDePlata } from "@/lib/pactos/calculo";
import { clave, rondaCompleta, semillasTiempo, totalConDato, type Notas, type Parte, type Razones } from "./calculo";
import { MAX_RAZON } from "./datos";

export const CLAVE_RONDA = CLAVES.semillasRonda;
/** Clave que usa /sumarte (todavía no está en CLAVES; no cambiar el valor). */
export const CLAVE_SUMARTE = "lh-sumarte";

/** Ronda de una comunidad: puntuaciones, explicaciones y si ya se envió (simulado). */
export type Ronda = { notas: Notas; razones: Razones; enviada: boolean };
/** Una ronda por id de comunidad (`lighthouse` o id de tribu). */
export type Rondas = Record<string, Ronda>;

export const RONDA_INICIAL: Ronda = { notas: {}, razones: {}, enviada: false };

export function rondaDe(r: Rondas, comunidad: string): Ronda {
  return Object.hasOwn(r, comunidad) ? r[comunidad] : RONDA_INICIAL;
}

export function ponerNota(r: Ronda, i: number, d: string, n: number): Ronda {
  if (r.enviada || !Number.isInteger(n) || n < 1 || n > 5) return r;
  return { ...r, notas: { ...r.notas, [clave(i, d)]: n } };
}

export function ponerRazon(r: Ronda, i: number, d: string, texto: string): Ronda {
  if (r.enviada) return r;
  return { ...r, razones: { ...r.razones, [clave(i, d)]: texto.slice(0, MAX_RAZON) } };
}

/** Envía la ronda solo si cada puntuación tiene su explicación escrita. */
export function enviarRonda(r: Ronda, companeros: number): Ronda {
  if (r.enviada || !rondaCompleta(r.notas, r.razones, companeros)) return r;
  return { ...r, enviada: true };
}

const CLAVE_VALIDA = /^\d\|(rol|cultura)$/;

function leerRonda(x: unknown): Ronda {
  if (typeof x !== "object" || x === null) return RONDA_INICIAL;
  const o = x as Record<string, unknown>;
  const notas: Notas = {};
  const razones: Razones = {};
  if (o.notas && typeof o.notas === "object") {
    for (const [k, v] of Object.entries(o.notas as Record<string, unknown>)) {
      if (CLAVE_VALIDA.test(k) && typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) notas[k] = v;
    }
  }
  if (o.razones && typeof o.razones === "object") {
    for (const [k, v] of Object.entries(o.razones as Record<string, unknown>)) {
      if (CLAVE_VALIDA.test(k) && typeof v === "string") razones[k] = v.slice(0, MAX_RAZON);
    }
  }
  return { notas, razones, enviada: o.enviada === true };
}

/** Lee lo guardado; cualquier cosa rara se descarta. Lo guardado con el formato anterior (una sola ronda) se ignora. */
export function leerRondas(crudo: string | null): Rondas {
  if (!crudo) return {};
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return {};
    const c = (o as Record<string, unknown>).comunidades;
    if (typeof c !== "object" || c === null || Array.isArray(c)) return {};
    const salida: Rondas = {};
    for (const [id, v] of Object.entries(c)) {
      if (id !== "__proto__") salida[id] = leerRonda(v);
    }
    return salida;
  } catch {
    return {};
  }
}

export function guardarRondas(r: Rondas): string {
  return JSON.stringify({ comunidades: r });
}

/** Lo que la persona tiene en una comunidad, para el panel: null es "sin dato", nunca 0. */
export type SemillasDeComunidad = {
  /** Horas por mes del pacto de tiempo aceptado, o null si no hay uno aceptado. */
  horas: number | null;
  tiempo: Parte;
  plata: Parte;
  presencia: Parte;
  total: number | null;
  /** ¿Hay un pacto de tiempo aceptado? Habilita la ronda de reconocimiento. */
  pactoAceptado: boolean;
};

/**
 * Semillas de una comunidad a partir de lo guardado por /pactos.
 * Tiempo: solo con pacto aceptado. Plata: aportes registrados. Presencia: todavía no suma Semillas (sin dato).
 */
export function semillasDeComunidad(pactosCrudo: string | null, comunidad: string): SemillasDeComunidad {
  const guardados = leerPactos(pactosCrudo);
  const p = deComunidad(guardados, comunidad);
  const aceptado = pactosAceptados(guardados).some((a) => a.comunidad === comunidad);
  const tiempo = aceptado ? semillasTiempo(p.tiempo.horas, 100) : null;
  const plata = p.aportes.length > 0 ? semillasDePlata(totalAportes(p)) : null;
  return {
    horas: aceptado ? p.tiempo.horas : null,
    tiempo,
    plata,
    presencia: null,
    total: totalConDato([tiempo, plata, null]),
    pactoAceptado: aceptado,
  };
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
