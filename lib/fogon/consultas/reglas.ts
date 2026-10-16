import { CREDITOS_POR_PERSONA, type Reglas } from "@/lib/cuadratico/motor";
import type { Consulta, Estado } from "./tipos";

/** Las reglas del motor para una consulta: los créditos son siempre los mismos para todas las personas (regla 6). */
export function reglasDe(consulta: Consulta): Reglas {
  return {
    creditos: CREDITOS_POR_PERSONA,
    opciones: consulta.opciones.map((o) => o.id),
    votosEnContra: consulta.votosEnContra,
  };
}

/** Cerrada si pasó la fecha de cierre o si se cerró a mano (`cierreManual` = ISO del momento, o null/undefined). */
export function estado(consulta: Consulta, cierreManual: string | null | undefined, ahora: Date): Estado {
  if (cierreManual) return "cerrada";
  return ahora.getTime() >= new Date(consulta.cierre).getTime() ? "cerrada" : "abierta";
}

/** Si el resultado del grupo se muestra ahora: siempre al cerrar; abierta, según la regla de la consulta. */
export function resultadoVisible(consulta: Consulta, est: Estado, yaReparti: boolean): boolean {
  if (est === "cerrada") return true;
  return consulta.resultadoVisible === "al-votar" && yaReparti;
}

// Huso fijo para que servidor y navegador escriban la misma fecha.
const FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function fechaCierre(consulta: Consulta): string {
  return FECHA.format(new Date(consulta.cierre));
}

/** Fecha de un momento ISO (por ejemplo, el cierre a mano), en el mismo huso fijo. */
export function fechaDe(iso: string): string {
  return FECHA.format(new Date(iso));
}

/** "Cierra el 15 de noviembre de 2026" / "Cerró el …" (si se cerró a mano, la fecha prevista igual se aclara). */
export function textoCierre(consulta: Consulta, est: Estado): string {
  return est === "abierta" ? `Cierra el ${fechaCierre(consulta)}` : `Cierre previsto: ${fechaCierre(consulta)}`;
}

/** Texto de la regla de voto. */
export function textoVoto(consulta: Consulta): string {
  return consulta.voto === "abierto"
    ? "Voto abierto: todo el padrón ve cómo repartió cada quien"
    : "Voto secreto: nadie ve el reparto de otra persona";
}

/** "El resultado del grupo se ve al cierre, el 15 de noviembre de 2026" (o "en cuanto guardes tu reparto"). */
export function textoCuandoSeVe(consulta: Consulta): string {
  return consulta.resultadoVisible === "al-votar"
    ? "El resultado del grupo se ve en cuanto guardes tu reparto"
    : `El resultado del grupo se ve al cierre, el ${fechaCierre(consulta)}`;
}

const PLATA = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const PLATA_CENTAVOS = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "USD 15.000"; los centavos solo si no son cero ("USD 5.333,33"). `null` = "sin dato". */
export function formatoPlata(centavos: number | null, moneda: string): string {
  if (centavos === null) return "sin dato";
  const entero = centavos % 100 === 0;
  return `${moneda} ${entero ? PLATA.format(centavos / 100) : PLATA_CENTAVOS.format(centavos / 100)}`;
}
