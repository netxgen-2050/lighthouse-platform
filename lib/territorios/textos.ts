// Textos de ejemplo del terreno común y de los lugares de interés (no vienen del GeoJSON), con su inglés
// (pendiente de revisión nativa). Los nombres propios de los lugares (Temazcal, Gaia Sapiens Institute) no se traducen.
import { sinDato } from "@/lib/idioma/formatos";
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import type { Territorio } from "./tipos";

export const TEXTO_COMUN: { para: BilingueConOriginal; cuida: BilingueConOriginal } = {
  para: {
    es: "Agua, energía, vivero y los espacios que usan todas las tribus (ejemplo).",
    en: "Water, energy, a plant nursery and the spaces used by all the tribes (sample).",
  },
  cuida: {
    es: "El Guardián del Lighthouse, con la participación de todas las tribus (ejemplo).",
    en: "The Lighthouse Guardian, with the participation of all the tribes (sample).",
  },
};

const LUGARES: Record<string, BilingueConOriginal> = {
  "lugar-olivos": {
    es: "Olivar existente de la zona, parte del paisaje productivo (ejemplo).",
    en: "Existing olive grove in the area, part of the productive landscape (sample).",
  },
  "lugar-temazcal": {
    es: "Espacio de encuentro y ceremonia (ejemplo).",
    en: "A space for gathering and ceremony (sample).",
  },
  "lugar-restaurant-coliving-cowork-sala-de-practicas-banos": {
    es: "Servicios compartidos: restaurante, coliving, cowork, sala de prácticas y baños (ejemplo).",
    en: "Shared services: restaurant, coliving, coworking, practice room and restrooms (sample).",
  },
  "lugar-gaia-sapiens-institute": {
    es: "Instituto de formación y aprendizaje del territorio (ejemplo).",
    en: "Institute for training and learning in the territory (sample).",
  },
  "lugar-nave-tierra-piramidal": {
    es: "Construcción singular de tierra con forma piramidal (ejemplo).",
    en: "A singular earth building with a pyramid shape (sample).",
  },
};

// Nombres legibles (el JSON fuente los trae sin mayúsculas ni tildes). Solo los nombres descriptivos tienen inglés:
// "Temazcal" es un nombre propio y queda igual.
const NOMBRES: Record<string, BilingueConOriginal> = {
  "lugar-olivos": { es: "Olivos", en: "Olive trees" },
  "lugar-temazcal": { es: "Temazcal", en: "Temazcal" },
  "lugar-restaurant-coliving-cowork-sala-de-practicas-banos": {
    es: "Restaurante, coliving, cowork, sala de prácticas y baños",
    en: "Restaurant, coliving, cowork, practice room and restrooms",
  },
};

/** Nombre para mostrar; si no hay mapeo, el del dato (un nombre propio, que no se traduce). */
export function nombreDeLugar(id: string, nombre: string, idioma: Idioma = "es"): string {
  return Object.hasOwn(NOMBRES, id) ? textoEn(NOMBRES[id], idioma) : nombre;
}

/** Si el nombre es propio (sin traducción distinta, como Temazcal): va con translate="no". */
export function esNombrePropioDeLugar(id: string): boolean {
  if (!Object.hasOwn(NOMBRES, id)) return true;
  const n = NOMBRES[id];
  return n.en === n.es;
}

/** Una línea de descripción; si falta, "sin dato" / "no data". */
export function descripcionDeLugar(id: string, idioma: Idioma = "es"): string {
  return Object.hasOwn(LUGARES, id) ? textoEn(LUGARES[id], idioma) : sinDato(idioma);
}

// Los textos de ejemplo del territorio (`lib/territorios/datos.ts`) con su inglés, por id de territorio.
type TextosTerritorio = {
  ubicacion: BilingueConOriginal;
  descripcion: BilingueConOriginal;
  bienesComunes: BilingueConOriginal[];
};

const TERRITORIOS: Record<string, TextosTerritorio> = {
  lighthouse: {
    ubicacion: {
      es: "BioPueblo Mainqué, margen sur del Río Negro",
      en: "BioPueblo Mainqué, south bank of the Río Negro",
    },
    descripcion: {
      es: "~993 ha, doce barrios y las tribus que los están formando.",
      en: "~993 ha, twelve neighborhoods and the tribes forming them.",
    },
    bienesComunes: [
      { es: "Agua: toma, cisterna y riego", en: "Water: intake, cistern and irrigation" },
      { es: "Energía: parque solar comunitario", en: "Energy: community solar park" },
      { es: "Núcleo común: bioquincho y cocina", en: "Common core: bioquincho (shared gathering hall) and kitchen" },
      { es: "Vivero y banco de semillas", en: "Plant nursery and seed bank" },
    ],
  },
};

/** El territorio con ubicación, descripción y bienes comunes en un idioma. El nombre es propio y no se traduce. */
export function territorioEn(t: Territorio, idioma: Idioma): Territorio {
  const textos = Object.hasOwn(TERRITORIOS, t.id) ? TERRITORIOS[t.id] : undefined;
  if (idioma === "es" || !textos) return t;
  return {
    ...t,
    ubicacion: textoEn(textos.ubicacion, idioma),
    descripcion: textoEn(textos.descripcion, idioma),
    bienesComunes: textos.bienesComunes.map((b) => textoEn(b, idioma)),
  };
}

/** Para los tests: los textos de ejemplo con su inglés. */
export const TEXTOS_BILINGUES = { TEXTO_COMUN, LUGARES, NOMBRES, TERRITORIOS };
