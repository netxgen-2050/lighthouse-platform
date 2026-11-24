// Textos de Mi tierra (`/mi-tierra`, spec mi-tierra). Borrador de agente (rediseno-mi-tierra), para que Gus lo ajuste.
// Ningún número se escribe acá: llegan por parámetro desde los módulos con versión (`lib/lotes/modelo.ts`, `lib/bien-comun/modelo.ts`).
// Nada promete rendimiento ni le pone valor de mercado a FARO: FARO no se compra ni se vende (ADR-031).
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const es = {
  titulo: "Mi tierra",
  bajada: "Tu lote, tu plan en cuotas, tus FARO, tu voz y lo que fuiste haciendo, en un solo lugar. Todo es una simulación: no se cobró nada.",
  cargando: "Leyendo tus reservas…",
  sinSesion: {
    aviso: "Mi tierra se ve con una cuenta: acá aparecen tus reservas y pagos simulados.",
    entrar: "Sumate para ver tu tierra",
  },
  sinCompras: {
    titulo: "Todavía no reservaste un lote",
    texto: "Cuando reserves uno en la simulación, acá vas a ver tu plan en cuotas, tus FARO y tu actividad.",
    ver: "Ver los lotes",
  },
  indicadores: {
    titulo: "Un vistazo",
    lotes: "Lotes tuyos",
    fraccion: "Pagado del precio del lote",
    faro: "FARO acreditados (simulado)",
    faltaPrimerPago: "falta el primer pago",
  },
  lote: {
    titulo: "Tu lote",
    lote: (n: number) => `Lote ${n}`,
    opcion: "Opción elegida",
    precio: "Precio que viste",
    modelo: (version: string) => `Modelo ${version}`,
    ver: (n: number) => `Ver la ficha del lote ${n}`,
    opciones: {
      "solo-lote": "Solo el lote",
      modular: "Casa modular",
      familiar: "Casa familiar",
      amplia: "Casa amplia",
    },
  },
  plan: {
    titulo: "Plan en cuotas · Token Tierra (simulado)",
    noEntra: "Este lote no entra al plan en cuotas.",
    sinDato: "No quedó guardado qué plan viste al reservar: sin dato.",
    contado: "Contado",
    pagoUnico: "Pago único",
    anticipo: "Anticipo",
    cuota: "Cada cuota",
    cuotasPagadas: "Cuotas pagadas",
    cuotasDe: (pagadas: string, total: string) => `${pagadas} de ${total} cuotas`,
    avance: "Avance del plan",
    faltaPrimerPago: "Falta el primer pago.",
    soloPrimerPago: "En el prototipo solo se simula el primer pago: las cuotas siguientes todavía no se simulan.",
  },
  faro: {
    titulo: "FARO (simulado)",
    acreditados: "Acreditados con lo pagado",
    delPlan: "Los que se acreditarían si se completa el plan",
    sinPago: "Todavía no se acreditó FARO: falta el primer pago",
    aMedida: (total: string) => `${total} se acreditan a medida que se paga.`,
    noAplica: "Este lote no trae FARO.",
    regla: "Quien paga la mitad tiene la mitad: el FARO se acredita según lo que se paga.",
    nota: "FARO no se compra ni se vende, y no da voto en la plataforma.",
  },
  voz: {
    titulo: "Tu voz",
    conAdhesion: "Adheriste al manifiesto de Lighthouse VRN: por esa adhesión sos parte del común.",
    sinAdhesion: "Todavía no sos parte del común: hoy se entra adhiriendo al manifiesto de Lighthouse VRN.",
    desactualizada: "Adheriste a una versión anterior del manifiesto: volvé a adherir para seguir siendo parte del común.",
    adherir: "Leer y adherir al manifiesto",
    ver: "Ver el manifiesto",
    enDiscusion: "en discusión",
    propuesta:
      "Propuesta del documento 34 (decisión 5, todavía abierta): una persona, un voto en los asuntos de residentes. Para el tesoro y los recursos del común, FARO con tope por persona.",
    faroNoVota: "Hoy FARO no da voto en la plataforma.",
  },
  actividad: {
    titulo: "Actividad",
    reserva: (n: number) => `Reserva del lote ${n}`,
    primerPago: (n: number) => `Primer pago (anticipo) del lote ${n}`,
    pago: (n: number) => `Pago del lote ${n}`,
    nota: "El monto es el que viste al reservar. No se cobró nada.",
  },
};

