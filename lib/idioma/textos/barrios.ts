// Textos de Barrio Norte (`/barrios/norte`). Borrador de agente (rediseno-explorar-valle), para que Gus lo ajuste.
// Ningún número se escribe acá: llegan por parámetro desde `lib/lotes/modelo.ts` y `lib/bien-comun/barrio.ts`.
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const es = {
  titulo: "Barrio Norte",
  sobretitulo: "Lighthouse VRN · Explorar",
  bajada: "Dónde vivirías, con quién y cuánto cuesta: primero el territorio, después los números.",
  lotes: {
    titulo: "Los lotes del barrio",
    intro: "Cuántos lotes hay en cada estado, según el plano. Las compras simuladas que hacés en tu navegador no cambian estos totales.",
    etiqueta: "Lotes",
    ver: "Ver los lotes",
    enCuotasNota: "Todavía no se cuenta cuántos lotes van en cuotas.",
  },
  comun: {
    titulo: "Lo que va al bien común",
    intro: "Una parte de cada pago de un lote va al común, y cada lote paga una expensa para cuidar lo que es de todos.",
    parte: "De cada pago va al común",
    expensa: "Expensa por lote, por año",
    version: (version: string) => `Valores de ejemplo del modelo de lotes ${version}.`,
    ver: "Ver el bien común",
  },
  obra: {
    titulo: "La obra del barrio",
    intro:
      "La infraestructura del barrio la financiaría el Token Inversor, y se devolvería a medida que entran las cuotas de los lotes. Es una simulación: nadie puso plata real.",
    infraestructura: "Infraestructura a financiar",
    juntado: "Lo juntado",
    devolucion: "Cómo se devuelve",
    devolucionTexto: "A medida que entran las cuotas de los lotes vendidos.",
    mes: (mes: string) => `Se terminaría de devolver en el mes ${mes}.`,
    noEnAnios: (anios: string) => `No se termina de devolver en ${anios} años.`,
    comunTitulo: "Lo que le llega al común por año",
    caption: "Lo que le llega al común en cada año: parte de los pagos más expensas",
    anio: "Año",
    total: "Total para el común",
    lotesModelo: (delModelo: string, delPlano: string) =>
      `El cálculo usa ${delModelo} lotes del modelo; el plano tiene ${delPlano}.`,
  },
  sinSesion: {
    titulo: "La obra del barrio",
    aviso: "Los números de la obra se ven con una cuenta.",
    entrar: "Sumate para ver la obra",
  },
};

const en: Textos<typeof es> = {
  titulo: "Barrio Norte",
  sobretitulo: "Lighthouse VRN · Explore",
  bajada: "Where you would live, with whom and how much it costs: the territory first, then the numbers.",
  lotes: {
    titulo: "The lots of the neighborhood",
    intro: "How many lots are in each state, according to the plan. Simulated purchases you make in your browser do not change these totals.",
    etiqueta: "Lots",
    ver: "See the lots",
    enCuotasNota: "We do not count yet how many lots are on installments.",
  },
  comun: {
    titulo: "What goes to the commons",
    intro: "A part of every lot payment goes to the commons, and each lot pays a fee to care for what belongs to everyone.",
    parte: "Of each payment goes to the commons",
    expensa: "Fee per lot, per year",
    version: (version: string) => `Sample values from the lots model ${version}.`,
    ver: "See the commons",
  },
  obra: {
    titulo: "The neighborhood works",
    intro:
      "The neighborhood infrastructure would be financed by the Investor Token and paid back as the lot installments come in. It is a simulation: nobody put in real money.",
    infraestructura: "Infrastructure to finance",
    juntado: "Raised so far",
    devolucion: "How it is paid back",
    devolucionTexto: "As the installments of the lots sold come in.",
    mes: (mes: string) => `It would be fully paid back in month ${mes}.`,
    noEnAnios: (anios: string) => `It is not fully paid back within ${anios} years.`,
    comunTitulo: "What reaches the commons each year",
    caption: "What reaches the commons each year: a part of the payments plus fees",
    anio: "Year",
    total: "Total for the commons",
    lotesModelo: (delModelo: string, delPlano: string) =>
      `The calculation uses ${delModelo} lots from the model; the plan has ${delPlano}.`,
  },
  sinSesion: {
    titulo: "The neighborhood works",
    aviso: "The numbers of the works are visible with an account.",
    entrar: "Join to see the works",
  },
};

export const barrios = conVocabulario({ es, en });
