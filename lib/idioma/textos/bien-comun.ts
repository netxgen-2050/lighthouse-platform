// Textos de /bien-comun, "Propuesta en discusión" (bien-comun-propuesta, NS_Tokenomics doc 34 v0.1). Las claves espejan las de
// `lib/bien-comun/modelo.ts`. Ningún número se escribe acá: los valores llegan por parámetro (lo vigila
// `lib/lotes/sin-numeros-escritos.test.ts`). Nada está acordado, todo es simulación y lo legal está a verificar con abogado.
// En español se dice "bien común"; en inglés, "commons". La palabra "retorno" solo puede estar bajo `carriles.a`.
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const es = {
  titulo: "El bien común de Lighthouse VRN",
  bajada: (parte: string) =>
    `Lo privado es poco y lo común es casi todo: los lotes son el ${parte} de la tierra (calculado). Esta página muestra una propuesta, todavía en discusión, de cómo organizar y cuidar lo común.`,
  bajadaSinDato:
    "Lo privado es poco y lo común es casi todo: qué parte de la tierra son los lotes, sin dato. Esta página muestra una propuesta, todavía en discusión, de cómo organizar y cuidar lo común.",
  volver: "Ver qué es tuyo y qué es de todos",
  // Enlace que usan la lista de lotes, /lotes/hibrido y la sección Invertir de Sumarte.
  enlace: "El bien común y los tokens: ver la propuesta en discusión",
  sello: {
    etiqueta: "Estado de esta página",
    texto: (version: string) =>
      `Propuesta ${version} · en discusión con el equipo · números de ejemplo · lo legal, a verificar con abogado`,
    fecha: (fecha: string, fuente: string) => `Versión del ${fecha}. Fuente: ${fuente}.`,
    simulacion: "Es una simulación: no es una oferta, no se emite nada y no se cobra nada.",
  },
  // Índice de la página (ux-bien-comun): el botón del celular y el nombre del índice fijo de la compu.
  indice: { titulo: "En esta página", cerrar: "Cerrar" },
  // Línea que resume cada sección plegada. Las cantidades llegan por parámetro (salen del módulo o del propio diccionario).
  resumenes: {
    politica: (n: string) => `${n} reglas propuestas, cada una con su origen.`,
    decisiones: (n: string) => `${n} decisiones abiertas, con la recomendación de Gus.`,
    cambios: (n: string) => `${n} cosas que salieron del modelo anterior.`,
    ostrom: (n: string) => `${n} principios y cómo los tomaría el diseño.`,
    parcelas: "Huertas, bosques, talleres, cocinas, vías y escuela: no son tokens ni se venden.",
    nft: "La ficha de cada lote privado: no reemplaza la escritura.",
    abogado: (n: string) => `${n} preguntas para verificar con un abogado.`,
  },
  frase: {
    titulo: "En una frase",
    texto:
      "Cada trabajo va al instrumento que mejor lo hace. La plata de quien invierte entra por Token Tierra y Token Inversor, dentro de un fideicomiso por barrio. El bien común se organiza con FARO, que no levanta capital, no cotiza en ningún mercado y por eso no tiene un precio que defender. Los dos carriles se tocan en tres puntos: una parte de cada pago va al común, FARO se acredita con cada cuota pagada y la reventa de un lote también aporta.",
    nadaAcordado: "Nada de esto está acordado: es un borrador para conversar entre Gus, Juanpi y Franz.",
  },
  nodos: {
    tokenTierra: "Token Tierra",
    tokenInversor: "Token Inversor",
    fideicomiso: "Fideicomiso del barrio",
    tesoro: "Tesoro del común",
    faro: "FARO, token del común",
    reventa: "Reventa de un lote",
  },
  carriles: {
    titulo: "Dos carriles y tres puentes",
    intro:
      "Se lee en orden: primero el carril A, después el carril B y por último los tres puentes que los conectan. Las flechas del dibujo son decorativas: cada puente dice en texto de dónde sale y adónde va.",
    a: {
      titulo: "Carril A · capital con retorno",
      bajada: "Quién pone plata y qué recibe. Lo lidera Juanpi.",
      tokenTierra: "Un lote en cuotas: el derecho contractual sobre un lote determinado. La escritura llega al completar el plan.",
      tokenInversor: "Financia la infraestructura del barrio y cobra a medida que entran las cuotas, sin fecha fija.",
      fideicomiso: "Un patrimonio separado por barrio: recibe las cuotas, paga al inversor y escritura al comprador.",
    },
    b: {
      titulo: "Carril B · bien común",
      bajada: "Qué es de todos y cómo se alimenta. Lo lidera Gus.",
      tesoro: "La caja de lo común, a cargo de la Fundación (a crear).",
      faro: "El token del común: voz, noches, huerta y cocina, talleres y expensas. No levanta capital.",
    },
  },
  puentes: {
    titulo: "Los tres puentes",
    de: "De",
    a: "A",
    parteDeCadaPago: {
      nombre: "Una parte de cada pago va al común",
      texto: (pct: string) =>
        `De cada pago de lote, el modelo de ejemplo manda el ${pct} al tesoro, más las expensas. Falta decidir si el Token Inversor también aporta al emitirse.`,
    },
    faroPorCuota: {
      nombre: "FARO con cada cuota pagada",
      texto:
        "El plan de cuotas es también una membresía que crece, según la propuesta. Si alguien abandona el plan, el FARO de las cuotas no pagadas nunca se emite.",
    },
    reventa: {
      nombre: "La reventa aporta",
      texto:
        "El FARO del lote viaja con el lote, quien compra adhiere al reglamento y una parte del precio va al común (a verificar con abogado).",
    },
  },
  puertas: {
    titulo: "Las tres puertas para tener FARO",
    intro: "Ninguna puerta es una inversión. Esta página no ofrece comprar ni prepagar FARO.",
    conElLote: {
      nombre: "Con el lote",
      texto: (faro: string) =>
        `Se acredita a medida que se pagan las cuotas (hoy, de ejemplo, ${faro} por m²). Quien paga la mitad tiene la mitad.`,
    },
    aportando: {
      nombre: "Aportando",
      texto:
        "El trabajo y el cuidado registrados y validados por pares (las Semillas) se convierten en FARO. Es la puerta de quien no tiene capital.",
    },
    prepagando: {
      nombre: "Prepagando servicios",
      texto:
        "Se compra al tesoro del común, a precio fijo, en cupos anuales atados a la capacidad real (camas, cubiertos, horas de taller). Solo se describe: todavía no se ofrece.",
    },
  },
  queDa: {
    titulo: "Qué da FARO",
    nota: "Es lo que propone la v0.1. Hoy, en la plataforma, ser parte del común sale de adherir al manifiesto; FARO no cambia eso.",
    voz: "Voz sobre lo común, según el asunto (ver la política).",
    noches: "Noches de alojamiento.",
    huertaYCocina: "Productos de la huerta y la cocina.",
    talleres: "Talleres y espacios comunes.",
    expensas: "Una parte de las expensas.",
  },
  queNoTiene: {
    titulo: "Qué no tiene FARO",
    exchange: "No se lista en ningún exchange.",
    liquidez: "No tiene pool de liquidez ni quien le haga mercado.",
    recompra: "No hay recompra por dinero.",
    respaldoTierra: "No tiene respaldo en la tierra.",
    premioPorBloquear: "No da un premio en FARO por bloquear.",
  },
  politica: {
    titulo: "La política de FARO",
    intro: (n: string) => `${n} reglas propuestas, para discutir con Juanpi. Cada una dice de dónde viene.`,
    deDonde: "De dónde viene",
    emision: {
      titulo: "Emisión",
      regla: "Solo por las tres puertas, y la tercera con tope anual según capacidad.",
    },
    quema: { titulo: "Quema", regla: "El FARO usado en un servicio se quema." },
    bloqueo: { titulo: "Bloqueo", regla: "Bloquear da más voz, con tope; no da más FARO." },
    transferencia: {
      titulo: "Transferencia",
      regla: (meses: string) =>
        `En la versión 1, solo junto con el lote. Se revisa a los ${meses} meses con datos de uso.`,
    },
    reserva: { titulo: "Reserva", regla: "Ninguna en tierra. El respaldo es la capacidad de dar el servicio." },
    voz: {
      titulo: "Voz",
      regla: "Asuntos de residentes: una persona, un voto. Tesoro y recursos del común: FARO con tope por persona.",
    },
  },
  decisiones: {
    titulo: "Lo que hay que decidir",
    intro: (n: string) => `Las ${n} decisiones del documento 34, con la recomendación de Gus. Ninguna está cerrada.`,
    caption: (n: string) => `Las ${n} decisiones: pregunta, recomendación de Gus y estado`,
    pregunta: "Decisión",
    recomendacionTitulo: "Recomendación de Gus",
    estado: "Estado",
    abierta: "abierta",
    decidida: (fecha: string, quien: string) => `decidida el ${fecha} por ${quien}`,
    d1: { pregunta: "¿FARO levanta capital?", recomendacion: "No. El capital entra por Token Tierra y Token Inversor." },
    d2: {
      pregunta: "¿Token Inversor con recompra a fecha fija o cobrando con las cuotas?",
      recomendacion: "Cobrando con las cuotas, con prima objetivo y plazo máximo.",
    },
    d3: {
      pregunta: "¿FARO se puede transferir en la versión 1?",
      recomendacion: (meses: string) => `Solo con el lote; revisar a los ${meses} meses.`,
    },
    d4: {
      pregunta: "¿Cómo se premia llegar temprano?",
      recomendacion:
        "En Token Tierra, con el precio del lote; en FARO, con descuento por prepago y más voz por bloqueo, sin precio creciente.",
    },
    d5: { pregunta: "¿Voz por FARO o por persona?", recomendacion: "Las dos, según el asunto." },
    d6: {
      pregunta: "¿El nombre es FARO? ¿Qué pasa con RAIZ?",
      recomendacion: "FARO para Lighthouse; RAIZ queda en reserva hasta decidirlo.",
    },
    d7: {
      pregunta: "¿Qué riel?",
      recomendacion: "Después de elegir el primer instrumento. Sin exclusividad.",
    },
    d8: {
      pregunta: "¿Tether como inversor y como riel a la vez?",
      recomendacion: "Separar las dos conversaciones; el equity queda fuera de este acuerdo.",
    },
  },
  cambios: {
    titulo: "Qué cambió",
    intro: (fecha: string) => `Lo que salió del modelo anterior, el del ${fecha}. Una línea cada uno.`,
    tramos: "La venta de FARO por tramos de precio creciente: FARO ya no levanta capital.",
    staking: "El staking que paga FARO nuevo por bloquear: bloquear solo daría más voz, con tope.",
    reservaTierra: "La tierra como reserva de FARO: el respaldo es la capacidad de dar el servicio.",
    repartoFijo: "El reparto fijo del suministro, con una parte en venta y una para NetXGen: FARO se emite solo por las tres puertas.",
  },
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
      { principio: "Límites claros", como: "Es parte quien adhiere al manifiesto y quien tiene un lote." },
      { principio: "Reglas acordes al lugar", como: "El agua guía el diseño; el reglamento es igual para todos." },
      {
        principio: "Elección colectiva",
        como: "Quien usa lo común decide sobre lo común: una persona, un voto en asuntos de residentes, y FARO con tope por persona para el tesoro (propuesta).",
      },
      { principio: "Monitoreo", como: "Libro C: lo que se mide de la tierra es público." },
      {
        principio: "Sanciones graduales",
        como: "Primero un aviso, después la pérdida de voz; nunca la expulsión por creencias.",
      },
      { principio: "Resolución de conflictos", como: "Un círculo de cuidado y conflictos." },
      {
        principio: "Derecho a organizarse",
        como: "La Fundación y el consorcio, reconocidos por el municipio (a verificar).",
      },
      { principio: "Niveles anidados", como: "Lote, barrio, Lighthouse y BioPueblo." },
    ],
  },
  tokens: {
    nft: {
      titulo: "NFT del lote",
      texto:
        "Uno por lote privado: la ficha del lote, con su metadata (superficie, contorno, estado administrativo y deberes hacia el bien común). No reemplaza la escritura: el dominio se registra donde corresponde. Es una simulación: no se emite nada.",
    },
  },
  parcelas: {
    titulo: "Las parcelas comunes",
    texto:
      "Huertas, bosques, talleres, cocinas, vías, escuela: las parcelas comunes no son tokens. Quedan en un registro del tesoro del común, con su uso y lo que se mide de cada una. Quien cuida cada parcela tiene un rol que le da la comunidad, que no se compra ni se vende. Ninguna parcela común se vende.",
    delPlano: "Parcelas del plano, por uso",
    aSumar: "A sumar, todavía sin parcela en el plano:",
    aSumarItems: ["Bosques", "Cocinas comunitarias", "Escuela"],
  },
  abogado: {
    titulo: "Preguntas para el abogado",
    intro: "Preguntas nuevas del documento 34. Nada de esto es asesoramiento legal.",
    items: {
      boleto:
        "¿Un plan de cuotas tokenizado sobre un lote determinado es un boleto de compraventa? ¿Desde qué momento puede firmarse y cobrarse?",
      valorNegociable:
        "¿El Token Inversor es un valor negociable aunque el fideicomiso sea privado y la reventa ocurra dentro de la plataforma? ¿Quién tiene que estar registrado?",
      ticketsChicos:
        "¿Qué vía permite tickets chicos al público: fideicomiso financiero con oferta pública, plataforma de financiamiento colectivo, otra?",
      faroPrepagado:
        "¿FARO prepagado a precio fijo y canjeable por servicios es una preventa de servicios? ¿Qué pide defensa del consumidor y qué impuestos trae?",
      reventaAporta: "¿Se puede obligar por reglamento a que cada reventa de un lote aporte al común?",
      faroPorCuota: "¿Acreditar FARO con cada cuota convierte a FARO en parte del contrato de inversión?",
    },
  },
  // "Los números del barrio" (bien-comun-numeros-barrio). "Retorno" no se usa: la regla de promesas se cumple sin excepciones.
  barrio: {
    titulo: "Los números del barrio",
    intro:
      "Un barrio de ejemplo, el del documento 34. Cambiá los cinco números y mirá qué pasa con el dinero del inversor y con lo que le llega al común. Nada se guarda: al recargar vuelven los valores de partida.",
    fuente: (archivo: string, version: string, fecha: string) =>
      `Calculado con ${archivo} ${version} (${fecha}). Son números de ejemplo y esto no es una oferta.`,
    faltan: "Faltan los costos de obra reales, incluidos los de Vagner: sin dato.",
    camposTitulo: "Los cinco números para mover",
    dePartida: (valor: string) => `de partida: ${valor}`,
    campos: {
      precioLote: "Precio del lote (USD)",
      ritmo: "Lotes vendidos por trimestre",
      cuotas: "Cantidad de cuotas (0 es pago al contado)",
      infraestructuraPorLote: "Infraestructura por lote (USD)",
      prima: "Prima anual del inversor (%)",
    },
    errores: {
      precioLote: "Revisá el precio del lote: tiene que ser un número mayor que cero.",
      ritmo: "Revisá los lotes por trimestre: tiene que ser un número entero, de uno en adelante.",
      cuotas: "Revisá las cuotas: tiene que ser un número entero, cero o más.",
      infraestructuraPorLote: "Revisá la infraestructura por lote: tiene que ser un número, cero o más.",
      prima: "Revisá la prima: tiene que ser un número, cero o más.",
    },
    restablecer: "Volver a los valores de partida",
    resultados: {
      titulo: "Qué pasa con estos números",
      aLevantar: "Plata que tiene que traer el Token Inversor",
      devuelve: "Mes en que se le termina de devolver al inversor, si cobra a medida que entran las cuotas",
      mes: (n: string) => `mes ${n}`,
      noEnAnios: (anios: string) => `no en ${anios} años`,
      totalRecibido: "Lo que recibe el inversor en total",
      fechaFija: (meses: string, pct: string) =>
        `Si se hubiera prometido devolver todo a los ${meses} meses, el fideicomiso tendría ${pct} de lo que debe: por eso no hay fecha fija.`,
      parteFideicomiso: (pct: string) => `De cada dólar que paga un comprador, al fideicomiso le quedan ${pct}.`,
    },
    comun: {
      titulo: "Lo que le llega al común",
      caption: "Lo que le llega al común en cada uno de los años del modelo, en dólares",
      anio: "Año",
      partePagos: "Parte de cada pago",
      expensas: "Expensas",
      total: "Total",
      lotesVendidos: "Lotes vendidos al cierre",
      cubre: (pct: string) =>
        `Cuando terminan las ventas, las expensas de los lotes cubren cerca del ${pct} del presupuesto anual del común.`,
    },
    conclusionesTitulo: "Lo que muestran estos números",
    conclusiones: [
      "El margen es fino: con el precio del medio del rango, los lotes del barrio apenas cubren la plata que lo construyó.",
      "Una fecha fija de devolución no cierra con lotes vendidos en cuotas: el fideicomiso debería el dinero antes de haberlo cobrado.",
      "Lo común no puede vivir solo de los lotes: necesita ingresos propios.",
    ],
    sinSesion: {
      titulo: "Los números del barrio",
      texto: "Esta sección es solo para personas con sesión, hasta la revisión R14. Entrá para verla.",
      entrar: "Entrá para ver los números del barrio",
    },
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Fuente de los valores: ${fuente} · versión ${version} · ${fecha}. Todos son de ejemplo.`,
  // Tarjeta de la ficha de lote y línea del boleto.
  ficha: {
    titulo: "Ficha del lote (NFT, simulado)",
    token: "Número de token",
    superficie: "Superficie",
    centro: "Centro del contorno",
    estado: "Estado administrativo",
    deberes: "Deberes",
    deberesValor: "reglamento, aporte único, expensas",
    faroPanel: "FARO del lote, se acreditan a medida que se paga (simulado)",
    red: "Red",
    redValor: "sin definir",
    ver: "Ver el bien común",
    noInversion: "No es un instrumento de inversión: describe el lote y sus deberes. No reemplaza la escritura.",
    nota: "Es una simulación: no se emite ningún NFT.",
  },
} as const;

const en: Textos<typeof es> = {
  titulo: "The commons of Lighthouse VRN",
  bajada: (parte: string) =>
    `What is private is small and what is shared is almost everything: the lots are ${parte} of the land (calculated). This page shows a proposal, still under discussion, for how to organize and look after the commons.`,
  bajadaSinDato:
    "What is private is small and what is shared is almost everything: what share of the land the lots are, no data. This page shows a proposal, still under discussion, for how to organize and look after the commons.",
  volver: "See what is yours and what belongs to everyone",
  enlace: "The commons and the tokens: see the proposal under discussion",
  sello: {
    etiqueta: "Status of this page",
    texto: (version: string) =>
      `Proposal ${version} · under discussion with the team · sample numbers · legal points to be verified with a lawyer`,
    fecha: (fecha: string, fuente: string) => `Version of ${fecha}. Source: ${fuente}.`,
    simulacion: "This is a simulation: it is not an offer, nothing is issued and nothing is charged.",
  },
  indice: { titulo: "On this page", cerrar: "Close" },
  resumenes: {
    politica: (n: string) => `${n} proposed rules, each one with its origin.`,
    decisiones: (n: string) => `${n} open decisions, with Gus's recommendation.`,
    cambios: (n: string) => `${n} things that left the previous model.`,
    ostrom: (n: string) => `${n} principles and how the design would take them.`,
    parcelas: "Gardens, forests, workshops, kitchens, roads and school: they are not tokens and are not sold.",
    nft: "The record of each private lot: it does not replace the deed.",
    abogado: (n: string) => `${n} questions to verify with a lawyer.`,
  },
  frase: {
    titulo: "In one sentence",
    texto:
      "Each job goes to the instrument that does it best. The money of those who invest comes in through the Land Token and the Investor Token, inside a trust for each neighborhood. The commons is organized with FARO, which does not raise capital, is not traded on any market and so has no price to defend. The two lanes touch at three points: part of every payment goes to the commons, FARO is credited with each installment paid, and the resale of a lot also contributes.",
    nadaAcordado: "None of this is agreed: it is a draft to talk about between Gus, Juanpi and Franz.",
  },
  nodos: {
    tokenTierra: "Land Token",
    tokenInversor: "Investor Token",
    fideicomiso: "Neighborhood trust",
    tesoro: "Commons treasury",
    faro: "FARO, the commons token",
    reventa: "Resale of a lot",
  },
  carriles: {
    titulo: "Two lanes and three bridges",
    intro:
      "Read it in order: lane A first, then lane B, and last the three bridges that connect them. The arrows in the drawing are decorative: each bridge says in text where it starts and where it ends.",
    a: {
      titulo: "Lane A · capital with a return",
      bajada: "Who puts money in and what they receive. Led by Juanpi.",
      tokenTierra: "A lot in installments: the contractual right over a specific lot. The deed comes when the plan is complete.",
      tokenInversor: "Funds the neighborhood's infrastructure and is paid as the installments come in, with no fixed date.",
      fideicomiso: "A separate estate for each neighborhood: it receives the installments, pays the investor and deeds the lot to the buyer.",
    },
    b: {
      titulo: "Lane B · the commons",
      bajada: "What belongs to everyone and how it is fed. Led by Gus.",
      tesoro: "The commons' cash box, run by the Foundation (to be created).",
      faro: "The commons token: voice, nights, garden and kitchen, workshops and common charges. It does not raise capital.",
    },
  },
  puentes: {
    titulo: "The three bridges",
    de: "From",
    a: "To",
    parteDeCadaPago: {
      nombre: "Part of every payment goes to the commons",
      texto: (pct: string) =>
        `From each lot payment, the sample model sends ${pct} to the treasury, plus the common charges. It is still to be decided whether the Investor Token also contributes when issued.`,
    },
    faroPorCuota: {
      nombre: "FARO with each installment paid",
      texto:
        "The installment plan is also a membership that grows, according to the proposal. If someone drops out of the plan, the FARO of the unpaid installments is never issued.",
    },
    reventa: {
      nombre: "Resale contributes",
      texto:
        "The FARO of the lot travels with the lot, the buyer adheres to the regulation and part of the price goes to the commons (to be verified with a lawyer).",
    },
  },
  puertas: {
    titulo: "The three doors to hold FARO",
    intro: "None of the doors is an investment. This page does not offer to buy or prepay FARO.",
    conElLote: {
      nombre: "With the lot",
      texto: (faro: string) =>
        `It is credited as the installments are paid (today, as a sample, ${faro} per m²). Whoever pays half holds half.`,
    },
    aportando: {
      nombre: "By contributing",
      texto:
        "Work and care that are recorded and validated by peers (the Seeds) are turned into FARO. It is the door for whoever has no capital.",
    },
    prepagando: {
      nombre: "By prepaying services",
      texto:
        "It is bought from the commons treasury, at a fixed price, in yearly quotas tied to real capacity (beds, meals, workshop hours). It is only described: it is not offered yet.",
    },
  },
  queDa: {
    titulo: "What FARO gives",
    nota: "This is what v0.1 proposes. Today, on the platform, being part of the commons comes from adhering to the manifesto; FARO does not change that.",
    voz: "A voice over the commons, depending on the matter (see the policy).",
    noches: "Nights of accommodation.",
    huertaYCocina: "Produce from the garden and the kitchen.",
    talleres: "Workshops and shared spaces.",
    expensas: "Part of the common charges.",
  },
  queNoTiene: {
    titulo: "What FARO does not have",
    exchange: "It is not listed on any exchange.",
    liquidez: "It has no liquidity pool and nobody making a market for it.",
    recompra: "There is no buyback for money.",
    respaldoTierra: "It has no backing in the land.",
    premioPorBloquear: "It gives no reward in FARO for locking.",
  },
  politica: {
    titulo: "The FARO policy",
    intro: (n: string) => `${n} proposed rules, to discuss with Juanpi. Each one says where it comes from.`,
    deDonde: "Where it comes from",
    emision: {
      titulo: "Issuance",
      regla: "Only through the three doors, and the third with a yearly cap according to capacity.",
    },
    quema: { titulo: "Burning", regla: "The FARO used on a service is burned." },
    bloqueo: { titulo: "Locking", regla: "Locking gives more voice, with a cap; it does not give more FARO." },
    transferencia: {
      titulo: "Transfer",
      regla: (meses: string) =>
        `In version 1, only together with the lot. It is reviewed after ${meses} months with usage data.`,
    },
    reserva: { titulo: "Reserve", regla: "None in land. The backing is the capacity to provide the service." },
    voz: {
      titulo: "Voice",
      regla: "Residents' matters: one person, one vote. Treasury and commons resources: FARO with a cap per person.",
    },
  },
  decisiones: {
    titulo: "What has to be decided",
    intro: (n: string) => `The ${n} decisions of document 34, with Gus's recommendation. None of them is closed.`,
    caption: (n: string) => `The ${n} decisions: question, Gus's recommendation and status`,
    pregunta: "Decision",
    recomendacionTitulo: "Gus's recommendation",
    estado: "Status",
    abierta: "open",
    decidida: (fecha: string, quien: string) => `decided on ${fecha} by ${quien}`,
    d1: { pregunta: "Does FARO raise capital?", recomendacion: "No. Capital comes in through the Land Token and the Investor Token." },
    d2: {
      pregunta: "Investor Token with a buyback on a fixed date, or paid as the installments come in?",
      recomendacion: "Paid as the installments come in, with a target premium and a maximum term.",
    },
    d3: {
      pregunta: "Can FARO be transferred in version 1?",
      recomendacion: (meses: string) => `Only with the lot; review after ${meses} months.`,
    },
    d4: {
      pregunta: "How do we reward arriving early?",
      recomendacion:
        "In the Land Token, through the lot's price; in FARO, with a prepayment discount and more voice for locking, with no rising price.",
    },
    d5: { pregunta: "Voice by FARO or by person?", recomendacion: "Both, depending on the matter." },
    d6: {
      pregunta: "Is the name FARO? What happens to RAIZ?",
      recomendacion: "FARO for Lighthouse; RAIZ stays in reserve until it is decided.",
    },
    d7: {
      pregunta: "Which rail?",
      recomendacion: "After choosing the first instrument. No exclusivity.",
    },
    d8: {
      pregunta: "Tether as an investor and as a rail at the same time?",
      recomendacion: "Keep the two conversations apart; the equity stays out of this agreement.",
    },
  },
  cambios: {
    titulo: "What changed",
    intro: (fecha: string) => `What was dropped from the previous model, the one of ${fecha}. One line each.`,
    tramos: "Selling FARO in tranches at a rising price: FARO no longer raises capital.",
    staking: "Staking that pays new FARO for locking: locking would only give more voice, with a cap.",
    reservaTierra: "The land as a FARO reserve: the backing is the capacity to provide the service.",
    repartoFijo: "The fixed split of the supply, with a part for sale and a part for NetXGen: FARO is issued only through the three doors.",
  },
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
      { principio: "Clear boundaries", como: "A member is whoever adheres to the manifesto and whoever holds a lot." },
      { principio: "Rules that fit the place", como: "Water guides the design; the regulation is the same for everyone." },
      {
        principio: "Collective choice",
        como: "Whoever uses the commons decides about the commons: one person, one vote on residents' matters, and FARO with a cap per person for the treasury (proposal).",
      },
      { principio: "Monitoring", como: "Book C: what is measured on the land is public." },
      {
        principio: "Graduated sanctions",
        como: "A warning first, then loss of voice; never expulsion over beliefs.",
      },
      { principio: "Conflict resolution", como: "A circle for care and conflicts." },
      {
        principio: "Right to organize",
        como: "The Foundation and the owners' association, recognized by the municipality (to be verified).",
      },
      { principio: "Nested levels", como: "Lot, neighborhood, Lighthouse and BioPueblo." },
    ],
  },
  tokens: {
    nft: {
      titulo: "Lot NFT",
      texto:
        "One per private lot: the lot's file card, with its metadata (area, outline, administrative status and duties toward the commons). It does not replace the deed: ownership is registered where it belongs. This is a simulation: nothing is issued.",
    },
  },
  parcelas: {
    titulo: "The common plots",
    texto:
      "Gardens, forests, workshops, kitchens, roads, a school: the common plots are not tokens. They are kept in a register of the commons treasury, with their use and what is measured on each one. Whoever looks after each plot holds a role given by the community, which is not bought or sold. No common plot is sold.",
    delPlano: "Plots on the plan, by use",
    aSumar: "To be added, not yet a plot on the plan:",
    aSumarItems: ["Forests", "Community kitchens", "School"],
  },
  abogado: {
    titulo: "Questions for the lawyer",
    intro: "New questions from document 34. None of this is legal advice.",
    items: {
      boleto:
        "Is a tokenized installment plan over a specific lot a sales contract? From what moment can it be signed and collected?",
      valorNegociable:
        "Is the Investor Token a tradable security even if the trust is private and the resale happens inside the platform? Who has to be registered?",
      ticketsChicos:
        "Which route allows small tickets for the public: a financial trust with a public offering, a crowdfunding platform, something else?",
      faroPrepagado:
        "Is FARO prepaid at a fixed price and redeemable for services a presale of services? What does consumer protection require and what taxes does it bring?",
      reventaAporta: "Can a regulation require that each resale of a lot contributes to the commons?",
      faroPorCuota: "Does crediting FARO with each installment make FARO part of the investment contract?",
    },
  },
  barrio: {
    titulo: "The neighborhood numbers",
    intro:
      "A sample neighborhood, the one in document 34. Change the five numbers and see what happens to the investor's money and to what reaches the commons. Nothing is saved: when you reload, the starting values are back.",
    fuente: (archivo: string, version: string, fecha: string) =>
      `Calculated with ${archivo} ${version} (${fecha}). These are sample numbers and this is not an offer.`,
    faltan: "The real construction costs, including Vagner's, are missing: no data.",
    camposTitulo: "The five numbers to change",
    dePartida: (valor: string) => `starting value: ${valor}`,
    campos: {
      precioLote: "Lot price (USD)",
      ritmo: "Lots sold per quarter",
      cuotas: "Number of installments (0 means paid at once)",
      infraestructuraPorLote: "Infrastructure per lot (USD)",
      prima: "Investor's yearly premium (%)",
    },
    errores: {
      precioLote: "Check the lot price: it has to be a number greater than zero.",
      ritmo: "Check the lots per quarter: it has to be a whole number, one or more.",
      cuotas: "Check the installments: it has to be a whole number, zero or more.",
      infraestructuraPorLote: "Check the infrastructure per lot: it has to be a number, zero or more.",
      prima: "Check the premium: it has to be a number, zero or more.",
    },
    restablecer: "Back to the starting values",
    resultados: {
      titulo: "What happens with these numbers",
      aLevantar: "Money the Investor Token has to bring",
      devuelve: "Month in which the investor is fully paid back, if paid as the installments come in",
      mes: (n: string) => `month ${n}`,
      noEnAnios: (anios: string) => `not in ${anios} years`,
      totalRecibido: "What the investor receives in total",
      fechaFija: (meses: string, pct: string) =>
        `If paying everything back at ${meses} months had been promised, the trust would hold ${pct} of what it owes: that is why there is no fixed date.`,
      parteFideicomiso: (pct: string) => `Of each dollar a buyer pays, the trust keeps ${pct}.`,
    },
    comun: {
      titulo: "What reaches the commons",
      caption: "What reaches the commons in each year of the model, in dollars",
      anio: "Year",
      partePagos: "Part of each payment",
      expensas: "Common charges",
      total: "Total",
      lotesVendidos: "Lots sold by year end",
      cubre: (pct: string) =>
        `When sales end, the common charges of the lots cover about ${pct} of the commons' yearly budget.`,
    },
    conclusionesTitulo: "What these numbers show",
    conclusiones: [
      "The margin is thin: at the middle of the price range, the neighborhood's lots barely cover the money that built it.",
      "A fixed payback date does not fit lots sold in installments: the trust would owe the money before it has collected it.",
      "The commons cannot live on lots alone: it needs income of its own.",
    ],
    sinSesion: {
      titulo: "The neighborhood numbers",
      texto: "This section is only for people with a session, until the R14 review. Sign in to see it.",
      entrar: "Sign in to see the neighborhood numbers",
    },
  },
  version: (fuente: string, version: string, fecha: string) =>
    `Source of the values: ${fuente} · version ${version} · ${fecha}. All of them are samples.`,
  ficha: {
    titulo: "Lot record (NFT, simulated)",
    token: "Token number",
    superficie: "Area",
    centro: "Outline center",
    estado: "Administrative status",
    deberes: "Duties",
    deberesValor: "regulation, one-off contribution, common charges",
    faroPanel: "FARO of the lot, credited as it is paid (simulated)",
    red: "Network",
    redValor: "not defined",
    ver: "See the commons",
    noInversion: "It is not an investment instrument: it describes the lot and its duties. It does not replace the deed.",
    nota: "This is a simulation: no NFT is issued.",
  },
};

export const biencomun = conVocabulario({ es, en });
