import { costo, costoReparto, CREDITOS_POR_PERSONA, repartirPresupuesto, type Reparto } from "@/lib/cuadratico/motor";
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { Consulta } from "./tipos";

// Cuentas puras de la pantalla "Mi reparto" (sin React): cuánto suma o resta cada voto y qué le toca a cada opción en plata.

const u = (idioma: Idioma) => textos("fogonConsultas", idioma).unidades;

/** "1 voto", "3 votos" ("1 vote", "3 votes"; con el singular donde corresponde). */
export function textoVotos(n: number, idioma: Idioma = "es"): string {
  return `${n} ${Math.abs(n) === 1 ? u(idioma).voto : u(idioma).votos}`;
}

export function textoCreditos(n: number, idioma: Idioma = "es"): string {
  return `${n} ${Math.abs(n) === 1 ? u(idioma).credito : u(idioma).creditos}`;
}

export function votosDe(reparto: Reparto, opcion: string): number {
  return reparto[opcion] ?? 0;
}

export function creditosUsados(reparto: Reparto): number {
  return costoReparto(reparto);
}

export function creditosRestantes(reparto: Reparto): number {
  return CREDITOS_POR_PERSONA - creditosUsados(reparto);
}

/** Créditos que suma el próximo voto a favor en esa opción (el voto n cuesta n² − (n−1)²). */
export function costoDelProximoVoto(reparto: Reparto, opcion: string): number {
  const v = votosDe(reparto, opcion);
  return costo(v + 1) - costo(v);
}

/** `null` si se puede sumar un voto; si no, el motivo en texto. */
export function motivoNoSumar(reparto: Reparto, opcion: string, idioma: Idioma = "es"): string | null {
  const suma = costoDelProximoVoto(reparto, opcion);
  const quedan = creditosRestantes(reparto);
  if (suma <= quedan) return null;
  return textos("fogonConsultas", idioma).consulta.noAlcanza(suma, quedan);
}

/** `null` si se puede quitar un voto; si no, el motivo ("−" no baja de 0 si la consulta no admite votos en contra). */
export function motivoNoQuitar(consulta: Consulta, reparto: Reparto, opcion: string, idioma: Idioma = "es"): string | null {
  if (!consulta.votosEnContra && votosDe(reparto, opcion) <= 0) return textos("fogonConsultas", idioma).consulta.yaEnCero;
  return null;
}

/** Reparto con un voto más o menos en la opción; no cambia nada si no se puede. Los ceros no se guardan. */
export function mover(consulta: Consulta, reparto: Reparto, opcion: string, delta: 1 | -1): Reparto {
  const bloqueo = delta === 1 ? motivoNoSumar(reparto, opcion) : motivoNoQuitar(consulta, reparto, opcion);
  if (bloqueo) return reparto;
  const siguiente: Record<string, number> = { ...reparto, [opcion]: votosDe(reparto, opcion) + delta };
  if (siguiente[opcion] === 0) delete siguiente[opcion];
  return siguiente;
}

/** Dos repartos son iguales si tienen los mismos votos (un voto en 0 es igual a no haber puesto nada). */
export function mismoReparto(a: Reparto, b: Reparto): boolean {
  const ids = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...ids].every((id) => votosDe(a, id) === votosDe(b, id));
}

/**
 * Lo que le tocaría a cada opción si el presupuesto se repartiera solo con estos votos.
 * `null` por opción = sin dato (monto desconocido o ningún voto a favor); vacío si la consulta no es de presupuesto.
 */
export function repartoEnPlata(consulta: Consulta, reparto: Reparto): Record<string, number | null> {
  if (consulta.modo !== "presupuesto" || !consulta.presupuesto) return {};
  return repartirPresupuesto({
    montoCentavos: consulta.presupuesto.montoCentavos,
    opciones: consulta.opciones.map((o) => ({
      id: o.id,
      peso: Math.max(0, votosDe(reparto, o.id)),
      topeCentavos: o.topeCentavos,
      pisoCentavos: o.pisoCentavos,
    })),
  }).partes;
}
