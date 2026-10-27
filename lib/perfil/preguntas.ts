import { perfil } from "@/lib/idioma/textos/perfil";
import type { Idioma } from "@/lib/idioma/tipos";

export type Pregunta = {
  /** Texto que dice "Agente NetX". */
  texto: string;
  /** Nombre del dato del perfil que se propone a partir de la respuesta. */
  etiqueta: string;
};

/**
 * Las 6 preguntas del mock-up v6 (constante CHATS), sin el nombre propio del ejemplo, en español. Su orden manda: lo
 * guardado de la entrevista se identifica por posición y por la etiqueta en español (ver `migrarDeEntrevista`).
 */
export const CHATS: readonly Pregunta[] = perfil.es.preguntas;

/** Las mismas preguntas, en el mismo orden, en el idioma pedido. */
export function preguntasEn(idioma: Idioma): readonly Pregunta[] {
  return perfil[idioma].preguntas;
}
