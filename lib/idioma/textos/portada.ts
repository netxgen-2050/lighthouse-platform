// Textos de la portada (`/`): la promesa a 2030, Argentina, los capitales, los tres caminos y los enlaces.
// Son borrador de agente (portada-vrn), para que Gus los ajuste. Las cifras no se escriben acá: salen de `lib/portada-vrn.ts`.
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const es = {
  sobretitulo: "Lighthouse VRN · Río Negro, Argentina",
  tituloInicio: "Regenerar desde el agua.",
  tituloFin: "Una promesa a 2030.",
  bajada:
    "Para 2030, Lighthouse VRN quiere ser un territorio que se regenera desde el agua, en el Alto Valle de Río Negro, cerca de Vaca Muerta: con trabajo en industrias regenerativas y una comunidad que lo vive y lo cuida. Es nuestra meta, no una garantía.",
  explorarTerritorio: "Explorar el territorio",
  sumarte: "Elegí cómo sumarte",
  promesa: {
    agua: {
      titulo: "Agua.",
      texto: "Todo empieza por el agua: leerla, guardarla y llevarla. Sin eso no hay suelo, ni árboles, ni casa.",
    },
    trabajo: {
      titulo: "Trabajo.",
      texto:
        "Queremos que regenerar sea también una forma de vivir: trabajo en industrias regenerativas, cerca de donde se vive.",
    },
    comunidad: {
      titulo: "Comunidad.",
      texto: "Personas que deciden cómo cuidar lo que es de todos.",
    },
  },
  argentina: {
    titulo: "Argentina, un lugar seguro y abierto",
    /** Va seguido del ⚖ de `ribera`. */
    texto:
      "Un país que recibe a quienes vienen de afuera. Si venís de otro país, hay reglas para comprar tierra rural: leelas acá",
  },
  capitales: { titulo: "Los cinco capitales de la regeneración", fuente: "Fuente" },
  cifras: { titulo: "Cifras del sitio", fuente: "Fuente" },
  porDondeEmpezar: "Por dónde empezar",
  leyendaImagen: "Imagen ilustrativa",
  notaImagen: "Imagen ilustrativa de la Zona A (memoria técnica de Martín): no es una fotografía ni un plano.",
  recomendado: "Recomendado para vos",
  caminos: {
    lotes: {
      etiqueta: "Comprar",
      titulo: "Ver los lotes",
      descripcion: "Del loteo provisorio del sector norte. Es una simulación.",
    },
    territorio: {
      etiqueta: "Descubrir",
      titulo: "Explorar el territorio",
      descripcion: "Los lotes, lo común y lo que se está trabajando.",
    },
    tribus: {
      etiqueta: "Lo que viene",
      titulo: "Ver las tribus",
    },
  },
  /** Descripción del camino de las tribus: con `cantidad` 0 no hay dato y no se muestra número. */
  barrios: (cantidad: number) =>
    cantidad === 1
      ? "1 barrio y las tribus que lo están formando."
      : cantidad > 0
        ? `${cantidad} barrios y las tribus que los están formando.`
        : "Los barrios y las tribus que los están formando.",
};

const en: Textos<typeof es> = {
  sobretitulo: "Lighthouse VRN · Río Negro province, Argentina",
  tituloInicio: "Regenerating from the water.",
  tituloFin: "A promise for 2030.",
  bajada:
    "By 2030, Lighthouse VRN aims to be a territory regenerating from the water, in the Alto Valle of Río Negro, near Vaca Muerta: with work in regenerative industries and a community that lives in it and cares for it. It is our goal, not a guarantee.",
  explorarTerritorio: "Explore the territory",
  sumarte: "Choose how to join",
  promesa: {
    agua: {
      titulo: "Water.",
      texto: "It all starts with water: reading it, storing it and moving it. Without it there is no soil, no trees and no home.",
    },
    trabajo: {
      titulo: "Work.",
      texto:
        "We want regenerating to be a way of making a living too: work in regenerative industries, close to where you live.",
    },
    comunidad: {
      titulo: "Community.",
      texto: "People who decide how to care for what belongs to everyone.",
    },
  },
  argentina: {
    titulo: "Argentina, a safe and open place",
    texto:
      "A country that welcomes people from abroad. If you come from another country, there are rules for buying rural land: read them here",
  },
  capitales: { titulo: "The five capitals of regeneration", fuente: "Source" },
  cifras: { titulo: "Figures from the site", fuente: "Source" },
  porDondeEmpezar: "Where to start",
  leyendaImagen: "Illustrative image",
  notaImagen: "Illustrative image of Zone A (Martín's technical report): it is neither a photograph nor a plan.",
  recomendado: "Recommended for you",
  caminos: {
    lotes: {
      etiqueta: "Buy",
      titulo: "See the lots",
      descripcion: "From the provisional layout of the north sector. It is a simulation.",
    },
    territorio: {
      etiqueta: "Discover",
      titulo: "Explore the territory",
      descripcion: "The lots, the commons and what is being worked on.",
    },
    tribus: {
      etiqueta: "Coming next",
      titulo: "See the tribes",
    },
  },
  barrios: (cantidad: number) =>
    cantidad === 1
      ? "1 neighborhood and the tribes forming it."
      : cantidad > 0
        ? `${cantidad} neighborhoods and the tribes forming them.`
        : "The neighborhoods and the tribes forming them.",
};

export const portada = conVocabulario({ es, en });
