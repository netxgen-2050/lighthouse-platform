// Invertir (spec invertir): los barrios en financiamiento, armados sobre `lib/bien-comun/barrio.ts` (fiel a
// `sim/barrio_stack_sim.py` v0.1). Puro: sin React ni Next. Nada se recalcula acá: la meta, el mes de devolución y la parte
// para el común salen de `resumenObraBarrio()` y de los módulos con versión; este archivo solo suma la curva y el libro.
// Todo es de ejemplo. Lo juntado es siempre `null` ("sin dato"): no hay plata real.
import { BARRIO, VERSION_SIM_BARRIO } from "@/lib/bien-comun/modelo";
import { ENTRADAS_DE_PARTIDA, resumenObraBarrio, serieMensualDelBarrio, type Entradas } from "@/lib/bien-comun/barrio";

export type MotivoLibro = "cuotas" | "devolucion" | "comun";

export type PuntoCurva = { mes: number; devuelto: number; aportado: number };
export type MovimientoLibro = { mes: number; motivo: MotivoLibro; monto: number | null };

export type BarrioEnFinanciamiento = {
  id: "norte";
  /** Infraestructura total que traería el Token Inversor. */
  meta: number | null;
  /** Nunca hay plata real en el prototipo. */
  juntado: null;
  /** null = no se termina de devolver dentro del horizonte. */
  mesDevolucion: number | null;
  /** Fracción de cada pago que va al común (`lib/lotes/modelo.ts`). */
  parteParaElComun: number | null;
  /** Prima anual objetivo del Token Inversor (el parámetro del modelo), para mostrarla como objetivo y no como promesa. */
  primaObjetivo: number;
  /** Mes a mes, del mes 0 al final del horizonte. */
  curva: PuntoCurva[];
  /** Por trimestre ("mes 3", "mes 6"…): cuotas que entran, lo devuelto al inversor y lo que va al común. Sin movimiento, no hay fila. */
  libro: MovimientoLibro[];
  /** Versión del simulador. */
  version: string;
};

/** Meses de cada trimestre del libro. */
const MESES_POR_TRIMESTRE = 3;

/**
 * Los barrios en financiamiento (hoy uno, Barrio Norte). El trimestre que termina en el mes N junta los meses N-2 a N
 * (el primero, los meses 0 a 3, porque ahí se hace la primera venta).
 */
export function barriosEnFinanciamiento(entradas: Entradas = ENTRADAS_DE_PARTIDA): BarrioEnFinanciamiento[] {
  const obra = resumenObraBarrio(entradas);
  const serie = serieMensualDelBarrio(entradas);
  const curva: PuntoCurva[] = serie.ok
    ? serie.meses.map((m) => ({ mes: m.mes, devuelto: m.devueltoAcumulado, aportado: serie.aportado }))
    : [];
  const libro: MovimientoLibro[] = [];
  if (serie.ok) {
    const ultimo = serie.meses.length - 1;
    for (let fin = MESES_POR_TRIMESTRE; fin <= ultimo; fin += MESES_POR_TRIMESTRE) {
      const enTrimestre = serie.meses.filter((m) => m.mes <= fin && (m.mes > fin - MESES_POR_TRIMESTRE || (fin === MESES_POR_TRIMESTRE && m.mes === 0)));
      const suma = (campo: "alFideicomiso" | "devueltoEnElMes" | "alComun") => enTrimestre.reduce((s, m) => s + m[campo], 0);
      const motivos: [MotivoLibro, number][] = [
        ["cuotas", suma("alFideicomiso")],
        ["devolucion", suma("devueltoEnElMes")],
        ["comun", suma("alComun")],
      ];
      for (const [motivo, monto] of motivos) if (monto > 0) libro.push({ mes: fin, motivo, monto });
    }
  }
  return [
    {
      id: "norte",
      meta: obra.infraestructura,
      juntado: obra.juntado as null,
      mesDevolucion: obra.mesDevolucion,
      parteParaElComun: BARRIO.parteComun.valor,
      primaObjetivo: entradas.prima,
      curva,
      libro,
      version: `${VERSION_SIM_BARRIO.archivo} ${VERSION_SIM_BARRIO.version}`,
    },
  ];
}

/** La curva por trimestre (mes 3, 6, …), para la tabla equivalente del gráfico. Incluye el mes 0. */
export function curvaPorTrimestre(curva: PuntoCurva[]): PuntoCurva[] {
  return curva.filter((p) => p.mes % MESES_POR_TRIMESTRE === 0);
}
