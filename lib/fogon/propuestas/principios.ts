// Principios del Lighthouse (C2) y su costura. Las pantallas, la validación de bloqueos, el Guardián y los tests leen SOLO de
// `fuentePrincipios`. Hoy es una lista inicial de ejemplo, en borrador, a ratificar por el común; cuando exista el manifiesto
// de la meta-tribu Lighthouse se suma un adaptador y se cambia la línea de `fuentePrincipios`. Los ids son estables.
// Las comunidades de referencia no se nombran (decisión de Gus); la Declaración Universal de los Derechos de la Madre Tierra sí.
import type { Bi, PrincipioId } from "./tipos";

export type Principio = { id: PrincipioId; nombre: Bi; explicacion: Bi };

export interface FuentePrincipios {
  principios(): readonly Principio[];
  estado: "borrador" | "ratificada";
  origen: "ejemplo" | "manifiesto";
}

const p = (id: PrincipioId, nombre: [string, string], explicacion: [string, string]): Principio => ({
  id,
  nombre: { es: nombre[0], en: nombre[1] },
  explicacion: { es: explicacion[0], en: explicacion[1] },
});

const LISTA: readonly Principio[] = [
  p("vida-en-el-centro", ["La vida en el centro", "Life at the center"], [
    "Cada decisión mira primero qué le hace a la vida, humana y más que humana",
    "Every decision first looks at what it does to life, human and more-than-human",
  ]),
  p("derechos-madre-tierra", ["Derechos de la Madre Tierra", "Rights of Mother Earth"], [
    "La Tierra tiene derecho a existir, regenerarse, mantener sus ciclos y vivir sin contaminación (Declaración Universal de los Derechos de la Madre Tierra)",
    "The Earth has the right to exist, regenerate, keep its cycles and live free of pollution (Universal Declaration of the Rights of Mother Earth)",
  ]),
  p("tierra-no-mercancia", ["La tierra no es mercancía", "Land is not a commodity"], [
    "La tierra se cuida y se comparte; no se especula con ella",
    "Land is cared for and shared; it is not used for speculation",
  ]),
  p("suelo-vivo", ["Suelo vivo", "Living soil"], [
    "Suelo cubierto todo el año, sin agroquímicos de síntesis, lo que se poda vuelve al suelo",
    "Soil covered all year, no synthetic agrochemicals, and what is pruned goes back to the soil",
  ]),
  p("agua-viva", ["Agua viva", "Living water"], [
    "Capturar y frenar la lluvia, usar la lluvia antes que la napa, tratar las aguas con plantas y microbios",
    "Catch and slow the rain, use rain before groundwater, treat water with plants and microbes",
  ]),
  p("aire-limpio", ["Aire limpio", "Clean air"], [
    "Sin quemas tóxicas; plantar árboles y guardar carbono en el suelo",
    "No toxic burning; plant trees and store carbon in the soil",
  ]),
  p("biodiversidad", ["Más vida silvestre", "More wild life"], [
    "Buena parte de la tierra queda silvestre o vuelve a serlo; se cuidan los árboles viejos y la diversidad",
    "A good part of the land stays wild or becomes wild again; old trees and diversity are protected",
  ]),
  p("nada-se-tira", ["Nada se tira", "Nothing is thrown away"], [
    "Reducir, separar, compostar y reusar; sin plásticos de un solo uso",
    "Reduce, sort, compost and reuse; no single-use plastics",
  ]),
  p("recursos-con-medida", ["Recursos con medida", "Resources in measure"], [
    "Energía renovable primero, materiales y comida del lugar, poca superficie construida",
    "Renewable energy first, local materials and food, little built surface",
  ]),
  p("generaciones-futuras", ["Siete generaciones", "Seven generations"], [
    "Se mira el efecto de cada decisión en las generaciones que vienen",
    "The effect of each decision on the generations to come is considered",
  ]),
  p("voz-afectada", ["Decide quien está afectada", "Those affected decide"], [
    "Quien vive una regla participa en darle forma",
    "Whoever lives under a rule takes part in shaping it",
  ]),
  p("subsidiariedad", ["Lo más cerca posible", "As close as possible"], [
    "Se decide en el círculo más chico que pueda decidirlo",
    "Decisions are made in the smallest circle that can make them",
  ]),
  p("cuidado-del-proceso", ["Confianza, respeto y no violencia", "Trust, respect and nonviolence"], [
    "Persuadir, nunca dominar; escuchar y criticar la idea, no a la persona",
    "Persuade, never dominate; listen, and criticize the idea, not the person",
  ]),
  p("poder-compartido", ["Poder compartido", "Shared power"], [
    "Compartir saberes e información; nadie concentra el poder",
    "Share knowledge and information; nobody concentrates power",
  ]),
  p("plata-vuelve-a-la-tierra", ["La plata del común vuelve a la tierra", "Common money returns to the land"], [
    "Lo que se junta en común se usa para regenerar",
    "What is gathered in common is used to regenerate",
  ]),
  p("personas-deciden", ["Las máquinas sugieren; las personas deciden", "Machines suggest; people decide"], [
    "Hifa y el Guardián pueden sugerir; nunca deciden",
    "Hifa and the Guardian can suggest; they never decide",
  ]),
];

export const principiosDeEjemplo: FuentePrincipios = {
  principios: () => LISTA,
  estado: "borrador",
  origen: "ejemplo",
};

/** Único punto que cambia cuando exista el manifiesto de la meta-tribu Lighthouse. */
export const fuentePrincipios: FuentePrincipios = principiosDeEjemplo;

/** null → la pantalla muestra "principio fuera de la lista vigente" con el id. */
export function principioPorId(id: string): Principio | null {
  return fuentePrincipios.principios().find((x) => x.id === id) ?? null;
}
