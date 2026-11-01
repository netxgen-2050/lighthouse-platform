// Manifiesto de la meta-tribu Lighthouse VRN (cambio `manifiesto-lighthouse-vrn`). BORRADOR a ratificar por el común y
// datos de EJEMPLO: lo redactó un agente a partir del design (§3). El español es el original; el inglés lo tradujo un
// agente y está pendiente de revisión nativa. No nombra a las comunidades de referencia de las que salieron los
// principios (un test lo vigila).
//
// Es la FUENTE ÚNICA de los principios: el Fogón, Hifa y el Guardián (IA) los leen de acá (`principiosDelManifiesto`).
import type { BilingueConOriginal, Idioma } from "@/lib/idioma/tipos";

/** Un texto del manifiesto: español original y su traducción al inglés. */
const v = (es: string, en: string): BilingueConOriginal => ({ es, en, original: "es" });

/** La entidad, en el texto del manifiesto. Es un nombre propio: no se traduce. */
export const NOMBRE_META_TRIBU = "Lighthouse VRN";

/**
 * Nombre visible del común (ficha, tarjeta de Tribus, raíz de la holarquía). Decisión de Gus (29-oct-2026): "Procomún" en
 * español y "Commons" en inglés. Es el único lugar donde se escribe: ninguna pantalla lo repite a mano.
 */
export const NOMBRE_DEL_COMUN: Record<Idioma, string> = {
  es: "Lighthouse VRN Procomún",
  en: "Lighthouse VRN Commons",
};

export function nombreDelComun(idioma: Idioma = "es"): string {
  return NOMBRE_DEL_COMUN[idioma];
}

export type GrupoPrincipio = "tierra" | "agua" | "comunidad" | "economia" | "generaciones";
export const GRUPOS_PRINCIPIO: readonly GrupoPrincipio[] = ["tierra", "agua", "comunidad", "economia", "generaciones"];

/** Id estable de un principio: es lo que se cita al bloquear un concern. */
export type PrincipioId = string;

export type Principio = {
  id: PrincipioId;
  grupo: GrupoPrincipio;
  nombre: BilingueConOriginal;
  /** Qué significa en la práctica. */
  practica: BilingueConOriginal;
};

export type DerechoTierra = {
  /** Vive en otra lista que los ids de principios: un derecho no se cita al bloquear. */
  id: string;
  nombre: BilingueConOriginal;
  practica: BilingueConOriginal;
  principios: PrincipioId[];
};

export type CompromisoVrn = { titulo: BilingueConOriginal; texto: BilingueConOriginal };

export type ManifiestoVrn = {
  id: "lighthouse";
  proposito: BilingueConOriginal;
  principios: Principio[];
  derechos: DerechoTierra[];
  compromisos: CompromisoVrn[];
  comoSeCambia: BilingueConOriginal[];
  reglaTribus: BilingueConOriginal;
  maquinasSugieren: BilingueConOriginal;
  /** Fecha de la versión, para mostrarla. */
  version: BilingueConOriginal;
  /** Identificador de la versión: cambia cuando cambia el texto. Quien adhirió a otra versión vuelve a adherir. */
  versionId: string;
  estado: "borrador";
  ejemplo: true;
};

/** Versión vigente del manifiesto. Cambiarla pide a todas las personas volver a adherir (decisión de Gus, 29-oct-2026). */
export const VERSION_MANIFIESTO_VRN = "2026-10-29-borrador";

const p = (id: string, grupo: GrupoPrincipio, nombre: BilingueConOriginal, practica: BilingueConOriginal): Principio => ({
  id,
  grupo,
  nombre,
  practica,
});

