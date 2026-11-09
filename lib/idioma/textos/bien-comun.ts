// Textos de /bien-comun, "El bien común de Lighthouse VRN" (bien-comun-tokens). Ningún número se escribe acá: los valores llegan
// por parámetro desde `lib/bien-comun/modelo.ts` (lo vigila `lib/lotes/sin-numeros-escritos.test.ts`).
// Todo es una simulación para conversar en el equipo: no se emite, no se cobra y no está decidido. En español se dice
// "bien común"; en inglés, "commons". Ningún texto promete rendimientos de ningún tipo (lo vigila `lib/lotes/sin-numeros-escritos.test.ts`).
import type { Textos } from "../tipos";

const es = {
  titulo: "El bien común de Lighthouse VRN",
  bajada: (parte: string) =>
    `Lo privado es poco y lo común es casi todo: los lotes son el ${parte} de la tierra (calculado). Esta página simula cómo se podría financiar y cuidar lo común con tokens.`,
  bajadaSinDato:
    "Lo privado es poco y lo común es casi todo: qué parte de la tierra son los lotes, sin dato. Esta página simula cómo se podría financiar y cuidar lo común con tokens.",
  aviso: "Simulación para conversar en el equipo: no se emite ningún token, nada se cobra y nada está decidido.",
  volver: "Ver qué es tuyo y qué es de todos",
  // Enlace que usan la lista de lotes, /lotes/hibrido y la sección Invertir de Sumarte.
  enlace: "El token del bien común: ver la simulación",
  ostrom: {
    titulo: "Inspirado en Elinor Ostrom",
    intro:
      "Elinor Ostrom estudió cómo las comunidades cuidan bienes comunes durante generaciones. Estos son sus ocho principios y cómo los tomaría este diseño.",
    caption: "Los ocho principios de Ostrom y cómo los tomaría el diseño",
    principio: "Principio",
    como: "Cómo lo tomaríamos",
    estado: "Estado",
    idea: "idea",
    filas: [
      {
        principio: "Límites claros",
        como: "Es parte quien adhiere al manifiesto y quien tiene un lote.",
      },
      {
        principio: "Reglas acordes al lugar",
        como: "El agua guía el diseño; el reglamento es igual para todos.",
      },
      {
        principio: "Elección colectiva",
        como: "Quien usa lo común decide sobre lo común: voz con FARO, con un tope por persona a definir.",
      },
      {
        principio: "Monitoreo",
        como: "Libro C: lo que se mide de la tierra es público.",
      },
      {
        principio: "Sanciones graduales",
        como: "Primero un aviso, después la pérdida de voz; nunca la expulsión por creencias.",
      },
      {
        principio: "Resolución de conflictos",
        como: "Un círculo de cuidado y conflictos.",
      },
      {
        principio: "Derecho a organizarse",
        como: "La Fundación y el consorcio, reconocidos por el municipio (a verificar).",
      },
      {
        principio: "Niveles anidados",
        como: "Lote, barrio, Lighthouse y BioPueblo.",
      },
    ],
  },
  tokens: {
    titulo: "Dos tipos de token",
    nft: {
      titulo: "NFT del lote",
      texto:
        "Uno por lote privado. Su metadata diría la superficie, el contorno, el estado administrativo y los deberes. Tenerlo traería deberes (reglamento, aporte, expensas) y una asignación de FARO por m². No reemplaza la escritura: el dominio se registra donde corresponde.",
      porM2: (faro: string) => `Asignación de ejemplo: ${faro} por m² de lote.`,
    },
    faro: {
      titulo: "Token del bien común (FARO, nombre provisorio)",
      texto:
        "Es el único token de todo el bien común: daría voz sobre todas las parcelas comunes, el tesoro y las reglas. No está respaldado por la tierra ni da una parte de ella. Podría usarse para pagar parte de las expensas (una opción a conversar). Todavía no existe.",
      usos: "También podría usarse en lo que ofrezca el Lighthouse: noches de alojamiento, productos de la huerta, talleres o espacios comunes (a conversar).",
      conElLote: "Los FARO de cada lote vendrían incluidos en el precio, sin pagarse aparte, y seguirían al lote si se revende (propuesta a conversar).",
    },
  },
  parcelas: {
    titulo: "Las parcelas comunes",
    texto:
      "Huertas, bosques, talleres, cocinas, vías, escuela: las parcelas comunes no son tokens. Quedan en un registro del tesoro del bien común, con su uso y lo que se mide de cada una. FARO da voz sobre todas, y quien cuida cada parcela tiene un rol que le da la comunidad, que no se compra ni se vende. Ninguna parcela común se vende.",
    delPlano: "Parcelas del plano, por uso",
    aSumar: "A sumar, todavía sin parcela en el plano:",
    aSumarItems: ["Bosques", "Cocinas comunitarias", "Escuela"],
  },
  reparto: {
    titulo: "Cómo se reparte FARO",
    intro: (suministro: string) => `Suministro de ejemplo: ${suministro}. Los cuatro grupos suman el cien por ciento.`,
    caption: "Reparto de FARO por grupo, con su porcentaje y su cantidad",
    grupo: "Grupo",
    porcentaje: "Porcentaje",
    cantidad: "Cantidad",
    grupos: {
      lotes: { nombre: "Lotes y familias", linea: "Se asignan con cada lote, según su superficie." },
      venta: { nombre: "Venta temprana por tramos", linea: "Se ofrecen de a tramos, a un precio que sube." },
      tesoro: { nombre: "Tesoro del bien común", linea: "Lo cuida la comunidad y financia lo común." },
      netxgen: {
        nombre: "NetXGen",
        linea: (anios: string, espera: string) =>
          `La empresa que diseña y opera. Se liberaría en ${anios} años, con ${espera} de espera.`,
      },
    },
  },
  tramos: {
    titulo: "Venta temprana por tramos",
    avance: (pct: string, tramo: string) => `Avance de ejemplo: el tramo ${tramo} está vendido al ${pct}.`,
    intro:
      "Es una curva escalonada: el precio sube de tramo en tramo, así quien llega antes paga menos. La mostramos por tramos porque es más fácil de entender que una curva continua.",
    caption: "Tramos de la venta temprana: cantidad, precio y total en USD",
    tramo: "Tramo",
    cantidad: "Cantidad",
    precio: "Precio por FARO",
    total: "Total",
    calculadora: {
      titulo: "Calculadora",
      campo: "Cuánto pondrías (USD)",
      ayuda: (minimo: string) => `Monto mínimo: ${minimo}. No se guarda nada.`,
      resultado: "Resultado",
      vacio: "Escribí un monto para ver el resultado.",
      minimo: (minimo: string) => `Monto mínimo: ${minimo}. Con menos no hay resultado.`,
      invalido: "Ese monto no se puede calcular: sin dato.",
      recibirias: (faro: string) => `Recibirías ${faro}.`,
      promedio: (precio: string) => `Precio promedio: ${precio} por FARO.`,
      tocas: (lista: string) => `Tramos que toca: ${lista}.`,
      tesoro: (monto: string) => `Iría al tesoro del bien común: ${monto}.`,
      sobrante: (monto: string) => `Los tramos de ejemplo no alcanzan: quedarían ${monto} sin usar.`,
      noSePuede: "No se puede comprar: es una simulación.",
    },
  },
  // Duración de la espera de NetXGen, con su plural ("1 año", "2 años").
  esperaAnios: (n: number) => `${n} ${n === 1 ? "año" : "años"}`,
  staking: {
    titulo: "Staking, en estudio",
    caption: "Las dos opciones de staking: qué da, a quién favorece y su riesgo",
    opcion: "Opción",
    que: "Qué da",
    favorece: "A quién favorece",
    riesgo: "Riesgo",
    a: {
      nombre: "Opción A",
      que: (meses: string) => `Bloquear ${meses} meses suma voz, sin tokens nuevos.`,
      favorece: "A quien se compromete con lo común.",
      riesgo: "Puede dejar afuera a quien no puede bloquear.",
    },
    b: {
      nombre: "Opción B",
      que: (anual: string) => `Bloquear da ${anual} anual en tokens nuevos.`,
      favorece: "A quien bloquea.",
      riesgo: "Emitir tokens nuevos diluye a quien no bloquea.",
    },
    cierre: "Para conversar: la opción A premia el compromiso sin emitir más.",
  },
  plata: {
    titulo: "De dónde sale la plata y en qué se usa",
    capex: {
      titulo: "Inversión inicial (CAPEX)",
      texto:
        "El masterplan de permacultura del cien por ciento de la tierra, el corredor, el agua y los caminos. Se pagaría con la venta temprana, el aporte único de los lotes y el aporte de entrada.",
    },
    opex: {
      titulo: "Mantenimiento (OPEX)",
      texto: "Las expensas, los ingresos del bien común y el aporte de entrada.",
    },
    montos: "Montos: sin dato · a confirmar con Vagner.",
    aporteEntrada: (pct: string) => `Aporte de entrada, de ejemplo: el ${pct} de cada compra va al tesoro del bien común.`,
    referentesTitulo: "Referentes",
    referentesNota: "Todos a verificar.",
    referentes: [
      "Commons Stack: una curva donde cada compra deja un aporte a un fondo común (a verificar).",
      "RealT: propiedades tokenizadas con una reserva para mantenimiento (a verificar).",
      "Nouns: una subasta continua que alimenta un tesoro (a verificar).",
      "Impuesto Harberger (Radical Markets): cada parcela declara su valor y paga una tasa al común (a verificar).",
      "CityDAO: tierra y ciudadanía en NFT (a verificar).",
    ],
  },
  riesgos: {
    titulo: "Riesgos y lo que falta decidir",
    items: [
      "Un token que sube de precio o da derechos sobre plata puede ser un valor negociable ante la CNV (a verificar con abogado).",
      "El NFT no es la escritura.",
      "FARO no está respaldado por la tierra: si lo estuviera y se pudiera vender, el bien común se vendería en partes.",
      "Quién emite y en qué país.",
      "La red y las billeteras.",
      "La verificación de identidad.",
      "Los impuestos.",
      "El nombre.",
      "El reparto y los tramos.",
      "Si las expensas se pagan con FARO.",
    ],
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Fuente de los valores: ${fuente} · versión ${version} · ${fecha}. Todos son de ejemplo.`,
  // Tarjeta de la ficha de lote y línea del boleto.
  ficha: {
    titulo: "NFT del lote (simulado)",
    token: "Número de token",
    superficie: "Superficie",
    centro: "Centro del contorno",
    estado: "Estado administrativo",
    deberes: "Deberes",
    deberesValor: "reglamento, aporte único, expensas",
    faro: "FARO que trae",
    faroPanel: "FARO que trae (simulado)",
    red: "Red",
    redValor: "sin definir",
    ver: "Ver el bien común",
    nota: "Es una simulación: no se emite ningún NFT.",
  },
  boleto: (n: string, faro: string) => `Se acuñaría el NFT del lote ${n} y se asignarían ${faro} (simulado).`,
} as const;

const en: Textos<typeof es> = {
  titulo: "The commons of Lighthouse VRN",
  bajada: (parte: string) =>
    `What is private is small and what is shared is almost everything: the lots are ${parte} of the land (calculated). This page simulates how the commons could be funded and looked after with tokens.`,
  bajadaSinDato:
    "What is private is small and what is shared is almost everything: what share of the land the lots are, no data. This page simulates how the commons could be funded and looked after with tokens.",
  aviso: "Simulation to talk about in the team: no token is issued, nothing is charged and nothing is decided.",
  volver: "See what is yours and what belongs to everyone",
  enlace: "The commons token: see the simulation",
  ostrom: {
    titulo: "Inspired by Elinor Ostrom",
    intro:
      "Elinor Ostrom studied how communities look after shared resources for generations. These are her eight principles and how this design would take them.",
    caption: "Ostrom's eight principles and how the design would take them",
    principio: "Principle",
    como: "How we would take it",
    estado: "Status",
    idea: "draft idea",
    filas: [
      {
        principio: "Clear boundaries",
        como: "A member is whoever adheres to the manifesto and whoever holds a lot.",
      },
      {
        principio: "Rules that fit the place",
        como: "Water guides the design; the regulation is the same for everyone.",
      },
      {
        principio: "Collective choice",
        como: "Whoever uses the commons decides about the commons: a voice through FARO, with a cap per person to be defined.",
      },
      {
        principio: "Monitoring",
        como: "Book C: what is measured on the land is public.",
      },
      {
        principio: "Graduated sanctions",
        como: "A warning first, then loss of voice; never expulsion over beliefs.",
      },
      {
        principio: "Conflict resolution",
        como: "A circle for care and conflicts.",
      },
      {
        principio: "Right to organize",
        como: "The Foundation and the owners' association, recognized by the municipality (to be verified).",
      },
      {
        principio: "Nested levels",
        como: "Lot, neighborhood, Lighthouse and BioPueblo.",
      },
    ],
  },
  tokens: {
    titulo: "Two kinds of token",
    nft: {
      titulo: "Lot NFT",
      texto:
        "One per private lot. Its metadata would state the area, the outline, the administrative status and the duties. Holding it would bring duties (regulation, contribution, common charges) and an allocation of FARO per m². It does not replace the deed: ownership is registered where it belongs.",
      porM2: (faro: string) => `Sample allocation: ${faro} per m² of lot.`,
    },
    faro: {
      titulo: "Commons token (FARO, provisional name)",
      texto:
        "It is the only token for the whole commons: it would give a voice over every common plot, the treasury and the rules. It is not backed by the land and gives no share of it. It could be used to pay part of the common charges (an option to discuss). It does not exist yet.",
      usos: "It could also be used for what Lighthouse offers: nights of accommodation, produce from the gardens, workshops or shared spaces (to be discussed).",
      conElLote: "The FARO of each lot would come included in the price, not paid for separately, and would stay with the lot if it is resold (a proposal to discuss).",
    },
  },
  parcelas: {
    titulo: "The common plots",
    texto:
      "Gardens, forests, workshops, kitchens, roads, a school: the common plots are not tokens. They are kept in a register of the commons treasury, with their use and what is measured on each one. FARO gives a voice over all of them, and whoever looks after each plot holds a role given by the community, which is not bought or sold. No common plot is sold.",
    delPlano: "Plots on the plan, by use",
    aSumar: "To be added, not yet a plot on the plan:",
    aSumarItems: ["Forests", "Community kitchens", "School"],
  },
  reparto: {
    titulo: "How FARO is split",
    intro: (suministro: string) => `Sample supply: ${suministro}. The four groups add up to one hundred percent.`,
    caption: "FARO split by group, with its percentage and amount",
    grupo: "Group",
    porcentaje: "Percentage",
    cantidad: "Amount",
    grupos: {
      lotes: { nombre: "Lots and families", linea: "Allocated with each lot, by its area." },
      venta: { nombre: "Early sale in tranches", linea: "Offered in tranches, at a rising price." },
      tesoro: { nombre: "Commons treasury", linea: "Looked after by the community and funds the commons." },
      netxgen: {
        nombre: "NetXGen",
        linea: (anios: string, espera: string) =>
          `The company that designs and runs it. It would be released over ${anios} years, after ${espera} of waiting.`,
      },
    },
  },
  tramos: {
    titulo: "Early sale in tranches",
    avance: (pct: string, tramo: string) => `Sample progress: tranche ${tramo} is ${pct} sold.`,
    intro:
      "It is a stepped curve: the price goes up from tranche to tranche, so whoever arrives early pays less. We show it by tranches because it is easier to understand than a continuous curve.",
    caption: "Early sale tranches: amount, price and total in USD",
    tramo: "Tranche",
    cantidad: "Amount",
    precio: "Price per FARO",
    total: "Total",
    calculadora: {
      titulo: "Calculator",
      campo: "How much would you put in (USD)",
      ayuda: (minimo: string) => `Minimum amount: ${minimo}. Nothing is saved.`,
      resultado: "Result",
      vacio: "Type an amount to see the result.",
      minimo: (minimo: string) => `Minimum amount: ${minimo}. Below it there is no result.`,
      invalido: "That amount cannot be calculated: no data.",
      recibirias: (faro: string) => `You would receive ${faro}.`,
      promedio: (precio: string) => `Average price: ${precio} per FARO.`,
      tocas: (lista: string) => `Tranches it touches: ${lista}.`,
      tesoro: (monto: string) => `It would go to the commons treasury: ${monto}.`,
      sobrante: (monto: string) => `The sample tranches fall short: ${monto} would stay unused.`,
      noSePuede: "It cannot be bought: this is a simulation.",
    },
  },
  esperaAnios: (n: number) => `${n} ${n === 1 ? "year" : "years"}`,
  staking: {
    titulo: "Staking, under study",
    caption: "The two staking options: what it gives, who it favors and its risk",
    opcion: "Option",
    que: "What it gives",
    favorece: "Who it favors",
    riesgo: "Risk",
    a: {
      nombre: "Option A",
      que: (meses: string) => `Locking for ${meses} months adds voice, with no new tokens.`,
      favorece: "Whoever commits to the commons.",
      riesgo: "It can leave out whoever cannot lock.",
    },
    b: {
      nombre: "Option B",
      que: (anual: string) => `Locking gives ${anual} a year in new tokens.`,
      favorece: "Whoever locks.",
      riesgo: "Issuing new tokens dilutes whoever does not lock.",
    },
    cierre: "To talk about: option A rewards commitment without issuing more.",
  },
  plata: {
    titulo: "Where the money comes from and what it is used for",
    capex: {
      titulo: "Initial investment (CAPEX)",
      texto:
        "The permaculture masterplan of one hundred percent of the land, the corridor, water and roads. It would be paid by the early sale, the lots' one-off contribution and the entry contribution.",
    },
    opex: {
      titulo: "Upkeep (OPEX)",
      texto: "The common charges, the commons' own income and the entry contribution.",
    },
    montos: "Amounts: no data · to be confirmed with Vagner.",
    aporteEntrada: (pct: string) => `Entry contribution, sample: ${pct} of each purchase goes to the commons treasury.`,
    referentesTitulo: "References",
    referentesNota: "All to be verified.",
    referentes: [
      "Commons Stack: a curve where each purchase leaves a contribution to a shared fund (to be verified).",
      "RealT: tokenized properties with a reserve for upkeep (to be verified).",
      "Nouns: a continuous auction that feeds a treasury (to be verified).",
      "Harberger tax (Radical Markets): each plot declares its value and pays a rate to the commons (to be verified).",
      "CityDAO: land and citizenship as NFTs (to be verified).",
    ],
  },
  riesgos: {
    titulo: "Risks and what is still to be decided",
    items: [
      "A token whose price rises or that gives rights over money can be a tradable security before the CNV (to be verified with a lawyer).",
      "The NFT is not the deed.",
      "FARO is not backed by the land: if it were and could be sold, the commons would be sold in pieces.",
      "Who issues it and in which country.",
      "The network and the wallets.",
      "Identity verification.",
      "Taxes.",
      "The name.",
      "The split and the tranches.",
      "Whether common charges are paid in FARO.",
    ],
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Source of the values: ${fuente} · version ${version} · ${fecha}. All of them are samples.`,
  ficha: {
    titulo: "Lot NFT (simulated)",
    token: "Token number",
    superficie: "Area",
    centro: "Outline center",
    estado: "Administrative status",
    deberes: "Duties",
    deberesValor: "regulation, one-off contribution, common charges",
    faro: "FARO it brings",
    faroPanel: "FARO it brings (simulated)",
    red: "Network",
    redValor: "not defined",
    ver: "See the commons",
    nota: "This is a simulation: no NFT is issued.",
  },
  boleto: (n: string, faro: string) => `The NFT of lot ${n} would be minted and ${faro} would be assigned (simulated).`,
};

export const biencomun = { es, en };
