// Textos del modelo híbrido (ADR-030): lotes privados simulados en el sector norte y lo común sostenido entre todos.
// Datos con fuente; el tono es descriptivo, no nombra a nadie ni compara con otra opción. Los montos NO se escriben acá:
// salen de `lib/lotes/modelo.ts`. "Diseño B" solo se cita junto a "doc 28" en la línea de fuentes.
// (El archivo se llamaba `juegos.ts`; el identificador PROCOMUN_EN_SIMPLE se conserva, el texto visible dice "bien común".)

export const PROCOMUN_EN_SIMPLE =
  "Bien común: lo que es de todos y se cuida entre todos, como el agua, el suelo o un camino del barrio.";

export const HIBRIDO = {
  titulo: "El modelo híbrido",
  idea: "Lo privado y lo común conviven: cada persona es dueña de su lote y de su casa, y el agua, los caminos, la restauración y la producción se sostienen entre todos.",
  puntos: [
    "Lotes privados: en el sector norte de Lighthouse VRN, simulados en este prototipo y sobre un supuesto de trabajo.",
    "Bien común: la tierra común queda en una Fundación que todavía no existe, y los lotes privados no quedan en ella.",
    "Series y NetX: la plata de los proyectos entra por series y NetX cobra por diseñar, gestionar y operar.",
  ],
  fuente: "NS_Tokenomics doc 18 §4, doc 25, doc 28 §1 y doc 30; ADR-030",
} as const;

export const PALABRAS_QUE_NO_VAN = ["capitalista", "extractivista", "colonialista", "Franz", "diseño B"] as const;
