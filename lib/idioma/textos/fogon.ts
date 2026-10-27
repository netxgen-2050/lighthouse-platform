// Textos del Fogón (`/fogon`): encabezado, enlaces a las consultas y al simulador, filtros por ámbito, opciones de voto,
// motivos por los que no se puede votar, conteos, acta de ejemplo, anuncios y ayudas. Las decisiones de ejemplo (título,
// dónde y regla) viven en `lib/fogon/datos.ts` con su inglés. Las páginas de consultas y del simulador siguen en español
// (con el aviso de página sin traducir) hasta su propio cambio. "Fideicomiso" es "Trust", igual que en el Pasaporte.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.fogon.es,
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: "Fogón de decisiones",
    h1: "Lo que se está decidiendo",
    intro:
      "Cada decisión muestra dónde se decide, con qué regla y en qué norma se apoya. La plataforma facilita; la validez la da el reglamento, el contrato o el estatuto. Los votos son simulados y quedan solo en este navegador.",
    consultas: {
      titulo: "Consultas de prioridades y presupuesto",
      texto: "Repartí 100 créditos de voz con voto cuadrático para priorizar y repartir presupuesto.",
      enlace: "Ver las consultas",
    },
    simulador: {
      titulo: "Simulador de la tokenomics",
      texto:
        "Mové los valores del diseño B y mirá cuánto recibe el procomún, cada clase de inversor y NetX. Los números son de ejemplo, no una oferta.",
      enlace: "Simular los parámetros de la tokenomics",
    },
  },
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el voto no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.",
  filtrarAria: "Filtrar por ámbito",
  todas: "Todas",
  ambitos: { tribu: "Tribu", asamblea: "Asamblea de residentes", fideicomiso: "Fideicomiso" },
  opciones: { favor: "A favor", contra: "En contra", abstencion: "Abstención" },
  /** Etiqueta del ámbito "Tribu" en cada decisión de una tribu. */
  chipTribu: "Tribu",
  /** Por qué una persona no puede votar en una decisión. */
  motivos: {
    pase: "Votan quienes tienen el Pase Fundador",
    residentes: "Solo residentes",
    sinDato: "Sin dato de tu residencia",
  },
  verPase: `Ver el ${G.paseFundador.es} en ${G.sumarte.es}`,
  votar: "Votar",
  cambiarVoto: "Cambiar voto",
  votoAria: (titulo: string) => `Tu voto: ${titulo}`,
  votosDeEjemplo: "Votos de ejemplo:",
  tuVoto: (opcion: string) => `Tu voto: ${opcion} (simulado)`,
  acta: (opcion: string, titulo: string) =>
    `Acta (ejemplo): votaste ${opcion} en «${titulo}». Tu voto quedó registrado en el historial del acta (simulado).`,
  anuncioVoto: (opcion: string, titulo: string) => `Tu voto quedó registrado: ${opcion} en «${titulo}» (simulado).`,
  residencia: {
    argentina: "Con tu residencia fiscal en Argentina (simulado) votás en la Asamblea de residentes.",
    exterior:
      "Con tu residencia fiscal en el exterior participás en tu tribu y ves las actas de la Asamblea; no votás en la Asamblea de residentes.",
    sinDato: "Todavía no cargaste tu residencia fiscal, así que no sabemos si podés votar en la Asamblea de residentes.",
    cargala: "Cargala en Tus datos",
  },
  pase: {
    con: "Con tu Pase Fundador (simulado) votás en las decisiones del Fideicomiso.",
    sin: "Para votar en el Fideicomiso hace falta el Pase Fundador.",
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.fogon.en,
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: "Decision Fireside",
    h1: "What is being decided",
    intro:
      "Each decision shows where it is decided, under which rule and which norm it rests on. The platform facilitates; validity comes from the regulations, the contract or the bylaws. Votes are simulated and stay only in this browser.",
    consultas: {
      titulo: "Priority and budget consultations",
      texto: "Spread 100 voice credits with quadratic voting to set priorities and split a budget.",
      enlace: "See the consultations",
    },
    simulador: {
      titulo: "Tokenomics simulator",
      texto:
        "Move the values of design B and see how much goes to the commons, to each investor class and to NetX. The numbers are samples, not an offer.",
      enlace: "Simulate the tokenomics parameters",
    },
  },
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the vote can't be saved. Check your privacy settings or try another browser.",
  filtrarAria: "Filter by scope",
  todas: "All",
  ambitos: { tribu: "Tribe", asamblea: "Residents' Assembly", fideicomiso: "Trust" },
  opciones: { favor: "In favor", contra: "Against", abstencion: "Abstention" },
  chipTribu: "Tribe",
  motivos: {
    pase: "Only Founder Pass holders vote",
    residentes: "Residents only",
    sinDato: "No data on your residency",
  },
  verPase: `See the ${G.paseFundador.en} in ${G.sumarte.en}`,
  votar: "Vote",
  cambiarVoto: "Change vote",
  votoAria: (titulo: string) => `Your vote: ${titulo}`,
  votosDeEjemplo: "Sample votes:",
  tuVoto: (opcion: string) => `Your vote: ${opcion} (simulated)`,
  acta: (opcion: string, titulo: string) =>
    `Minutes (sample): you voted ${opcion} on «${titulo}». Your vote was recorded in the minutes history (simulated).`,
  anuncioVoto: (opcion: string, titulo: string) => `Your vote was recorded: ${opcion} on «${titulo}» (simulated).`,
  residencia: {
    argentina: "With your tax residency in Argentina (simulated) you vote in the Residents' Assembly.",
    exterior:
      "With your tax residency abroad you take part in your tribe and see the Assembly minutes; you don't vote in the Residents' Assembly.",
    sinDato: "You haven't entered your tax residency yet, so we don't know whether you can vote in the Residents' Assembly.",
    cargala: "Add it in My data",
  },
  pase: {
    con: "With your Founder Pass (simulated) you vote on the Trust decisions.",
    sin: "Voting in the Trust requires the Founder Pass.",
  },
};

export const fogon = { es, en };
