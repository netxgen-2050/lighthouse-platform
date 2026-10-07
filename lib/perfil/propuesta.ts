import type { Pregunta } from "./preguntas";

export const MAX_PROPUESTA = 80;

/**
 * Única función que decide qué dato del perfil se propone a partir de una respuesta.
 * Hoy es la propia respuesta recortada; mañana la reemplaza el agente (API de Claude).
 * Devuelve como máximo 80 caracteres (con la elipsis incluida) y no corta palabras.
 */
export function propuestaDePerfil(_pregunta: Pregunta, respuesta: string): string {
  const texto = respuesta.trim().replace(/\s+/g, " ");
  if (texto.length <= MAX_PROPUESTA) return texto;
  const limite = MAX_PROPUESTA - 1; // lugar para la elipsis
  let corte = texto.slice(0, limite);
  if (texto[limite] !== " ") {
    const ultimoEspacio = corte.lastIndexOf(" ");
    if (ultimoEspacio > 0) corte = corte.slice(0, ultimoEspacio);
  }
  return corte.trimEnd() + "…";
}
