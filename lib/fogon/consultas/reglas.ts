import { CREDITOS_POR_PERSONA, type Reglas } from "@/lib/cuadratico/motor";
import { LOCALES, sinDato } from "@/lib/idioma/formatos";
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
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
const FECHA: Record<Idioma, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat(LOCALES.es, { day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" }),
  en: new Intl.DateTimeFormat(LOCALES.en, { day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" }),
};

const t = (idioma: Idioma) => textos("fogonConsultas", idioma);

export function fechaCierre(consulta: Consulta, idioma: Idioma = "es"): string {
  return FECHA[idioma].format(new Date(consulta.cierre));
}

/** Fecha de un momento ISO (por ejemplo, el cierre a mano), en el mismo huso fijo. */
export function fechaDe(iso: string, idioma: Idioma = "es"): string {
  return FECHA[idioma].format(new Date(iso));
}

/** "Cierra el 15 de noviembre de 2026" / "Cierre previsto: …" (si se cerró a mano, la fecha prevista igual se aclara). */
export function textoCierre(consulta: Consulta, est: Estado, idioma: Idioma = "es"): string {
  return t(idioma).cierre[est === "abierta" ? "abierta" : "cerrada"](fechaCierre(consulta, idioma));
}

/** Texto de la regla de voto. */
export function textoVoto(consulta: Consulta, idioma: Idioma = "es"): string {
  return t(idioma).reglaVoto[consulta.voto];
}

/** "El resultado del grupo se ve al cierre, el 15 de noviembre de 2026" (o "en cuanto guardes tu reparto"). */
export function textoCuandoSeVe(consulta: Consulta, idioma: Idioma = "es"): string {
  return consulta.resultadoVisible === "al-votar"
    ? t(idioma).cuandoSeVe.alVotar
    : t(idioma).cuandoSeVe.alCierre(fechaCierre(consulta, idioma));
}

const PLATA: Record<Idioma, Intl.NumberFormat> = {
  es: new Intl.NumberFormat(LOCALES.es, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat(LOCALES.en, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
};
const PLATA_CENTAVOS: Record<Idioma, Intl.NumberFormat> = {
  es: new Intl.NumberFormat(LOCALES.es, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  en: new Intl.NumberFormat(LOCALES.en, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
};

/** "USD 15.000" ("USD 15,000" en inglés); los centavos solo si no son cero ("USD 5.333,33"). `null` = "sin dato" / "no data". */
export function formatoPlata(centavos: number | null, moneda: string, idioma: Idioma = "es"): string {
  if (centavos === null) return sinDato(idioma);
  const entero = centavos % 100 === 0;
  return `${moneda} ${entero ? PLATA[idioma].format(centavos / 100) : PLATA_CENTAVOS[idioma].format(centavos / 100)}`;
}
