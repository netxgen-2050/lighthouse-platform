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
  bajada: "El territorio, el barrio y los lotes en un solo recorrido: primero el lugar, después los números. Todo es de ejemplo.",
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
};

const en: Textos<typeof es> = {
  titulo: "Explore Lighthouse",
  sobretitulo: "Lighthouse VRN · Río Negro province, Argentina",
  bajada: "The territory, the neighborhood and the lots in a single walk: the place first, then the numbers. Everything is sample data.",
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
};

export const explorar = conVocabulario({ es, en });
