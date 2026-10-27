// Textos de la gobernanza fractal: la página `/fogon/gobernanza` ("Cómo decidimos"), la marca de validación de la
// ficha de tribu y la sección "Quiénes te validaron" de Mi recorrido. Los nombres de tribus y de círculos de ejemplo
// viven en `lib/tribus/datos.ts` y `lib/gobernanza/datos.ts` (con su inglés).
import type { Textos } from "../tipos";

const es = {
  titulo: "Cómo decidimos",
  sobre: "Fogón de decisiones",
  volver: "← Fogón",
  intro:
    "Así se organiza el Lighthouse: las personas trabajan en círculos dentro de su tribu, las doce tribus deciden lo suyo y Lighthouse, el común, las reúne. Lo que una tribu no puede resolver sola sube a un consejo con un lugar por tribu.",
  avisoEjemplo: "Estructura de ejemplo: el reglamento lo define el diseño legal.",
  capas: {
    titulo: "Quién valida a quién",
    comunTribus: "El común valida a las tribus.",
    tribusPersonas: "Las tribus validan a las personas.",
    sube: "Lo que una tribu no puede resolver sola sube al consejo.",
    nota: "Las validaciones son simuladas: quedan como registros en este navegador y no tienen valor legal.",
  },
  dibujo: {
    titulo: "La estructura en un dibujo",
    descripcion:
      "Dibujo de la estructura: Lighthouse, el común, en el centro; las doce tribus alrededor, cada una con su estado; y el consejo abajo, con un lugar por tribu validada. El mismo contenido está en la lista de más abajo.",
    centro: "Lighthouse",
    centroSub: "el común",
    cantidadCirculos: (n: number) => (n === 1 ? "1 círculo" : `${n} círculos`),
    sinCirculos: "sin círculos",
    transversales: "Círculos transversales",
    consejo: "Consejo: un lugar por tribu validada",
    sube: "sube al consejo",
    validaPersona: "la tribu valida a la persona",
    leyenda: "Línea llena: validada por el común. Línea punteada: todavía no validada. Círculos chicos: los círculos de la tribu.",
    estadoActiva: "● Activa",
    estadoFormacion: "◐ En formación",
    estadoVacante: "○ Busca tribu",
  },
  lista: {
    titulo: "La estructura en una lista",
    comun: "Lighthouse (el común)",
    tribus: "Las doce tribus",
    circulos: "Círculos de la tribu",
    sinCirculos: "Sin círculos todavía",
    transversales: "Círculos transversales (cuelgan del común)",
    participan: (tribus: string) => `Participan: ${tribus}`,
    sinTribus: "No está atado a ninguna tribu",
    zonaSinDato: "Zona del territorio: sin dato",
    estado: "Estado:",
  },
  consejo: {
    titulo: "El consejo",
    intro: "Un lugar por cada tribu validada por el común. Las tribus que buscan tribu todavía no tienen lugar.",
    lugarDe: (tribu: string) => `Lugar de ${tribu}`,
    sinRepresentante: "Sin representante elegido",
    sinLugar: "Sin lugar en el consejo todavía",
    votan: "En la versión real votan los representantes.",
  },
  verDecisiones: "Ver las decisiones en el Fogón",
  ficha: {
    validadaComun: "Validada por el común",
    noValidadaComun: "Todavía no validada por el común",
    ejemplo: "(ejemplo)",
  },
  recorrido: {
    titulo: "Quiénes te validaron",
    ninguna: "Todavía ninguna tribu te validó.",
    validadaPor: (tribu: string) => `Validada por ${tribu}`,
    nota: "Es lo que ya tenés como membresía aceptada, mostrado como validación. Simulado: queda solo en este navegador.",
  },
};

const en: Textos<typeof es> = {
  titulo: "How we decide",
  sobre: "Fireside decisions",
  volver: "← Fireside",
  intro:
    "This is how the Lighthouse is organized: people work in circles inside their tribe, the twelve tribes decide their own matters, and Lighthouse, the commons, brings them together. What a tribe cannot settle on its own goes up to a council with one seat per tribe.",
  avisoEjemplo: "Example structure: the rules are set by the legal design.",
  capas: {
    titulo: "Who validates whom",
    comunTribus: "The commons validates the tribes.",
    tribusPersonas: "The tribes validate the people.",
    sube: "What a tribe cannot settle on its own goes up to the council.",
    nota: "Validations are simulated: they are kept as records in this browser and have no legal value.",
  },
  dibujo: {
    titulo: "The structure as a drawing",
    descripcion:
      "Drawing of the structure: Lighthouse, the commons, in the middle; the twelve tribes around it, each with its status; and the council below, with one seat per validated tribe. The same content is in the list further down.",
    centro: "Lighthouse",
    centroSub: "the commons",
    cantidadCirculos: (n: number) => (n === 1 ? "1 circle" : `${n} circles`),
    sinCirculos: "no circles",
    transversales: "Cross-cutting circles",
    consejo: "Council: one seat per validated tribe",
    sube: "goes up to the council",
    validaPersona: "the tribe validates the person",
    leyenda: "Solid line: validated by the commons. Dotted line: not validated yet. Small circles: the tribe's circles.",
    estadoActiva: "● Active",
    estadoFormacion: "◐ Forming",
    estadoVacante: "○ Looking for a tribe",
  },
  lista: {
    titulo: "The structure as a list",
    comun: "Lighthouse (the commons)",
    tribus: "The twelve tribes",
    circulos: "Circles of the tribe",
    sinCirculos: "No circles yet",
    transversales: "Cross-cutting circles (hang from the commons)",
    participan: (tribus: string) => `Taking part: ${tribus}`,
    sinTribus: "Not tied to any tribe",
    zonaSinDato: "Area of the territory: no data",
    estado: "Status:",
  },
  consejo: {
    titulo: "The council",
    intro: "One seat for each tribe validated by the commons. Tribes that are looking for a tribe have no seat yet.",
    lugarDe: (tribu: string) => `Seat of ${tribu}`,
    sinRepresentante: "No representative chosen",
    sinLugar: "No seat on the council yet",
    votan: "In the real version the representatives vote.",
  },
  verDecisiones: "See the decisions in the Fireside",
  ficha: {
    validadaComun: "Validated by the commons",
    noValidadaComun: "Not validated by the commons yet",
    ejemplo: "(example)",
  },
  recorrido: {
    titulo: "Who validated you",
    ninguna: "No tribe has validated you yet.",
    validadaPor: (tribu: string) => `Validated by ${tribu}`,
    nota: "This is your accepted membership, shown as a validation. Simulated: it stays only in this browser.",
  },
};

export const gobernanza = { es, en };
