// Textos de Invertir (`/invertir`, spec invertir). Borrador de agente (rediseno-invertir), para que Gus lo ajuste.
// Ningún número se escribe acá: llegan por parámetro desde `lib/bien-comun/` y `lib/lotes/modelo.ts`.
// Aquí se habla de plazo y forma de devolución, y de nada más (lo vigila un test de la carpeta `lib/invertir`).
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const es = {
  titulo: "Invertir",
  bajada: "Qué barrio se financia, cómo se devuelve la plata y qué parte va al común.",
  sinSesion: {
    titulo: "Invertir se ve con una cuenta",
    aviso: "Acá aparecen los números del barrio en financiamiento.",
    entrar: "Sumate para ver el barrio",
  },
  aviso: {
    etiqueta: "Estado de esta página",
    texto: (version: string) => `Propuesta ${version} en discusión · no es una oferta`,
  },
  pestanas: {
    etiqueta: "Detalle del barrio",
    como: "Cómo funciona",
    curva: "Curva",
    libro: "Libro",
  },
  barrio: {
    titulo: "Barrio Norte",
    indicadores: "Indicadores del barrio",
    meta: "Meta de la obra (infraestructura)",
    juntado: "Lo juntado",
    mesDevolucion: "Mes en que se terminaría de devolver",
    mes: (mes: string) => `mes ${mes}`,
    noEnAnios: (anios: string) => `no en ${anios} años`,
    parteComun: "De cada pago va al común",
    version: (version: string) => `Cálculo de ejemplo: ${version}.`,
  },
  prima: {
    etiqueta: "Prima objetivo del Token Inversor",
    nota: "objetivo · ejemplo · en discusión, no es una promesa",
  },
  comoFunciona: {
    titulo: "Cómo funciona",
    financia: "Qué financia: la infraestructura del barrio, con el Token Inversor.",
    cobra: "Cómo se devuelve: a medida que entran las cuotas de los lotes vendidos al fideicomiso del barrio.",
    sinFecha: "Por qué no hay fecha fija: depende de cuántos lotes se vendan y de cuándo se paguen las cuotas.",
    masBienComun: "Leer la propuesta del bien común",
    masFinanciamiento: "Ver el financiamiento completo",
  },
  curva: {
    titulo: "Curva de devolución · caso de ejemplo",
    descripcion:
      "Dos líneas mes a mes hasta el final del horizonte del modelo: lo que se le devolvió al inversor, acumulado (línea llena), y lo que trajo (línea de rayas).",
    devuelto: "Devuelto al inversor (acumulado)",
    aportado: "Lo que trajo el inversor",
    ejeMes: "Mes",
    ejeMonto: "USD",
    tabla: "Ver la tabla de la curva por trimestre",
    caption: "Lo devuelto y lo que trajo el inversor, por trimestre (caso de ejemplo)",
    colMes: "Momento",
    colDevuelto: "Devuelto",
    colAportado: "Trajo",
    mes: (mes: string) => `mes ${mes}`,
  },
  libro: {
    titulo: "Libro del barrio · caso de ejemplo",
    nota: "Movimientos por trimestre. La parte del común no pasa por el fideicomiso: sale directo de cada pago. El “mes N” cuenta desde la primera venta; no hay fechas de calendario.",
    mes: (mes: string) => `mes ${mes}`,
    motivos: {
      cuotas: "Entra al fideicomiso (su parte de las cuotas)",
      devolucion: "Se devuelve al inversor",
      comun: "Va al común",
    },
    filtro: "Filtrar el libro por tipo",
    todo: "Todo",
    filtros: {
      cuotas: "Entra al fideicomiso",
      devolucion: "Se devuelve al inversor",
      comun: "Va al común",
    },
    verTodo: (n: string) => `Ver todo el libro (${n} movimientos)`,
    vacio: "No hay movimientos de este tipo.",
  },
};

const en: Textos<typeof es> = {
  titulo: "Invest",
  bajada: "Which neighborhood is being financed, how the money is paid back and what share goes to the commons.",
  sinSesion: {
    titulo: "Invest is seen with an account",
    aviso: "The numbers of the neighborhood being financed appear here.",
    entrar: "Join to see the neighborhood",
  },
  aviso: {
    etiqueta: "Status of this page",
    texto: (version: string) => `Proposal ${version} under discussion · not an offer`,
  },
  pestanas: {
    etiqueta: "Neighborhood details",
    como: "How it works",
    curva: "Curve",
    libro: "Ledger",
  },
  barrio: {
    titulo: "Barrio Norte",
    indicadores: "Neighborhood indicators",
    meta: "Works goal (infrastructure)",
    juntado: "Raised so far",
    mesDevolucion: "Month it would be fully paid back",
    mes: (mes: string) => `month ${mes}`,
    noEnAnios: (anios: string) => `not within ${anios} years`,
    parteComun: "Of each payment goes to the commons",
    version: (version: string) => `Sample calculation: ${version}.`,
  },
  prima: {
    etiqueta: "Investor Token target premium",
    nota: "target · sample · under discussion, not a promise",
  },
  comoFunciona: {
    titulo: "How it works",
    financia: "What it finances: the neighborhood infrastructure, through the Investor Token.",
    cobra: "How it is paid back: as the installments of the lots sold come into the neighborhood trust.",
    sinFecha: "Why there is no fixed date: it depends on how many lots are sold and when the installments are paid.",
    masBienComun: "Read the commons proposal",
    masFinanciamiento: "See the full financing page",
  },
  curva: {
    titulo: "Repayment curve · sample case",
    descripcion:
      "Two lines month by month up to the end of the model horizon: what was paid back to the investor, accumulated (solid line), and what the investor brought in (dashed line).",
    devuelto: "Paid back to the investor (accumulated)",
    aportado: "What the investor brought in",
    ejeMes: "Month",
    ejeMonto: "USD",
    tabla: "See the curve table by quarter",
    caption: "Paid back and what the investor brought in, by quarter (sample case)",
    colMes: "Moment",
    colDevuelto: "Paid back",
    colAportado: "Brought in",
    mes: (mes: string) => `month ${mes}`,
  },
  libro: {
    titulo: "Neighborhood ledger · sample case",
    nota: "Movements by quarter. The commons share does not go through the trust: it comes straight out of each payment. “Month N” counts from the first sale; there are no calendar dates.",
    mes: (mes: string) => `month ${mes}`,
    motivos: {
      cuotas: "Enters the trust (its share of the installments)",
      devolucion: "Paid back to the investor",
      comun: "Goes to the commons",
    },
    filtro: "Filter the ledger by type",
    todo: "All",
    filtros: {
      cuotas: "Enters the trust",
      devolucion: "Paid back to the investor",
      comun: "Goes to the commons",
    },
    verTodo: (n: string) => `See the whole ledger (${n} movements)`,
    vacio: "There are no movements of this type.",
  },
};

export const invertir = conVocabulario({ es, en });
