// Textos que se repiten en todas las zonas: cada zona usa estos en lugar de repetirlos.
import type { Textos } from "../tipos";

const es = {
  cargando: "Cargando…",
  cancelar: "Cancelar",
  cerrar: "Cerrar",
  guardar: "Guardar",
  sinDato: "sin dato",
  simulado: "(simulado)",
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el cambio no se va a recordar al recargar. Revisá la configuración de privacidad o probá en otro navegador.",
  /** Nota del tipo de cambio de ejemplo; `tipo` ya viene formateado según el idioma ("1.400" / "1,400"). */
  notaTipoDeCambio: (tipo: string) => `Tipo de cambio de ejemplo: 1 USD = ${tipo} ARS. No es una cotización real.`,
  /** Nota visible cuando un texto de ejemplo se muestra traducido del inglés (en la página en español). */
  traducidoDelOriginal: "Traducido del inglés",
  /** Nombre accesible de la marca "ES" de un texto que todavía no tiene traducción. */
  soloEnEspanol: "(solo disponible en español)",
  /** Estado de una tribu (lo usan Sumarte, tribus y territorio). */
  estadoTribu: { activa: "Activa", formacion: "En formación", vacante: "Busca tribu" },
  /** "3 de 10" en los medidores. */
  de: "de",
};

const en: Textos<typeof es> = {
  cargando: "Loading…",
  cancelar: "Cancel",
  cerrar: "Close",
  guardar: "Save",
  sinDato: "no data",
  simulado: "(simulated)",
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the change won't be remembered after reloading. Check your privacy settings or try another browser.",
  notaTipoDeCambio: (tipo: string) => `Sample exchange rate: 1 USD = ${tipo} ARS. This is not a real quote.`,
  traducidoDelOriginal: "Translated from Spanish",
  soloEnEspanol: "(only available in Spanish)",
  estadoTribu: { activa: "Active", formacion: "Forming", vacante: "Looking for a tribe" },
  de: "of",
};

export const comunes = { es, en };