const PRINCIPIOS: Principio[] = [
  p(
    "vida-en-el-centro",
    "tierra",
    v("La vida en el centro", "Life at the center"),
    v(
      "Antes de decidir, nos preguntamos qué le hace a la vida, humana y más que humana; si la daña, buscamos otra forma.",
      "Before deciding, we ask what it does to life, human and more-than-human; if it harms it, we look for another way.",
    ),
  ),
  p(
    "suelo-vivo",
    "tierra",
    v("Suelo vivo", "Living soil"),
    v(
      "Suelo cubierto todo el año, sin agroquímicos de síntesis, y lo que se poda vuelve a la tierra.",
      "Soil covered all year round, no synthetic agrochemicals, and what is pruned goes back to the land.",
    ),
  ),
  p(
    "biodiversidad",
    "tierra",
    v("Más vida silvestre", "More wild life"),
    v(
      "Una parte de la tierra queda silvestre o vuelve a serlo, crece etapa por etapa y nunca se achica; cuidamos los árboles viejos y las especies del monte.",
      "Part of the land stays wild or becomes wild again, grows stage by stage and never shrinks; we look after old trees and the species of the native scrubland.",
    ),
  ),
  p(
    "aire-limpio",
    "tierra",
    v("Aire limpio", "Clean air"),
    v(
      "No quemamos lo que enferma el aire; plantamos árboles y guardamos carbono en el suelo.",
      "We do not burn what makes the air sick; we plant trees and store carbon in the soil.",
    ),
  ),
  p(
    "agua-viva",
    "agua",
    v("Agua viva", "Living water"),
    v(
      "Frenamos, esparcimos e infiltramos la lluvia, y usamos la lluvia antes que la napa.",
      "We slow, spread and sink the rain, and we use rainwater before groundwater.",
    ),
  ),
  p(
    "agua-vuelve-limpia",
    "agua",
    v("El agua vuelve limpia", "Water goes back clean"),
    v(
      "Tratamos las aguas grises y negras con plantas y microbios, y devolvemos el agua limpia a la tierra y al río.",
      "We treat grey and black water with plants and microbes, and we return the water clean to the land and the river.",
    ),
  ),
  p(
    "voz-afectada",
    "comunidad",
    v("Decide quien vive la regla", "Whoever lives the rule shapes it"),
    v(
      "Quien va a vivir con una decisión participa en darle forma.",
      "Whoever will live with a decision takes part in shaping it.",
    ),
  ),
  p(
    "subsidiariedad",
    "comunidad",
    v("Lo más cerca posible", "As close as possible"),
    v(
      "Decide el círculo más chico que puede decidir; lo que es de todos, lo decide el común.",
      "The smallest circle that can decide, decides; what belongs to everyone is decided by the commons.",
    ),
  ),
  p(
    "cuidado-del-proceso",
    "comunidad",
    v("Confianza, respeto y no violencia", "Trust, respect and nonviolence"),
    v(
      "Persuadimos, nunca dominamos; escuchamos y criticamos la idea, no a la persona.",
      "We persuade, we never dominate; we listen and we criticize the idea, not the person.",
    ),
  ),
  p(
    "poder-compartido",
    "comunidad",
    v("Poder y saberes compartidos", "Shared power and knowledge"),
    v(
      "Compartimos lo que sabemos y la información; los roles rotan y nadie concentra el poder.",
      "We share what we know and the information; roles rotate and no one concentrates power.",
    ),
  ),
  p(
    "tierra-no-mercancia",
    "economia",
    v("La tierra del común no es mercancía", "The common land is not a commodity"),
    v(
      "La tierra del común se cuida y se comparte; no especulamos con ella.",
      "The common land is cared for and shared; we do not speculate with it.",
    ),
  ),
  p(
    "plata-vuelve-a-la-tierra",
    "economia",
    v("Damos al todo más de lo que recibimos", "We give the whole more than we take"),
    v(
      "Regenerar no es un costo, es lo que más vale: una parte de lo que se gana vuelve a regenerar la tierra común.",
      "Regenerating is not a cost, it is what is worth the most: part of what is earned goes back to regenerating the common land.",
    ),
  ),
  p(
    "recursos-con-medida",
    "economia",
    v("Recursos con medida", "Resources in measure"),
    v(
      "Energía renovable primero, materiales y comida del lugar, poca superficie construida, y nada se tira: se repara, se composta o se reusa.",
      "Renewable energy first, local materials and food, little built surface, and nothing is thrown away: it is repaired, composted or reused.",
    ),
  ),
  p(
    "generaciones-futuras",
    "generaciones",
    v("Siete generaciones", "Seven generations"),
    v(
      "Miramos el efecto de cada decisión en las siete generaciones que vienen, humanas y más que humanas.",
      "We look at the effect of each decision on the next seven generations, human and more-than-human.",
    ),
  ),
  p(
    "de-lo-chico-a-lo-grande",
    "generaciones",
    v("De lo chico a lo grande", "From small to large"),
    v(
      "Diseñamos de lo grande a lo chico y crecemos de lo chico a lo grande, al ritmo que la tierra nos enseña.",
      "We design from large to small and grow from small to large, at the pace the land teaches us.",
    ),
  ),
];

