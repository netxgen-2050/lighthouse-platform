export type Pregunta = {
  /** Texto que dice "Agente NetX". */
  texto: string;
  /** Nombre del dato del perfil que se propone a partir de la respuesta. */
  etiqueta: string;
};

/** Las 6 preguntas del mock-up v6 (constante CHATS), sin el nombre propio del ejemplo. */
export const CHATS: readonly Pregunta[] = [
  { texto: "¿Qué te trae a BioPueblo?", etiqueta: "Qué te trae" },
  { texto: "¿Qué paisaje te imaginás?", etiqueta: "Bioregión" },
  { texto: "¿Cómo te gustaría decidir en comunidad?", etiqueta: "Cómo decidir" },
  { texto: "¿Qué sabés hacer que pueda sumar?", etiqueta: "Lo que aportás" },
  { texto: "¿Cuánto tiempo podrías dedicar?", etiqueta: "Tiempo" },
  { texto: "¿Qué no negociarías?", etiqueta: "No negociables" },
];
