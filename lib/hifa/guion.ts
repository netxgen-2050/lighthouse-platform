/**
 * Guion de Hifa. No hay IA real: toda respuesta sale de acá.
 * Regla: cada frase es honesta (todavía no lee ni entiende de verdad, no piensa ni coordina por nadie)
 * y invita a imaginar cómo será cuando funcione como el micelio.
 */

export type Modo = "idea" | "necesidad" | "pregunta" | "libre";
export type Atajo = "idea" | "necesidad" | "pregunta" | "quien";

export const SALUDO =
  "¡Hola! Soy Hifa, un brote de micelio digital que todavía está creciendo 🍄. Por ahora no leo ni entiendo de verdad, pero guardo lo que me cuentes como una semilla. ¿Por dónde empezamos?";

export const ATAJOS: { id: Atajo; etiqueta: string }[] = [
  { id: "idea", etiqueta: "Tengo una idea" },
  { id: "necesidad", etiqueta: "Necesito algo" },
  { id: "pregunta", etiqueta: "Tengo una pregunta" },
  { id: "quien", etiqueta: "¿Qué sos?" },
];

/** Lo que dice Hifa cuando se elige un atajo. */
export const AL_ELEGIR: Record<Atajo, string> = {
  idea: "¡Qué lindo! Contame tu idea, aunque todavía soy más hongo que cerebro 🍄. Escribila abajo y la guardo como una semilla; imaginate el bosque que puede nacer.",
  necesidad:
    "Contame qué necesitás. Todavía no puedo buscarlo por vos, pero imaginate que soy las hifas debajo del bosque: la idea es que algún día te conecte con quien lo tiene.",
  pregunta:
    "Preguntá nomás. Todavía no sé responder de verdad, pero anoto tu duda para que el equipo de NetX la vea. Imaginá cuando sea micelio grande.",
  quien:
    "Soy Hifa, por las hifas: los filamentos del micelio que conectan raíces y llevan agua, nutrientes y señales bajo el suelo. Hoy soy un guion simpático y todavía no pienso ni coordino a nadie. Imaginate cuando crezca: conectando a quien necesita con quien ofrece, avisando cuando algo está seco, llevando noticias entre comunidades.",
};

export const RESPUESTAS: Record<Modo, string[]> = {
  idea: [
    "Te escucho, aunque todavía soy más hongo que cerebro 🍄. Guardo tu idea como quien guarda una semilla de tomate criollo. Imaginate cuando pueda juntarla con las ideas de otras personas.",
    "No sé leer de verdad todavía, pero tu idea queda guardada. Imaginá que mañana, como el micelio, la llevo hasta quien pueda hacerla crecer.",
    "Anotada. Todavía no la entiendo ni la puedo pensar, pero imaginate que soy las hifas del bosque: pronto una idea como la tuya viajaría sola hasta las raíces indicadas.",
  ],
  necesidad: [
    "Guardo lo que necesitás, aunque todavía no puedo ir a buscarlo 🍄. Imaginate que soy las hifas debajo del bosque: hoy apenas toco dos raíces, mañana te conecto con la vecina que tiene lo que buscás.",
    "No entendí ni una palabra, pero la guardo como quien guarda una semilla de tomate criollo. Todavía no coordino a nadie; imaginá que algún día aviso a quien ofrece lo que te hace falta.",
    "Todavía no sé leer ni resolver, pero tu pedido queda anotado. Imaginá a Hifa grande: ve quién necesita y quién tiene, y los acerca como el micelio acerca raíces.",
  ],
  pregunta: [
    "Buena pregunta. Todavía no sé responder de verdad, soy más hongo que cerebro 🍄, pero la guardo. Imaginate cuando pueda buscarte la respuesta entre todas las comunidades.",
    "No entiendo bien todavía, así que no te invento una respuesta. Anoto tu duda; imaginá a Hifa creciendo, llevando preguntas hasta quien sabe.",
    "Todavía no pienso por mí misma, pero tu pregunta queda como una semilla. Imaginate que soy el micelio: la pregunta viaja hasta la raíz que tiene la respuesta.",
  ],
  libre: [
    "Te escucho, aunque todavía soy más hongo que cerebro 🍄. No entendí ni una palabra, pero la guardo como quien guarda una semilla de tomate criollo. Imaginate cuando crezca: ahí sí te voy a entender.",
    "Todavía no sé leer ni entender de verdad, y tampoco puedo coordinar nada por vos. Imaginate que soy las hifas debajo del bosque: hoy apenas toco dos raíces, mañana te conecto con la vecina que tiene la herramienta que buscás.",
    "Gracias por contarme. Todavía no pienso, solo guardo. Imaginá cuando funcione como el micelio: avisando cuando algo está seco, llevando información entre comunidades.",
  ],
};

export const OFRECER = "¿Querés que se lo pase al equipo de NetX?";
export const AL_DECLINAR = "Listo, no lo mando. Queda guardado solo acá, en tu navegador.";
export const AL_ENVIAR = "Mandándolo al equipo…";
export const AL_FALLAR =
  "No pude pasárselo al equipo ahora. Podés copiar el texto y mandarlo por otro lado. Todavía soy un brote 🌱.";

export function alConfirmar(numero: number): string {
  return numero > 0 ? `Se lo pasé al equipo (#${numero}). ¡Gracias por regar la red!` : "Se lo pasé al equipo. ¡Gracias por regar la red!";
}