const DERECHOS: DerechoTierra[] = [
  {
    id: "existir",
    nombre: v("A existir", "To exist"),
    practica: v(
      "El monte, el río y sus seres no son un recurso para agotar.",
      "The scrubland, the river and their beings are not a resource to exhaust.",
    ),
    principios: ["vida-en-el-centro", "biodiversidad"],
  },
  {
    id: "regenerar-ciclos",
    nombre: v("A regenerar sus ciclos", "To regenerate its cycles"),
    practica: v(
      "Respetamos los tiempos de la tierra: dejamos descansar y no forzamos.",
      "We respect the land's own time: we let it rest and we do not force it.",
    ),
    principios: ["suelo-vivo", "de-lo-chico-a-lo-grande"],
  },
  {
    id: "agua",
    nombre: v("Al agua", "To water"),
    practica: v(
      "El agua es primero de la vida: del río, de la napa y de los seres que dependen de ella.",
      "Water belongs first to life: to the river, the groundwater and the beings that depend on it.",
    ),
    principios: ["agua-viva", "agua-vuelve-limpia"],
  },
  {
    id: "aire-limpio",
    nombre: v("Al aire limpio", "To clean air"),
    practica: v("No emitimos lo que enferma el aire.", "We do not release what makes the air sick."),
    principios: ["aire-limpio"],
  },
  {
    id: "salud-integral",
    nombre: v("A la salud integral", "To integral health"),
    practica: v(
      "Cuidamos el suelo, el agua, las plantas, los animales y las personas como un solo cuerpo.",
      "We care for soil, water, plants, animals and people as one body.",
    ),
    principios: ["vida-en-el-centro"],
  },
  {
    id: "no-ser-contaminada",
    nombre: v("A no ser contaminada", "To not be polluted"),
    practica: v("Nada tóxico entra a la tierra ni al agua.", "Nothing toxic goes into the land or the water."),
    principios: ["suelo-vivo", "agua-vuelve-limpia", "recursos-con-medida"],
  },
  {
    id: "restauracion",
    nombre: v("A la restauración", "To restoration"),
    practica: v(
      "Lo que se dañó, se repara, y quien daña, repara.",
      "What was damaged gets repaired, and whoever causes damage repairs it.",
    ),
    principios: ["biodiversidad", "plata-vuelve-a-la-tierra"],
  },
];

const COMPROMISOS: CompromisoVrn[] = [
  {
    titulo: v("Pongo la vida en el centro", "I put life at the center"),
    texto: v(
      "Antes de proponer o decidir, me pregunto qué le hace a la tierra, al agua y a la gente, y dejo todo mejor de como lo encontré.",
      "Before proposing or deciding, I ask what it does to the land, the water and the people, and I leave everything better than I found it.",
    ),
  },
  {
    titulo: v("Me cuido y cuido", "I take care of myself and of others"),
    texto: v(
      "Trato a cada persona como alguien con quien voy a convivir años: pregunto antes de suponer y escucho antes de contestar.",
      "I treat each person as someone I will live alongside for years: I ask before assuming and I listen before answering.",
    ),
  },
  {
    titulo: v("Decido con otras personas lo que es de todas", "I decide together with others what belongs to everyone"),
    texto: v(
      "Participo en el Fogón con respeto; si bloqueo una propuesta, digo qué principio de este manifiesto estoy cuidando.",
      "I take part in the Fogón with respect; if I block a proposal, I say which principle of this manifesto I am protecting.",
    ),
  },
  {
    titulo: v("Hablo antes de que el conflicto crezca", "I speak up before conflict grows"),
    texto: v(
      "Lo digo pronto, cara a cara y con respeto; si no alcanza, pido ayuda al equipo de Cuidado y conflictos.",
      "I say it early, face to face and with respect; if that is not enough, I ask the Care and conflicts team for help.",
    ),
  },
  {
    titulo: v("Aporto al común lo que acordé", "I contribute to the commons what I agreed to"),
    texto: v(
      "Tiempo, trabajo, saberes o recursos: lo que aporto queda registrado y se rinde cuentas.",
      "Time, work, knowledge or resources: what I contribute is recorded and accounted for.",
    ),
  },
  {
    titulo: v("Si me voy, me voy bien", "If I leave, I leave well"),
    texto: v(
      "Aviso con tiempo, dejo en orden lo que tenía a cargo y nadie queda atado.",
      "I give notice in good time, I leave in order whatever I was in charge of, and no one is tied down.",
    ),
  },
];

