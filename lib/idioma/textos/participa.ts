// Textos de Participa (`/participa`): los equipos del común sobre un mapa ilustrado, el detalle de cada equipo con sus
// posiciones abiertas y la pestaña Visión (spec participa-mapa-equipos). Borrador de agente, para que Gus lo ajuste.
// Las posiciones y sus textos viven en `lib/equipos/posiciones.ts`. Ninguna copia promete pago, sueldo ni prioridad.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const G = GLOSARIO;

const es = {
  titulo: G.participa.es,
  sobretitulo: "Lighthouse VRN · Río Negro, Argentina",
  bajada: "Los equipos que cuidan el territorio, dibujados donde vivirían. Pasá por una forma, abrila y mirá en qué podés ayudar.",
  pestanas: { aria: "Secciones de Participa", equipos: "Equipos", vision: "Visión" },
  mapa: {
    titulo: "Los equipos en el territorio",
    intro:
      "Cada equipo es un círculo del común, dibujado como algo que existiría en un territorio con permacultura. Tocá una forma para ver qué decide y qué posiciones tiene abiertas.",
    marca: "Ilustración · no es un plano",
    svgTitulo: "Mapa ilustrado del territorio con los nueve equipos del común",
    svgDesc:
      "De norte a sur: el río Negro con su bosque de sauces y la costanera, la planicie con chacras y cortinas de álamos, la barda, las mesetas de estepa y, cruzando de sur a norte, el cañadón, un corredor verde que desemboca en el humedal junto al río. Cada equipo es una forma sobre el mapa y se abre con un clic o con Enter.",
    controlesAria: "Acercar o alejar el mapa",
    acercar: "Acercar",
    alejar: "Alejar",
    zoom: (n: number) => `Ampliación al ${n} %`,
    regionAria: "Mapa de equipos, con desplazamiento si está ampliado",
    posiciones: (n: number) => (n === 1 ? "1 posición abierta" : `${n} posiciones abiertas`),
    globo: (nombre: string, n: number) => `${nombre} · ${n === 1 ? "1 posición abierta" : `${n} posiciones abiertas`}`,
    etiquetaForma: (nombre: string, n: number) =>
      `${nombre}, ${n === 1 ? "1 posición abierta" : `${n} posiciones abiertas`}. Abrir el detalle del equipo`,
    nombres: { rio: "Río Negro", planicie: "Planicie", barda: "Barda", meseta: "Meseta", canadon: "Cañadón", humedal: "Humedal" },
  },
  lista: {
    titulo: "Todos los equipos",
    intro: "La misma lista, para quien prefiere no usar el mapa.",
  },
  detalle: {
    cerrar: "Cerrar",
    cerrarAria: (nombre: string) => `Cerrar el detalle de ${nombre}`,
    ilustracionAria: "Ilustración del equipo",
    decide: "Decide sobre",
    frentes: "Frentes de trabajo",
    sinFrentes: "Sin frentes abiertos por ahora",
    posiciones: "Posiciones abiertas",
    posicionesIntro:
      "Lo que este equipo necesita. Son ejemplos para pensar: no son ofertas de empleo ni prometen pago, sueldo o prioridad.",
    marca: "Ejemplo · a definir",
    dedicacion: "Dedicación",
    busca: "Qué buscamos",
    modalidad: "Modalidad",
    modalidades: {
      pacto: "A acordar en un pacto",
      voluntariado: "Voluntariado",
      "a-definir": "A definir",
    },
  },
};

const en: Textos<typeof es> = {
  titulo: G.participa.en,
  sobretitulo: "Lighthouse VRN · Río Negro province, Argentina",
  bajada: "The teams that look after the territory, drawn where they would live. Pass over a shape, open it and see where you can help.",
  pestanas: { aria: "Take part sections", equipos: "Teams", vision: "Vision" },
  mapa: {
    titulo: "The teams in the territory",
    intro:
      "Each team is a circle of the commons, drawn as something that would exist in a permaculture territory. Tap a shape to see what it decides and which positions it has open.",
    marca: "Illustration · not a plan",
    svgTitulo: "Illustrated map of the territory with the nine teams of the commons",
    svgDesc:
      "From north to south: the Negro river with its willow woods and the riverside path, the floodplain with fields and poplar windbreaks, the bluff, the steppe plateaus and, running from south to north, the canyon, a green corridor that ends in the wetland by the river. Each team is a shape on the map and opens with a click or with Enter.",
    controlesAria: "Zoom the map in or out",
    acercar: "Zoom in",
    alejar: "Zoom out",
    zoom: (n: number) => `Zoom ${n}%`,
    regionAria: "Map of the teams, scrollable when zoomed in",
    posiciones: (n: number) => (n === 1 ? "1 open position" : `${n} open positions`),
    globo: (nombre: string, n: number) => `${nombre} · ${n === 1 ? "1 open position" : `${n} open positions`}`,
    etiquetaForma: (nombre: string, n: number) =>
      `${nombre}, ${n === 1 ? "1 open position" : `${n} open positions`}. Open the team details`,
    nombres: { rio: "Negro River", planicie: "Floodplain", barda: "Bluff", meseta: "Plateau", canadon: "Canyon", humedal: "Wetland" },
  },
  lista: {
    titulo: "All the teams",
    intro: "The same list, for anyone who prefers not to use the map.",
  },
  detalle: {
    cerrar: "Close",
    cerrarAria: (nombre: string) => `Close the details of ${nombre}`,
    ilustracionAria: "Illustration of the team",
    decide: "Decides on",
    frentes: "Work fronts",
    sinFrentes: "No open fronts for now",
    posiciones: "Open positions",
    posicionesIntro:
      "What this team needs. They are samples to think about: they are not job offers and they do not promise payment, salary or priority.",
    marca: "Sample · to be defined",
    dedicacion: "Time",
    busca: "What we look for",
    modalidad: "Arrangement",
    modalidades: {
      pacto: "To be agreed in a pact",
      voluntariado: "Volunteering",
      "a-definir": "To be defined",
    },
  },
};

export const participa = conVocabulario({ es, en });
