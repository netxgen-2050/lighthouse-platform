// Textos de Explorar (`/explorar/*`): una página por sección, Territorio, Barrio Norte y Lotes (spec explorar-paginas).
// Borrador de agente, para que Gus lo ajuste. Ningún número se escribe acá. Las secciones reusan los textos de
// `territorio`, `barrios` y `lotes`; acá solo van el héroe, las pestañas, el título de cada página y la apertura de cada sección.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const G = GLOSARIO;

const es = {
  titulo: "Explorar Lighthouse",
  sobretitulo: "Lighthouse VRN · Río Negro, Argentina",
  bajada: "El territorio, el barrio y los lotes en un solo recorrido: primero el lugar, después los números.",
  barra: {
    aria: "Secciones de Explorar",
    territorio: G.territorio.es,
    barrio: "Barrio Norte",
    lotes: G.lotes.es,
  },
  abriendo: "Abriendo Explorar…",
  paginas: {
    territorio: `${G.territorio.es} · Explorar`,
    barrio: "Barrio Norte · Explorar",
    lotes: `${G.lotes.es} · Explorar`,
  },
  territorio: {
    titulo: G.territorio.es,
    intro: "El mapa del Macrolote 7 con sus capas, y en qué estado administrativo está cada loteo.",
  },
  barrio: {
    titulo: "Barrio Norte",
    intro: "Cuántos lotes hay en cada estado, lo que va al bien común y, con una cuenta, la obra del barrio.",
  },
  lotes: {
    titulo: G.lotes.es,
    intro: "Cada lote con su superficie y su estado. Tocá uno para ver su ficha, sus derechos y sus costos.",
  },
  // Lista y mapa de lotes (spec ux-explorar). Los números llegan por parámetro desde el loteo: nunca se escriben acá.
  lista: {
    resumen: (total: number, disponibles: number) => `${total} lotes · ${disponibles} disponibles`,
    filtroEstado: "Filtrar por estado",
    orden: "Ordenar por",
    ordenes: { numero: "Número", superficie: "Superficie, de menor a mayor", "superficie-desc": "Superficie, de mayor a menor" },
    sinResultados: "Ningún lote tiene ese estado.",
    verLista: "Ver lista",
    verMapa: "Ver mapa",
    asa: "Subir o bajar la lista de lotes",
    cantidad: (n: number) => `Mostrando ${n} lotes`,
    precioEjemplo: (monto: string) => `desde ${monto} · ejemplo`,
    sinSuperficie: "Superficie: sin dato",
    elegido: "Lote elegido",
    verElLote: "Ver el lote",
    cerrarTarjeta: "Cerrar",
  },
  mapaLotes: {
    aria: (disponibles: number, reservados: number, vendidos: number) =>
      `Mapa de los lotes del sector norte: ${disponibles} disponibles, ${reservados} reservados y ${vendidos} vendidos. La selección se hace desde la lista.`,
    leyenda: "Leyenda del mapa",
    disponible: "Disponible: relleno liso",
    reservado: "Reservado: borde de trazos",
    vendido: "Vendido: borde de puntos",
  },
  territorioLotes: {
    ver: (n: number) => `Ver los ${n} lotes`,
    leyendaCompleta: "Ver la leyenda completa",
    leyendaCompacta: "Leyenda",
  },
  ficha: {
    plano: "Plano del lote",
    indicadores: "Datos del lote",
    superficie: "Superficie",
    estado: "Estado",
    precio: "Precio de ejemplo",
    cuotas: "En cuotas",
    cuotasSi: "Sí, simulado",
    comunYTuyo: "Qué es tuyo y qué es de todos",
    costos: "Costos del lote",
  },
};

const en: Textos<typeof es> = {
  titulo: "Explore Lighthouse",
  sobretitulo: "Lighthouse VRN · Río Negro province, Argentina",
  bajada: "The territory, the neighborhood and the lots in a single walk: the place first, then the numbers.",
  barra: {
    aria: "Explore sections",
    territorio: G.territorio.en,
    barrio: "Barrio Norte",
    lotes: G.lotes.en,
  },
  abriendo: "Opening Explore…",
  paginas: {
    territorio: `${G.territorio.en} · Explore`,
    barrio: "Barrio Norte · Explore",
    lotes: `${G.lotes.en} · Explore`,
  },
  territorio: {
    titulo: G.territorio.en,
    intro: "The map of Macrolote 7 with its layers, and the administrative status of each subdivision.",
  },
  barrio: {
    titulo: "Barrio Norte",
    intro: "How many lots are in each state, what goes to the commons and, with an account, the neighborhood works.",
  },
  lotes: {
    titulo: G.lotes.en,
    intro: "Each lot with its area and state. Tap one to see its page, its rights and its costs.",
  },
  lista: {
    resumen: (total: number, disponibles: number) => `${total} lots · ${disponibles} available`,
    filtroEstado: "Filter by state",
    orden: "Sort by",
    ordenes: { numero: "Number", superficie: "Area, smallest first", "superficie-desc": "Area, largest first" },
    sinResultados: "No lot has that state.",
    verLista: "Show list",
    verMapa: "Show map",
    asa: "Raise or lower the lot list",
    cantidad: (n: number) => `Showing ${n} lots`,
    precioEjemplo: (monto: string) => `from ${monto} · example`,
    sinSuperficie: "Area: no data",
    elegido: "Selected lot",
    verElLote: "See the lot",
    cerrarTarjeta: "Close",
  },
  mapaLotes: {
    aria: (disponibles: number, reservados: number, vendidos: number) =>
      `Map of the northern sector lots: ${disponibles} available, ${reservados} reserved and ${vendidos} sold. Selection is done from the list.`,
    leyenda: "Map legend",
    disponible: "Available: solid fill",
    reservado: "Reserved: dashed border",
    vendido: "Sold: dotted border",
  },
  territorioLotes: {
    ver: (n: number) => `See the ${n} lots`,
    leyendaCompleta: "See the full legend",
    leyendaCompacta: "Legend",
  },
  ficha: {
    plano: "Lot plan",
    indicadores: "Lot data",
    superficie: "Area",
    estado: "State",
    precio: "Example price",
    cuotas: "In installments",
    cuotasSi: "Yes, simulated",
    comunYTuyo: "What is yours and what is everyone's",
    costos: "Lot costs",
  },
};

export const explorar = conVocabulario({ es, en });
