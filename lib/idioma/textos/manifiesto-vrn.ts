// Textos de pantalla del manifiesto de Lighthouse VRN (cambio `manifiesto-lighthouse-vrn`): la ficha del común en Tribus,
// la tarjeta de `/tribus`, la lectura completa, los principios propios de las tribus y el aviso de adhesión del Fogón y
// de las consultas. El TEXTO del manifiesto (propósito, principios, derechos, compromisos) vive en
// `lib/manifiestos/lighthouse-vrn.ts` con su inglés. El nombre del común sale de `nombreDelComun` (una sola constante).
import { NOMBRE_META_TRIBU } from "@/lib/manifiestos/lighthouse-vrn";
import type { Textos } from "../tipos";

const es = {
  borrador: "Borrador, a ratificar por el común",
  ejemplo: "Texto de ejemplo",
  grupos: {
    tierra: "Tierra",
    agua: "Agua",
    comunidad: "Comunidad",
    economia: "Economía",
    generaciones: "Generaciones futuras",
  },
  tarjeta: {
    sobre: "Meta-tribu",
    texto: `${NOMBRE_META_TRIBU}: el manifiesto, los principios y los equipos de la meta-tribu de la que forman parte todas las tribus.`,
  },
  ficha: {
    metaTribu: "Es la meta-tribu de la que forman parte todas las tribus.",
    proposito: "Propósito",
    principios: "Principios",
    practica: "En la práctica",
    derechos: "Derechos de la tierra",
    derechosIntro:
      "La tierra tiene derechos, y los asumimos como propios. No es un texto jurídico: es lo que nos comprometemos a respetar.",
    cuidaPrincipios: "Lo cuidan:",
    equipos: "Equipos transversales: una startup para el procomún",
    equiposIntro:
      "Son los círculos del común: no son una entidad aparte. Cada equipo cuida algo para todo el Lighthouse.",
    verGobernanza: "Ver cómo decidimos",
    adhesion: "Tu adhesión",
    sinAdhesion:
      "Todavía no adheriste al manifiesto. Sin adhesión podés mirar la gobernanza, pero no participar.",
    conAdhesion: "Adheriste al manifiesto de Lighthouse VRN. Ya podés participar en la gobernanza.",
    desactualizada:
      "El manifiesto cambió de versión desde que adheriste. Volvé a adherir para seguir participando.",
    cargando: "Revisando tu adhesión…",
    leer: "Leer el manifiesto completo",
    versionDel: (fecha: string) => `Versión del ${fecha}`,
  },
  lectura: {
    principios: "Principios",
    derechos: "Derechos de la tierra",
    compromisos: "Compromisos de quien adhiere",
    comoSeCambia: "Cómo se cambia este manifiesto",
    irAlFogon: "Ir al Fogón",
    sinBoton: "Cambiar el manifiesto no se hace desde esta pantalla: es una decisión del común en el Fogón.",
    reglaTribus: "Los principios de cada tribu",
    maquinas: "Las máquinas sugieren; las personas deciden",
    cambioVersion: "El manifiesto cambió de versión desde que adheriste: volvé a leerlo y a adherir para seguir participando.",
  },
  tribu: {
    suma: "Suma a los principios de Lighthouse VRN",
    profundiza: "Profundiza:",
    sinPropios: "Esta tribu todavía no sumó principios propios.",
    leerComun: "Leer el manifiesto de Lighthouse VRN",
    reglaCorta: "Una tribu puede sumar principios, nunca contradecir ni reemplazar los de Lighthouse VRN.",
  },
  aviso: {
    texto: "Para participar, adherí al manifiesto de Lighthouse VRN",
    enlace: "Leer y adherir",
    desactualizada: "El manifiesto cambió de versión: volvé a adherir para participar",
  },
  netx: {
    titulo: "Las decisiones, con la vida en el centro",
    intro:
      "Lo que se decide en el común pasa por un manifiesto: la regeneración y la vida van en el centro de cada decisión.",
    grupos: "Los cinco grupos de principios",
    cantidad: (n: number) => `${n} ${n === 1 ? "principio" : "principios"}`,
    total: (n: number) => `${n} principios en total`,
    ver: "Ver el manifiesto de Lighthouse VRN",
  },
};

const en: Textos<typeof es> = {
  borrador: "Draft, to be ratified by the commons",
  ejemplo: "Sample text",
  grupos: {
    tierra: "Land",
    agua: "Water",
    comunidad: "Community",
    economia: "Economy",
    generaciones: "Future generations",
  },
  tarjeta: {
    sobre: "Meta-tribe",
    texto: `${NOMBRE_META_TRIBU}: the manifesto, the principles and the teams of the meta-tribe all tribes belong to.`,
  },
  ficha: {
    metaTribu: "It is the meta-tribe all tribes belong to.",
    proposito: "Purpose",
    principios: "Principles",
    practica: "In practice",
    derechos: "Rights of the land",
    derechosIntro:
      "The land has rights, and we take them on as our own. This is not a legal text: it is what we commit to respect.",
    cuidaPrincipios: "Looked after by:",
    equipos: "Transversal teams: a startup for the commons",
    equiposIntro:
      "They are the circles of the commons: not a separate entity. Each team looks after something for the whole Lighthouse.",
    verGobernanza: "See how we decide",
    adhesion: "Your sign-on",
    sinAdhesion:
      "You have not signed on to the manifesto yet. Without signing on you can look at governance, but not take part.",
    conAdhesion: "You signed on to the Lighthouse VRN manifesto. You can now take part in governance.",
    desactualizada:
      "The manifesto changed version since you signed on. Sign on again to keep taking part.",
    cargando: "Checking your sign-on…",
    leer: "Read the full manifesto",
    versionDel: (fecha: string) => `Version dated ${fecha}`,
  },
  lectura: {
    principios: "Principles",
    derechos: "Rights of the land",
    compromisos: "Commitments of whoever signs on",
    comoSeCambia: "How this manifesto is changed",
    irAlFogon: "Go to the Fogón",
    sinBoton: "The manifesto is not changed from this screen: it is a decision of the commons in the Fogón.",
    reglaTribus: "The principles of each tribe",
    maquinas: "Machines suggest; people decide",
    cambioVersion: "The manifesto changed version since you signed on: read it again and sign on again to keep taking part.",
  },
  tribu: {
    suma: "Adds to the principles of Lighthouse VRN",
    profundiza: "Goes deeper on:",
    sinPropios: "This tribe has not added any principles of its own yet.",
    leerComun: "Read the Lighthouse VRN manifesto",
    reglaCorta: "A tribe can add principles, never contradict or replace those of Lighthouse VRN.",
  },
  aviso: {
    texto: "To take part, sign on to the Lighthouse VRN manifesto",
    enlace: "Read and sign on",
    desactualizada: "The manifesto changed version: sign on again to take part",
  },
  netx: {
    titulo: "Decisions, with life at the center",
    intro:
      "What the commons decides goes through a manifesto: regeneration and life sit at the center of every decision.",
    grupos: "The five groups of principles",
    cantidad: (n: number) => `${n} ${n === 1 ? "principle" : "principles"}`,
    total: (n: number) => `${n} principles in total`,
    ver: "See the Lighthouse VRN manifesto",
  },
};

export const manifiestoVrn = { es, en };
