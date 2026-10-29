import { FACTOR_MAX, FACTOR_MIN, PARAMETROS_DE_PARTIDA } from "./parametros";
import type { Dimension, Evaluacion, MotivoDescarte, Parametros, Resultado, ResultadoDimension } from "./tipos";

const DIMENSIONES: Dimension[] = ["rol", "cultura"];

/** Mediana de una lista no vacía. */
export function mediana(notas: number[]): number {
  const o = [...notas].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

/** Media recortada: quita `r = max(1, floor(n × 0,2))` notas de cada extremo. Con muy pocas notas usa la mediana. */
export function mediaRecortada(notas: number[]): number {
  const r = Math.max(1, Math.floor(notas.length * 0.2));
  const o = [...notas].sort((a, b) => a - b);
  if (o.length - 2 * r < 1) return mediana(o);
  const resto = o.slice(r, o.length - r);
  return resto.reduce((s, n) => s + n, 0) / resto.length;
}

/** Redondea a dos decimales, mitad hacia arriba, sin el error de coma flotante (1,025 → 1,03). */
export function redondearFactor(f: number): number {
  return Math.round(Number((f * 100).toFixed(6))) / 100;
}

function acotar(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function motivoInvalido(e: Evaluacion, equipo: string[]): MotivoDescarte | null {
  if (e.de === e.a) return "autoevaluacion";
  if (!equipo.includes(e.de) || !equipo.includes(e.a)) return "fuera-del-equipo";
  if (!Number.isInteger(e.nota) || e.nota < 1 || e.nota > 5) return "nota-invalida";
  if (e.motivo.trim() === "") return "sin-motivo";
  return null;
}

/** Resultado agregado de una persona en una ronda. Pura: sin red, sin estado. Ver design §2 de `evaluacion-pares`. */
export function calcularFactorEvaluacion(
  equipo: string[],
  evaluaciones: Evaluacion[],
  persona: string,
  parametros: Partial<Parametros> = {},
): Resultado {
  const p: Parametros = { ...PARAMETROS_DE_PARTIDA, ...parametros };
  const fuerza = acotar(p.fuerza, 0, 0.2);
  const descartes: Record<MotivoDescarte, number> = {
    autoevaluacion: 0,
    "fuera-del-equipo": 0,
    "sin-motivo": 0,
    "nota-invalida": 0,
    reciprocidad: 0,
  };

  // 1. Validar las evaluaciones sobre la persona.
  const validas: Evaluacion[] = [];
  for (const e of evaluaciones) {
    if (e.a !== persona) continue;
    const m = motivoInvalido(e, equipo);
    if (m) descartes[m] += 1;
    else validas.push(e);
  }
  // Quien tiene dos notas en la misma dimensión: cuenta la última.
  const ultimas = new Map<string, Evaluacion>();
  for (const e of validas) ultimas.set(`${e.dimension}|${e.de}`, e);
  const sobrePersona = [...ultimas.values()];

  const devolvieron = new Set<string>(
    evaluaciones.filter((e) => e.de === persona && e.a !== persona && !motivoInvalido(e, equipo)).map((e) => e.a),
  );

  const dimensiones = {} as Record<Dimension, ResultadoDimension>;
  const notasCombinar = {} as Record<Dimension, number>;
  for (const d of DIMENSIONES) {
    let notas = sobrePersona.filter((e) => e.dimension === d);
    // 2. Reciprocidad (apagada por defecto).
    if (p.reciprocidadActiva) {
      const todas = notas;
      notas = todas.filter((e) => {
        if (!devolvieron.has(e.de)) return true;
        const otros = todas.filter((o) => o !== e).map((o) => o.nota);
        if (otros.length < 2) return true;
        if (Math.abs(e.nota - mediana(otros)) >= p.umbralReciprocidad) {
          descartes.reciprocidad += 1;
          return false;
        }
        return true;
      });
    }
    // 3. Mínimo de evaluadores.
    if (notas.length < p.minimoEvaluadores) {
      dimensiones[d] = { nota: notas.length === 0 ? null : 3, evaluadores: notas.length, suficiente: false };
      notasCombinar[d] = 3;
      continue;
    }
    // 4. Tope por evaluador (sobre las notas originales).
    const originales = notas.map((e) => e.nota);
    const acotadas = originales.map((n, i) => {
      const m = mediana(originales.filter((_, j) => j !== i));
      return acotar(n, m - p.topePorEvaluador, m + p.topePorEvaluador);
    });
    // 5. Agregado.
    const agregada = p.agregado === "media-recortada" ? mediaRecortada(acotadas) : mediana(acotadas);
    dimensiones[d] = { nota: agregada, evaluadores: notas.length, suficiente: true };
    notasCombinar[d] = agregada;
  }

  // 6. Combinar.
  const nota = p.pesoRol * notasCombinar.rol + (1 - p.pesoRol) * notasCombinar.cultura;
  const factor = redondearFactor(acotar(1 + (fuerza * (nota - 3)) / 2, FACTOR_MIN, FACTOR_MAX));

  return {
    factor,
    fuerza,
    rango: [redondearFactor(1 - fuerza), redondearFactor(1 + fuerza)],
    dimensiones,
    descartes,
    resumenDisponible: dimensiones.rol.suficiente && dimensiones.cultura.suficiente,
  };
}

/** Notas ya acotadas por el tope de una dimensión (para tests de caracterización). */
export function notasAcotadas(notas: number[], tope: number): number[] {
  return notas.map((n, i) => {
    const m = mediana(notas.filter((_, j) => j !== i));
    return acotar(n, m - tope, m + tope);
  });
}
