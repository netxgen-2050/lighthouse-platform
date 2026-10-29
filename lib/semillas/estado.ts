import type { ConstanciaPacto } from "@/lib/pactos/constancias";
import type { ConstanciaBase } from "@/lib/pactos/constancia-base";
import {
  compromisoAnterior,
  compromisoDelPacto,
  deComunidad,
  leerPactosConciliados,
  pactosAceptados,
  totalAportes,
  type RangoHoras,
} from "@/lib/pactos/estado";
import { semillasDePlata } from "@/lib/pactos/calculo";
import { mesDe } from "@/lib/pactos/mes";
import {
  clave,
  rondaCompleta,
  semillasTiempo,
  semillasVariables,
  totalConDato,
  type Notas,
  type Parte,
  type Razones,
  type SemillasVariables,
} from "./calculo";
import { MAX_RAZON } from "./datos";

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
  /** Horas por mes del pacto de tiempo aceptado, o null si no hay uno aceptado (o si es de horas variables). */
  horas: number | null;
  /** Pacto de tiempo: con horas fijas, la proyección a 3 meses; con horas variables, las Semillas recibidas (lo único que suma). */
  tiempo: Parte;
  /** Pacto de horas variables vigente: el rango, el compromiso, los meses y las Semillas pendientes (que no suman). null si no es variable. */
  variable: (SemillasVariables & { rango: RangoHoras }) | null;
  /**
   * Meses confirmados de una etapa de horas variables anterior (el pacto pasó a fija): las recibidas suman; las pendientes NO suman y
   * quedan esperando que el círculo las valide (si no, se pierden: decisión de Gus, 28-oct). null si no hubo meses confirmados.
   */
  variableAnterior: { recibidas: Parte; pendientes: Parte; cumplidos: number; compromisoMeses: number } | null;
  plata: Parte;
  presencia: Parte;
  /** Semillas de los pactos puntuales verificados por el holón (se reciben al verificarse), o null si no hay ("sin dato"). */
  puntual: Parte;
  /** Las constancias base de los puntuales verificados de esta persona en esta comunidad (solo las suyas). */
  constancias: ConstanciaBase[];
  total: number | null;
  /** ¿Hay un pacto de tiempo aceptado? Habilita la ronda de reconocimiento. */
  pactoAceptado: boolean;
};

/**
 * Semillas de una comunidad a partir de lo guardado por /pactos.
 * Tiempo: solo con pacto aceptado. Plata: aportes registrados. Presencia: todavía no suma Semillas (sin dato).
 */
export function semillasDeComunidad(
  pactosCrudo: string | null,
  comunidad: string,
  idPersona?: string | null,
  registro?: readonly ConstanciaPacto[] | null,
  ahora: string = new Date().toISOString(),
): SemillasDeComunidad {
  // Con las respuestas de la tribu ya aplicadas (en memoria, sin guardar): un pacto aceptado en el registro cuenta.
  const guardados = leerPactosConciliados(pactosCrudo, idPersona, registro, ahora);
  const p = deComunidad(guardados, comunidad);
  const aceptado = pactosAceptados(guardados).some((a) => a.comunidad === comunidad);
  const t = p.tiempo;
  const esVariable = aceptado && t.modalidad === "variable";
  const mesActual = mesDe(ahora);
  // Horas variables: solo lo confirmado genera Semillas; hasta cumplir el compromiso mínimo son pendientes y no suman.
  const variable =
    esVariable && mesActual !== ""
      ? { ...semillasVariables(t.declaradas, mesActual, compromisoDelPacto(t, comunidad, true)), rango: t.rango }
      : null;
  // Si el pacto pasó a fija con meses confirmados de una etapa variable: lo recibido no desaparece; lo pendiente espera al círculo.
  const compromisoViejo = aceptado && !esVariable && mesesConfirmados(t.declaradas) ? compromisoAnterior(t) : null;
  const anterior =
    compromisoViejo !== null && mesActual !== "" ? semillasVariables(t.declaradas, mesActual, compromisoViejo) : null;
  const variableAnterior = anterior
    ? { recibidas: anterior.recibidas, pendientes: anterior.pendientes, cumplidos: anterior.cumplidos, compromisoMeses: anterior.compromisoMeses }
    : null;
  const tiempo = !aceptado ? null : esVariable ? (variable?.recibidas ?? null) : semillasTiempo(t.horas, 100);
  const plata = p.aportes.length > 0 ? semillasDePlata(totalAportes(p)) : null;
  // Un puntual verificado se recibe directo: no pasa por "Semillas pendientes" y nunca habilita la ronda (`pactoAceptado`).
  const constancias = p.puntuales.flatMap((x) => (x.paso === "verificado" && x.constancia ? [x.constancia] : []));
  const puntual = constancias.length > 0 ? constancias.reduce((s, c) => s + c.datos.semillas, 0) : null;
  return {
    horas: aceptado && !esVariable ? t.horas : null,
    tiempo,
    variable,
    variableAnterior,
    plata,
    presencia: null,
    puntual,
    constancias,
    total: totalConDato([tiempo, plata, puntual, variableAnterior?.recibidas ?? null]),
    pactoAceptado: aceptado,
  };
}

function mesesConfirmados(declaradas: Record<string, { estado: string }>): boolean {
  return Object.values(declaradas).some((d) => d.estado === "confirmada");
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