export const MANIFIESTO_VRN: ManifiestoVrn = {
  id: "lighthouse",
  proposito: v(
    "Ponemos la regeneración y la vida en el centro de cada decisión, para que el valle, su agua y su gente estén cada año más vivos que el anterior.",
    "We put regeneration and life at the center of every decision, so that the valley, its water and its people are more alive each year than the year before.",
  ),
  principios: PRINCIPIOS,
  derechos: DERECHOS,
  compromisos: COMPROMISOS,
  comoSeCambia: [
    v(
      "Cualquier persona que adhirió puede proponer un cambio en el Fogón, como decisión del común.",
      "Anyone who has adhered can propose a change in the Fogón, as a decision of the commons.",
    ),
    v(
      "Se adopta solo por consenso del común, siguiendo el proceso de propuestas del Fogón; quien bloquea dice en qué principio de este manifiesto se apoya.",
      "It is adopted only by consensus of the commons, following the Fogón's proposals process; whoever blocks says which principle of this manifesto they rely on.",
    ),
    v(
      "Cada versión queda con su fecha, y las anteriores se pueden seguir leyendo. Si cambia el texto, quien había adherido vuelve a adherir para seguir participando.",
      "Each version keeps its date, and earlier ones can still be read. If the text changes, whoever had adhered adheres again in order to keep taking part.",
    ),
    v(
      "Hasta que el común lo ratifique, este texto es un borrador.",
      "Until the commons ratifies it, this text is a draft.",
    ),
  ],
  reglaTribus: v(
    "Cada tribu puede sumar principios propios para cuidar más. Ninguno puede contradecir, aflojar ni reemplazar los de Lighthouse VRN. Si a una tribu un principio de este manifiesto no le sirve, propone cambiarlo en el Fogón del común.",
    "Each tribe can add its own principles to care for more. None can contradict, loosen or replace those of Lighthouse VRN. If a principle of this manifesto does not work for a tribe, it proposes changing it in the Fogón of the commons.",
  ),
  maquinasSugieren: v(
    "Hifa y el Guardián (IA) pueden sugerir desde estos principios; nunca deciden.",
    "Hifa and the Guardian (AI) can make suggestions based on these principles; they never decide.",
  ),
  version: v("29 de octubre de 2026 · borrador", "October 29, 2026 · draft"),
  versionId: VERSION_MANIFIESTO_VRN,
  estado: "borrador",
  ejemplo: true,
};

// --- Fuente única de principios ---

export function principiosLighthouseVrn(): readonly Principio[] {
  return MANIFIESTO_VRN.principios;
}

/** Un principio por su id; `null` si no está en la lista vigente (nunca da error). */
export function principioVrnPorId(id: string): Principio | null {
  return MANIFIESTO_VRN.principios.find((x) => x.id === id) ?? null;
}

/** Un principio con la forma de `fogon-propuestas`: allá `explicacion` es la `practica` de acá. */
export type PrincipioParaPropuestas = Principio & { explicacion: BilingueConOriginal };

const PARA_PROPUESTAS: readonly PrincipioParaPropuestas[] = PRINCIPIOS.map((x) => ({ ...x, explicacion: x.practica }));

/** Con la forma de `FuentePrincipios` de `fogon-propuestas`. */
export const principiosDelManifiesto = {
  principios: (): readonly PrincipioParaPropuestas[] => PARA_PROPUESTAS,
  estado: "borrador" as const,
  origen: "manifiesto" as const,
};

/** Los principios de un grupo, en el orden del manifiesto. */
export function principiosDelGrupo(grupo: GrupoPrincipio): readonly Principio[] {
  return MANIFIESTO_VRN.principios.filter((x) => x.grupo === grupo);
}
