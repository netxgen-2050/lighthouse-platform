// Textos del relato: Juego A (el camino conocido) y Juego B (procomún). Datos con fuente; el tono es respetuoso y no
// nombra a nadie. "Diseño B" solo se cita junto a "doc 28" en la línea de fuentes.

export const PROCOMUN_EN_SIMPLE =
  "Procomún: lo que es de todos y se cuida entre todos, como el agua, el suelo o un camino del barrio.";

export const JUEGO_A = {
  titulo: "Juego A · el camino conocido",
  idea: "Vender la tierra en lotes. Es lo que hace la mayoría y se entiende rápido.",
  costos: [
    "Antes de la aprobación municipal no se puede ofrecer, reservar ni dar prioridad sobre lotes (Ordenanza 173).",
    "La plata entra una sola vez, el día de la venta.",
    "La tierra se va: lo que se regenere después lo aprovecha otro.",
  ],
  fuente: "NS_Tokenomics doc 30 §3",
} as const;

export const JUEGO_B = {
  titulo: "Juego B · el procomún",
  idea: "La tierra queda en una Fundación y se cuida entre todos. La regeneración y la vida van al centro.",
  suma: [
    "Seguimos teniendo ingresos: NetX cobra por diseñar, gestionar y operar.",
    "La tierra queda: nadie la vende y cada serie paga al procomún antes que a cualquier inversor.",
    "El valor crece para todos: la tierra regenerada vale más y ese valor se queda en el procomún.",
  ],
  fuente: "NS_Tokenomics doc 25, doc 28 §1 y doc 30 §1",
} as const;

export const PALABRAS_QUE_NO_VAN = ["capitalista", "extractivista", "colonialista", "Franz", "diseño B"] as const;
