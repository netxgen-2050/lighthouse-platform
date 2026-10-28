import type { Reparto } from "@/lib/cuadratico/motor";
import type { Consulta, Persona, TextoConsulta } from "./tipos";

// Datos de ejemplo del prototipo: las consultas U1 a U4 de la nota del 15-oct-2026 y un padrón de personas ficticias.
// Los títulos, descripciones, opciones y la nota del monto tienen su inglés (borrador a revisar: ver
// `lib/idioma/revision-nativa.ts`); en inglés se muestran con la nota "Translated from Spanish".

const b = (es: string, en: string): TextoConsulta => ({ es, en, original: "es" });

/** La persona que mira. El nombre que se ve sale del diccionario (`personas.vos`). */
export const VOS: Persona = { id: "vos", nombre: "Vos" };

/** Seis personas ficticias; la 6 no votó (para que se vea "Faltan votar"). */
export const PADRON_EJEMPLO: Persona[] = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `p${n}`, nombre: `Persona de ejemplo ${n}` }));

/** Todo el padrón en el orden en que se muestra: las personas de ejemplo y, al final, quien mira. */
export const PADRON: Persona[] = [...PADRON_EJEMPLO, VOS];

export const CONSULTAS: Consulta[] = [
  {
    id: "u1",
    titulo: b("¿Para qué optimiza el Lighthouse?", "What does the Lighthouse optimize for?"),
    descripcion: b(
      "Ordenar qué importa más cuando hay que elegir (Decisión A del modelo híbrido).",
      "Rank what matters most when a choice has to be made (Decision A of the hybrid model).",
    ),
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-15T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    voto: "abierto",
    opciones: [
      { id: "regeneracion", etiqueta: b("Regeneración ecológica", "Ecological regeneration") },
      { id: "resiliencia", etiqueta: b("Resiliencia comunitaria", "Community resilience") },
      { id: "accesibilidad", etiqueta: b("Accesibilidad", "Accessibility") },
      { id: "retorno", etiqueta: b("Retorno económico", "Economic return") },
      { id: "id", etiqueta: b("I+D / innovación", "R&D / innovation") },
      { id: "replicabilidad", etiqueta: b("Replicabilidad (RTMM)", "Replicability (RTMM)") },
    ],
  },
  {
    id: "u2",
    titulo: b("¿Cuánta tierra silvestre en la fase 1?", "How much wild land in phase 1?"),
    descripcion: b(
      "Escenarios para la fase 1: partir de 10 % y llegar a un máximo de 50 %.",
      "Scenarios for phase 1: start at 10% and reach a maximum of 50%.",
    ),
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-15T23:59:00-03:00",
    votosEnContra: false,
    // Para ver en la demo la regla "el resultado se ve al votar".
    resultadoVisible: "al-votar",
    voto: "abierto",
    opciones: [
      { id: "diez", etiqueta: b("10 % de tierra silvestre", "10% wild land") },
      { id: "veinte", etiqueta: b("20 % de tierra silvestre", "20% wild land") },
      { id: "treintaytres", etiqueta: b("33 % de tierra silvestre", "33% wild land") },
      { id: "cincuenta", etiqueta: b("50 % de tierra silvestre", "50% wild land") },
    ],
  },
  {
    id: "u3",
    titulo: b("Usos del cono de 120 ha (fase 1)", "Uses of the 120 ha cone (phase 1)"),
    descripcion: b(
      "Qué uso priorizar dentro del cono de 120 hectáreas de la fase 1.",
      "Which use to prioritize inside the 120-hectare cone of phase 1.",
    ),
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-30T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    // Para ver en la demo la regla "voto secreto".
    voto: "secreto",
    opciones: [
      { id: "residencial", etiqueta: b("Residencial", "Residential") },
      { id: "chacras", etiqueta: b("Chacras productivas con riego", "Productive irrigated smallholdings") },
      { id: "bosque", etiqueta: b("Restauración de bosque nativo", "Native forest restoration") },
      { id: "centro", etiqueta: b("Centro comunitario / cowork", "Community center / coworking") },
      { id: "vivero", etiqueta: b("Vivero y banco de semillas", "Nursery and seed bank") },
      { id: "costa", etiqueta: b("Costa del río en conservación", "Riverbank under conservation") },
    ],
  },
  {
    id: "u4",
    titulo: b("Primer presupuesto de regeneración", "First regeneration budget"),
    descripcion: b(
      "Cómo repartir el primer presupuesto de regeneración entre cinco frentes.",
      "How to split the first regeneration budget across five fronts.",
    ),
    modo: "presupuesto",
    ambito: "equipo",
    cierre: "2026-11-30T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    voto: "abierto",
    presupuesto: {
      montoCentavos: 2_000_000,
      moneda: "USD",
      nota: b("Sugerencia del equipo: lo decide Franz", "Team suggestion: Franz decides"),
    },
    opciones: [
      { id: "hidrologico", etiqueta: b("Estudio hidrológico", "Hydrological study") },
      { id: "piedra", etiqueta: b("Obras de piedra a mano en el cauce", "Hand-built stone works in the stream bed") },
      { id: "vivero", etiqueta: b("Vivero de nativas", "Native plant nursery") },
      { id: "linea-base", etiqueta: b("Línea de base y monitoreo", "Baseline and monitoring") },
      { id: "permacultura", etiqueta: b("Diseño de permacultura profesional", "Professional permaculture design") },
    ],
  },
];

/** Votos de ejemplo por consulta y persona, en el orden de las opciones. La persona 6 no votó. */
const VOTOS: Record<string, number[][]> = {
  u1: [
    [5, 4, 1, 1, 2, 3],
    [6, 3, 2, 0, 1, 2],
    [4, 5, 0, 2, 3, 1],
    [7, 2, 1, 1, 0, 3],
    [3, 3, 3, 2, 2, 2],
  ],
  u2: [
    [3, 5, 2, 1],
    [2, 4, 3, 0],
    [4, 3, 1, 1],
    [1, 3, 4, 2],
    [2, 2, 2, 2],
  ],
  u3: [
    [3, 2, 4, 3, 2, 1],
    [1, 4, 3, 2, 3, 3],
    [2, 3, 5, 1, 1, 2],
    [4, 1, 2, 3, 2, 2],
    [2, 2, 3, 2, 4, 1],
  ],
  u4: [
    [4, 3, 5, 2, 1],
    [3, 2, 6, 3, 0],
    [5, 4, 2, 2, 1],
    [2, 5, 3, 1, 3],
    [3, 3, 4, 3, 2],
  ],
};

/** Repartos de ejemplo: consulta → persona → reparto (todos válidos; lo prueba un test). */
export const REPARTOS_EJEMPLO: Record<string, Record<string, Reparto>> = Object.fromEntries(
  CONSULTAS.map((c) => [
    c.id,
    Object.fromEntries(
      VOTOS[c.id].map((votos, i) => [PADRON_EJEMPLO[i].id, Object.fromEntries(c.opciones.map((o, k) => [o.id, votos[k]]))]),
    ),
  ]),
);

export function buscarConsulta(id: string): Consulta | undefined {
  return CONSULTAS.find((c) => c.id === id);
}
