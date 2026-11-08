// Textos de /lotes/hibrido, "Qué es tuyo y qué es de todos" (modelo-hibrido-procomun). Ningún número se escribe acá: los valores
// llegan por parámetro desde `lib/lotes/modelo.ts` y `lib/lotes/escenarios.ts` (lo vigila `lib/lotes/sin-numeros-escritos.test.ts`).
// En español se dice "bien común"; en inglés, "commons". Los tres escenarios son de ejemplo y ninguno es un presupuesto.
import type { Textos } from "../tipos";

const es = {
  titulo: "Qué es tuyo y qué es de todos",
  bajada:
    "Qué sería privado, qué sería del bien común, quién lo paga y qué falta resolver. Todos los valores son de ejemplo y nada se cobra de verdad.",
  volverALista: "Volver a la lista de lotes",
  tabla: {
    titulo: "Qué es privado y qué es común",
    propuesta:
      "Proponemos repartir lo común en dos: lo que los vecinos usan todos los días lo cuida un consorcio de propietarios; lo que cuida el territorio queda en una Fundación al servicio de la comunidad que adhiere al manifiesto. Es una propuesta para el equipo, a verificar con abogado.",
    fundacion: "La Fundación todavía no existe, y los lotes privados no quedarían en ella.",
    caption: "Qué es privado y qué es común, quién lo paga, cuánto cuesta y quién lo cuidaría",
    rubro: "Rubro",
    tipo: "Privado o común",
    quienPaga: "Quién lo paga",
    costo: "Cuánto cuesta",
    cuida: "Quién lo cuidaría",
    nota: "El costo de cada rubro común todavía no está calculado: sin dato. «Quién lo paga» es un supuesto del modelo, no un acuerdo. Los precios del lote y de la casa son de ejemplo.",
  },
  aporte: {
    titulo: "Cuánto aporta cada lote",
    unico: (pct: string, promedio: string, aporte: string) =>
      `Aporte único: el ${pct} de lo que se paga. Con el paquete promedio (${promedio}) son ${aporte}.`,
    expensas: (monto: string) => `Expensas: ${monto} por lote por año.`,
    incluido: "Si el aporte se suma al precio o va incluido: sin dato.",
    primeros: "Los primeros 4 lotes no se suman: si aportan al bien común de Lighthouse, sin dato.",
  },
  alcanza: {
    titulo: "Por qué la venta sola no alcanza",
    intro:
      "El costo real del bien común todavía no está calculado: falta el dato de Vagner. Lo que sigue son tres escenarios de ejemplo, cada uno con su fuente. Ninguno es un presupuesto.",
    paraQueTitulo: "Para qué es la plata",
    paraQue: (pct: string, lotes: string) =>
      `El bien común es el 100 % de la tierra, no solo el sector de lotes. Los ${lotes} lotes privados son el ${pct} del 7A (superficie de los lotes sobre la del 7A, calculada del loteo y del polígono). Todo lo demás hay que diseñarlo, restaurarlo y mantenerlo.`,
    paraQueSinDato: "No se puede calcular qué parte del 7A son los lotes privados: sin dato.",
    queCuestaTitulo: "Qué cuesta, con fuente",
    masterplan: (monto: string) => `Masterplan de permacultura: más de ${monto} el primer año (Gus, 8-nov, estimación)`,
    rubros: [
      "Mantenimiento del corredor y de las reservas",
      "Agua",
      "Energía",
      "Caminos",
      "Personal",
      "Seguros y tasas",
    ],
    rubroSinDato: (rubro: string) => `${rubro}: sin dato · a confirmar con Vagner`,
    escenariosTitulo: "Tres escenarios de costo anual del bien común",
    marca: "de ejemplo, no es un presupuesto",
    costoAnual: (monto: string) => `${monto} por año`,
    fuente: "Fuente:",
    cubreVenta: (anios: string, lotes: string, monto: string, pct: string) =>
      `Durante los ${anios} años de venta, el aporte único repartido y las expensas de los ${lotes} lotes suman ${monto} por año: cubren el ${pct} de este costo.`,
    cubreDespues: (monto: string, pct: string) =>
      `Después de la venta quedan solo las expensas, porque el aporte no se repite: ${monto} por año, el ${pct} de este costo.`,
    cubreTodo: "Con estos valores la venta cubre todo el costo de este escenario.",
    resto:
      "El resto saldría de: token del bien común, ingresos del bien común (huerta, cocina, alojamiento) u otros aportes: sin dato.",
    sinDato: "Con estos valores no hay dato: ingresá números mayores que cero.",
    lotesNota: "Solo se cuentan los lotes del sector norte: los primeros 4 no se suman.",
  },
  calculadora: {
    titulo: "Calculadora",
    intro:
      "Cambiá el costo anual del bien común, la expensa o la cantidad de lotes. Parte de los valores del escenario que elijas. No guarda nada: al recargar vuelven los de partida.",
    escenario: "Punto de partida",
    costo: "Costo anual del bien común (USD por año)",
    expensa: "Expensa por lote (USD por año)",
    lotes: "Cantidad de lotes",
    resultado: "Resultado",
    cubreVenta: (monto: string, pct: string) => `Durante la venta entran ${monto} por año: el ${pct} del costo.`,
    cubreDespues: (monto: string, pct: string) => `Después de la venta entran ${monto} por año: el ${pct} del costo.`,
  },
  vagner: {
    titulo: "Lo que hay que preguntarle a Vagner",
    items: [
      "Cuánto cuesta cada rubro del bien común, para el 100 % de la tierra.",
      "Cuánto del costo es inversión inicial (CAPEX) y cuánto es mantenimiento (OPEX).",
      "Desde qué año.",
    ],
  },
  resguardos: {
    titulo: "Resguardos que pide el modelo",
    intro: "Son condiciones que el modelo híbrido pide. Esta página las cuenta, no las cumple: ninguna está hecha todavía.",
    estado: "Estado:",
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Fuente de los valores de lotes: ${fuente} · versión ${version} · ${fecha}. Todos son de ejemplo.`,
} as const;

const en: Textos<typeof es> = {
  titulo: "What is yours and what belongs to everyone",
  bajada:
    "What would be private, what would belong to the commons, who pays for it and what is still open. All values are samples and nothing is really charged.",
  volverALista: "Back to the lot list",
  tabla: {
    titulo: "What is private and what is common",
    propuesta:
      "We propose splitting what is common in two: what neighbors use every day is looked after by an owners' association; what looks after the land stays in a Foundation serving the community that adheres to the manifesto. This is a proposal for the team, to be verified with a lawyer.",
    fundacion: "The Foundation does not exist yet, and private lots would not stay in it.",
    caption: "What is private and what is common, who pays, how much it costs and who would look after it",
    rubro: "Item",
    tipo: "Private or common",
    quienPaga: "Who pays",
    costo: "Cost",
    cuida: "Who would look after it",
    nota: "The cost of each common item is not calculated yet: no data. \"Who pays\" is an assumption of the model, not an agreement. Lot and house prices are samples.",
  },
  aporte: {
    titulo: "What each lot contributes",
    unico: (pct: string, promedio: string, aporte: string) =>
      `One-off contribution: ${pct} of what is paid. On the average package (${promedio}) it is ${aporte}.`,
    expensas: (monto: string) => `Common charges: ${monto} per lot per year.`,
    incluido: "Whether the contribution is added to the price or included: no data.",
    primeros: "The first 4 lots are not added: whether they contribute to the Lighthouse commons is no data.",
  },
  alcanza: {
    titulo: "Why selling alone is not enough",
    intro:
      "The real cost of the commons is not calculated yet: Vagner's figure is missing. What follows are three sample scenarios, each with its source. None of them is a budget.",
    paraQueTitulo: "What the money is for",
    paraQue: (pct: string, lotes: string) =>
      `The commons is 100% of the land, not only the lot sector. The ${lotes} private lots are ${pct} of the 7A (lot area over 7A area, calculated from the subdivision and the polygon). Everything else has to be designed, restored and maintained.`,
    paraQueSinDato: "It is not possible to calculate what share of the 7A is private lots: no data.",
    queCuestaTitulo: "What it costs, with sources",
    masterplan: (monto: string) => `Permaculture masterplan: more than ${monto} in the first year (Gus, 8 Nov, estimate)`,
    rubros: [
      "Upkeep of the corridor and the reserves",
      "Water",
      "Energy",
      "Roads",
      "Staff",
      "Insurance and fees",
    ],
    rubroSinDato: (rubro: string) => `${rubro}: no data · to be confirmed with Vagner`,
    escenariosTitulo: "Three scenarios of yearly cost of the commons",
    marca: "sample, not a budget",
    costoAnual: (monto: string) => `${monto} per year`,
    fuente: "Source:",
    cubreVenta: (anios: string, lotes: string, monto: string, pct: string) =>
      `During the ${anios} years of sales, the one-off contribution spread out and the common charges of the ${lotes} lots add up to ${monto} per year: ${pct} of this cost.`,
    cubreDespues: (monto: string, pct: string) =>
      `After the sales only the common charges remain, because the contribution is not repeated: ${monto} per year, ${pct} of this cost.`,
    cubreTodo: "With these values the sales cover the whole cost of this scenario.",
    resto:
      "The rest would come from: commons token, commons income (garden, kitchen, lodging) or other contributions: no data.",
    sinDato: "With these values there is no data: enter numbers greater than zero.",
    lotesNota: "Only the north sector lots are counted: the first 4 are not added.",
  },
  calculadora: {
    titulo: "Calculator",
    intro:
      "Change the yearly cost of the commons, the common charge or the number of lots. It starts from the values of the scenario you pick. Nothing is saved: on reload the starting values come back.",
    escenario: "Starting point",
    costo: "Yearly cost of the commons (USD per year)",
    expensa: "Common charge per lot (USD per year)",
    lotes: "Number of lots",
    resultado: "Result",
    cubreVenta: (monto: string, pct: string) => `During the sales ${monto} per year comes in: ${pct} of the cost.`,
    cubreDespues: (monto: string, pct: string) => `After the sales ${monto} per year comes in: ${pct} of the cost.`,
  },
  vagner: {
    titulo: "What to ask Vagner",
    items: [
      "What each item of the commons costs, for 100% of the land.",
      "How much of the cost is initial investment (CAPEX) and how much is upkeep (OPEX).",
      "From which year.",
    ],
  },
  resguardos: {
    titulo: "Safeguards the model asks for",
    intro: "These are conditions the hybrid model asks for. This page describes them, it does not fulfil them: none is done yet.",
    estado: "Status:",
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Source of the lot values: ${fuente} · version ${version} · ${fecha}. All of them are samples.`,
};

export const hibrido = { es, en };