const en: Textos<typeof es> = {
  titulo: "My land",
  bajada: "Your lot, your instalment plan, your FARO, your voice and what you have done, in one place. It is all a simulation: nothing was charged.",
  cargando: "Reading your reservations…",
  sinSesion: {
    aviso: "My land is visible with an account: your simulated reservations and payments show up here.",
    entrar: "Join to see your land",
  },
  sinCompras: {
    titulo: "You have not reserved a lot yet",
    texto: "When you reserve one in the simulation, you will see your instalment plan, your FARO and your activity here.",
    ver: "See the lots",
  },
  indicadores: {
    titulo: "At a glance",
    lotes: "Your lots",
    fraccion: "Paid of the lot price",
    faro: "FARO credited (simulated)",
    faltaPrimerPago: "the first payment is missing",
  },
  lote: {
    titulo: "Your lot",
    lote: (n: number) => `Lot ${n}`,
    opcion: "Option chosen",
    precio: "Price you saw",
    modelo: (version: string) => `Model ${version}`,
    ver: (n: number) => `See the page of lot ${n}`,
    opciones: {
      "solo-lote": "Lot only",
      modular: "Modular house",
      familiar: "Family house",
      amplia: "Large house",
    },
  },
  plan: {
    titulo: "Instalment plan · Token Tierra (simulated)",
    noEntra: "This lot is not part of the instalment plan.",
    sinDato: "We did not save which plan you saw when you reserved: no data.",
    contado: "Cash",
    pagoUnico: "Single payment",
    anticipo: "Down payment",
    cuota: "Each instalment",
    cuotasPagadas: "Instalments paid",
    cuotasDe: (pagadas: string, total: string) => `${pagadas} of ${total} instalments`,
    avance: "Plan progress",
    faltaPrimerPago: "The first payment is missing.",
    soloPrimerPago: "In the prototype only the first payment is simulated: the following instalments are not simulated yet.",
  },
  faro: {
    titulo: "FARO (simulated)",
    acreditados: "Credited with what was paid",
    delPlan: "What would be credited if the plan is completed",
    sinPago: "No FARO has been credited yet: the first payment is missing",
    aMedida: (total: string) => `${total} are credited as it is paid.`,
    noAplica: "This lot does not come with FARO.",
    regla: "Whoever pays half gets half: FARO is credited according to what is paid.",
    nota: "FARO is not bought or sold, and it gives no vote on the platform.",
  },
  voz: {
    titulo: "Your voice",
    conAdhesion: "You signed on to the Lighthouse VRN manifesto: through that you are part of the commons.",
    sinAdhesion: "You are not part of the commons yet: today you join by signing on to the Lighthouse VRN manifesto.",
    desactualizada: "You signed on to an earlier version of the manifesto: sign on again to stay part of the commons.",
    adherir: "Read and sign on to the manifesto",
    ver: "See the manifesto",
    enDiscusion: "under discussion",
    propuesta:
      "Proposal from document 34 (decision 5, still open): one person, one vote on residents' matters. For the treasury and the commons resources, FARO with a cap per person.",
    faroNoVota: "Today FARO gives no vote on the platform.",
  },
  actividad: {
    titulo: "Activity",
    reserva: (n: number) => `Reservation of lot ${n}`,
    primerPago: (n: number) => `First payment (down payment) of lot ${n}`,
    pago: (n: number) => `Payment of lot ${n}`,
    nota: "The amount is the one you saw when you reserved. Nothing was charged.",
  },
};

export const miTierra = conVocabulario({ es, en });
