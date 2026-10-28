// Textos del Fogón (`/fogon`): encabezado, enlaces a "Cómo decidimos" y a las consultas, filtros por ámbito, opciones de voto,
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
    decidimos: {
      titulo: "Cómo decidimos",
      texto:
        "Círculos dentro de cada tribu, las doce tribus, Lighthouse como el común y un consejo con un lugar por tribu. Mirá quién valida a quién y qué sube al consejo.",
      enlace: "Cómo decidimos",
    },
  },
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el voto no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.",
  filtrarAria: "Filtrar por ámbito",
  todas: "Todas",
  ambitos: {
    circulo: "Círculo",
    tribu: "Tribu",
    comun: "Lighthouse (el común)",
    consejo: "Consejo",
    fideicomiso: "Fideicomiso",
  },
  opciones: { favor: "A favor", contra: "En contra", abstencion: "Abstención" },
  /** Etiqueta del ámbito "Tribu" en cada decisión de una tribu. */
  chipTribu: "Tribu",
  chipCirculo: "Círculo",
  pideAlComun: "Aprobada en la tribu · pide algo al común",
  vieneDe: "Viene de",
  aprobadaEnTribu: "(aprobada en la tribu)",
  llevarAlConsejo: "Llevar al consejo",
  yaEnConsejo: "Ya está en el consejo",
  votanRepresentantes: "En la versión real votan los representantes. Acá la votación es abierta y simulada.",
  llevaste: (titulo: string) => `Llevaste «${titulo}» al consejo (simulado). La ves en el ámbito Consejo.`,
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
  pase: {
    con: "Con tu Pase Fundador (simulado) votás en las decisiones del Fideicomiso.",
    sin: "Para votar en el Fideicomiso hace falta el Pase Fundador.",
  },
  /** Parámetros opcionales de una decisión: cada fila se muestra solo si el dato existe. */
  parametros: {
    titulo: "Parámetros",
    cierra: "Cierra el:",
    acuerdo: "Se apoya en:",
    pacto: "Pacto",
    norma: "Norma",
    monto: "Monto pedido:",
    fuente: "Fuente:",
    fuentes: { "fondo-comun": "Fondo Común", tribu: "Fondo de la tribu", fideicomiso: "Fideicomiso" },
    sinDato: "sin dato",
    simulado: "(simulado)",
    aviso: "Plata simulada: nadie paga ni cobra.",
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
    decidimos: {
      titulo: "How we decide",
      texto:
        "Circles inside each tribe, the twelve tribes, Lighthouse as the commons and a council with one seat per tribe. See who validates whom and what goes up to the council.",
      enlace: "How we decide",
    },
  },
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the vote can't be saved. Check your privacy settings or try another browser.",
  filtrarAria: "Filter by scope",
  todas: "All",
  ambitos: {
    circulo: "Circle",
    tribu: "Tribe",
    comun: "Lighthouse (the commons)",
    consejo: "Council",
    fideicomiso: "Trust",
  },
  opciones: { favor: "In favor", contra: "Against", abstencion: "Abstention" },
  chipTribu: "Tribe",
  chipCirculo: "Circle",
  pideAlComun: "Approved in the tribe · asks the commons for something",
  vieneDe: "Comes from",
  aprobadaEnTribu: "(approved in the tribe)",
  llevarAlConsejo: "Take to the council",
  yaEnConsejo: "Already in the council",
  votanRepresentantes: "In the real version the representatives vote. Here the vote is open and simulated.",
  llevaste: (titulo: string) => `You took «${titulo}» to the council (simulated). You can see it under the Council scope.`,
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
  pase: {
    con: "With your Founder Pass (simulated) you vote on the Trust decisions.",
    sin: "Voting in the Trust requires the Founder Pass.",
  },
  parametros: {
    titulo: "Parameters",
    cierra: "Closes on:",
    acuerdo: "Rests on:",
    pacto: "Pact",
    norma: "Rule",
    monto: "Amount requested:",
    fuente: "Source:",
    fuentes: { "fondo-comun": "Common Fund", tribu: "Tribe fund", fideicomiso: "Trust" },
    sinDato: "no data",
    simulado: "(simulated)",
    aviso: "Simulated money: nobody pays or collects.",
  },
};

export const fogon = { es, en };
