// Textos del Fogón (`/fogon`): la portada "Cómo decidimos" (la holarquía) con las propuestas del holón al lado, opciones de
// voto, motivos por los que no se puede votar, conteos, acta de ejemplo, anuncios y ayudas. Las decisiones de ejemplo
// (título, dónde y regla) viven en `lib/fogon/datos.ts` con su inglés. Las páginas de consultas y del simulador siguen en
// español (con el aviso de página sin traducir) hasta su propio cambio.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: "Cómo decidimos · Fogón",
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: "Fogón",
    h1: "Cómo decidimos",
    intro:
      "Navegá la holarquía y mirá, al lado, lo que se decide en cada lugar. El Fogón es el espacio consultivo del común; los votos son simulados y quedan solo en este navegador.",
    herramientas: {
      titulo: "Otras herramientas",
      consultas: {
        enlace: "Ver las consultas",
        texto: "Repartí 100 créditos de voz con voto cuadrático para priorizar y repartir presupuesto.",
      },
      simulador: {
        enlace: "Abrir el simulador de parámetros",
        texto: "Probá cómo cambian los números del modelo de financiamiento en la Vista NetX.",
      },
    },
  },
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el voto no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.",
  /** La sección adyacente a la holarquía. */
  propuestasEn: (nombre: string) => `Propuestas en ${nombre}`,
  grupos: {
    aca: "Se decide acá",
    pasa: "Nace o pasa por acá",
    adentro: "En los círculos de adentro",
  },
  sinDecisiones: (nombre: string) => `No hay decisiones de ejemplo en ${nombre}`,
  sinEnGrupo: "No hay decisiones de ejemplo en este grupo.",
  soloLasDe: (nombre: string) => `Solo las de ${nombre}`,
  seDecideEn: (nombre: string) => `Se decide en ${nombre}`,
  enCirculo: (circulo: string, tribu: string | null) => (tribu ? `en ${circulo} · ${tribu}` : `en ${circulo}`),
  /** El ámbito de una decisión (se nombra en la página de la propuesta; ya no es un filtro). */
  ambitos: { circulo: "Círculo", tribu: "Tribu", comun: "Lighthouse (el común)", consejo: "Consejo" },
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
  llevaste: (titulo: string) => `Llevaste «${titulo}» al consejo (simulado). La ves en el Consejo de tribus.`,
  /** Lo que decide un órgano legal: el Fogón le lleva la recomendación. */
  destino: {
    "consejo-fundacion": "Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación",
  },
  /** Por qué una persona no puede votar en una decisión. */
  motivos: {
    manifiesto: "Para participar, adherí al manifiesto de Lighthouse VRN",
    residentes: "Solo residentes",
    sinDato: "Sin dato de tu residencia",
  },
  votar: "Votar",
  cambiarVoto: "Cambiar voto",
  recomendar: "Recomendar",
  cambiarRecomendacion: "Cambiar recomendación",
  votoAria: (titulo: string) => `Tu voto: ${titulo}`,
  recomendacionAria: (titulo: string) => `Tu recomendación: ${titulo}`,
  votosDeEjemplo: "Votos de ejemplo:",
  recomendacionesDeEjemplo: "Recomendaciones de ejemplo:",
  tuVoto: (opcion: string) => `Tu voto: ${opcion} (simulado)`,
  tuRecomendacion: (opcion: string) => `Tu recomendación: ${opcion} (simulada)`,
  acta: (opcion: string, titulo: string) =>
    `Acta (ejemplo): votaste ${opcion} en «${titulo}». Tu voto quedó registrado en el historial del acta (simulado).`,
  anuncioVoto: (opcion: string, titulo: string) => `Tu voto quedó registrado: ${opcion} en «${titulo}» (simulado).`,
  anuncioRecomendacion: (opcion: string, titulo: string) =>
    `Tu recomendación quedó registrada: ${opcion} en «${titulo}» (simulada).`,
  /** Parámetros opcionales de una decisión: cada fila se muestra solo si el dato existe. */
  parametros: {
    titulo: "Parámetros",
    cierra: "Cierra el:",
    acuerdo: "Se apoya en:",
    pacto: "Pacto",
    norma: "Norma",
    monto: "Monto pedido:",
    fuente: "Fuente:",
    fuentes: { "fondo-comun": "Fondo Común", tribu: "Fondo de la tribu" },
    sinDato: "sin dato",
    simulado: "(simulado)",
    aviso: "Plata simulada: nadie paga ni cobra.",
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: "How we decide · Fireside",
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: "Fireside",
    h1: "How we decide",
    intro:
      "Browse the holarchy and see, next to it, what is decided in each place. The Fireside is the commons' consultative space; votes are simulated and stay only in this browser.",
    herramientas: {
      titulo: "Other tools",
      consultas: {
        enlace: "See the consultations",
        texto: "Spread 100 voice credits with quadratic voting to set priorities and split a budget.",
      },
      simulador: {
        enlace: "Open the parameter simulator",
        texto: "Try how the numbers of the financing model change in the NetX view.",
      },
    },
  },
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the vote can't be saved. Check your privacy settings or try another browser.",
  propuestasEn: (nombre: string) => `Proposals in ${nombre}`,
  grupos: {
    aca: "Decided here",
    pasa: "Starts or passes through here",
    adentro: "In the circles inside",
  },
  sinDecisiones: (nombre: string) => `There are no sample decisions in ${nombre}`,
  sinEnGrupo: "There are no sample decisions in this group.",
  soloLasDe: (nombre: string) => `Only those of ${nombre}`,
  seDecideEn: (nombre: string) => `Decided in ${nombre}`,
  enCirculo: (circulo: string, tribu: string | null) => (tribu ? `in ${circulo} · ${tribu}` : `in ${circulo}`),
  ambitos: { circulo: "Circle", tribu: "Tribe", comun: "Lighthouse (the commons)", consejo: "Council" },
  opciones: { favor: "In favor", contra: "Against", abstencion: "Abstention" },
  chipTribu: "Tribe",
  chipCirculo: "Circle",
  pideAlComun: "Approved in the tribe · asks the commons for something",
  vieneDe: "Comes from",
  aprobadaEnTribu: "(approved in the tribe)",
  llevarAlConsejo: "Take to the council",
  yaEnConsejo: "Already in the council",
  votanRepresentantes: "In the real version the representatives vote. Here the vote is open and simulated.",
  llevaste: (titulo: string) => `You took «${titulo}» to the council (simulated). You can see it in the Council of tribes.`,
  destino: {
    "consejo-fundacion": "Decided by the Foundation Council; the Fireside brings it the recommendation",
  },
  motivos: {
    manifiesto: "To take part, sign on to the Lighthouse VRN manifesto",
    residentes: "Residents only",
    sinDato: "No data on your residency",
  },
  votar: "Vote",
  cambiarVoto: "Change vote",
  recomendar: "Recommend",
  cambiarRecomendacion: "Change recommendation",
  votoAria: (titulo: string) => `Your vote: ${titulo}`,
  recomendacionAria: (titulo: string) => `Your recommendation: ${titulo}`,
  votosDeEjemplo: "Sample votes:",
  recomendacionesDeEjemplo: "Sample recommendations:",
  tuVoto: (opcion: string) => `Your vote: ${opcion} (simulated)`,
  tuRecomendacion: (opcion: string) => `Your recommendation: ${opcion} (simulated)`,
  acta: (opcion: string, titulo: string) =>
    `Minutes (sample): you voted ${opcion} on «${titulo}». Your vote was recorded in the minutes history (simulated).`,
  anuncioVoto: (opcion: string, titulo: string) => `Your vote was recorded: ${opcion} on «${titulo}» (simulated).`,
  anuncioRecomendacion: (opcion: string, titulo: string) =>
    `Your recommendation was recorded: ${opcion} on «${titulo}» (simulated).`,
  parametros: {
    titulo: "Parameters",
    cierra: "Closes on:",
    acuerdo: "Rests on:",
    pacto: "Pact",
    norma: "Rule",
    monto: "Amount requested:",
    fuente: "Source:",
    fuentes: { "fondo-comun": "Common Fund", tribu: "Tribe fund" },
    sinDato: "no data",
    simulado: "(simulated)",
    aviso: "Simulated money: nobody pays or collects.",
  },
};

export const fogon = { es, en };
