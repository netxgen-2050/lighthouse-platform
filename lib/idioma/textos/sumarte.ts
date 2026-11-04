// Textos de Sumarte (`/sumarte`): encabezado, planes, niveles del pase, comparativa, comprar un lote, invertir, avisos de nivel,
// formulario de pedido de contacto y panel "Entrar como…". Los nombres de planes salen del glosario (una sola fuente).
// Los textos con peso legal ("No es una inversión…", "Esto no es una oferta") no están acá: viven en el catálogo
// (`lib/legal/terminos.ts`). Los montos tampoco: salen de `lib/lotes/modelo.ts` y de `lib/financiamiento/fuentes.ts`.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.sumarte.es,
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: G.sumarte.es,
    h1: "Elegí cómo sumarte",
    intro:
      "Sumarte es la puerta de entrada: cómo te sumás define qué podés hacer. Explorar es gratis. La membresía te abre las salas y los pactos. El Pase Fundador sostiene el Fondo Común del Lighthouse y te da influencia y créditos. Comprar un lote e invertir son otros caminos: están más abajo. Valores de ejemplo, a re-ajustar. Nada se cobra de verdad: todo lo que elijas acá es simulado y queda solo en este navegador.",
  },
  /** Avisos de qué plan habilita una página o una acción (`lib/permisos/niveles.ts`). */
  avisos: {
    rutas: {
      pactos: G.pactos.es,
      semillas: G.semillas.es,
      fogon: G.fogon.es,
      compromisos: G.compromisos.es,
      congreso: G.congreso.es,
      perfil: G.perfil.es,
      pasaporte: G.pasaporte.es,
      panel: G.miRecorrido.es,
      bandeja: "Bandeja",
      configuracion: G.configuracion.es,
      netx: "NetX",
      admin: "La administración",
      otra: "Esta página",
    },
    rutaSuperadmin: (pagina: string) => `${pagina} es solo para el super admin del prototipo.`,
    rutaFundador: (pagina: string) => `${pagina} se habilita con el ${G.paseFundador.es}.`,
    rutaLider: (pagina: string) => `${pagina} se habilita con el ${G.planTribu.es}.`,
    rutaMiembro: (pagina: string) => `${pagina} se habilita con el plan ${G.miembro.es}.`,
    rutaExplorador: (pagina: string) => `${pagina} se habilita al sumarte gratis como ${G.explorador.es}.`,
    accionExplorador: `Esta acción se habilita al sumarte gratis como ${G.explorador.es}.`,
    accionMiembro: `Esta acción se habilita con el plan ${G.miembro.es}.`,
    accionFundador: `Esta acción se habilita con el ${G.paseFundador.es}.`,
    accionLider: `Esta acción se habilita con el ${G.planTribu.es}.`,
    accionNinguna: "Esta acción no se habilita desde Sumarte.",
    /** Lo que se suma al aviso de nivel dentro de Sumarte. */
    elegiUnPlan: "Elegí un plan para sumarte",
    yVolvemos: " y volvemos a donde estabas",
  },
  registro: {
    // `entrar` es el texto del botón "Entrar" de la barra superior.
    ayuda: (entrar: string) =>
      `Al elegir un plan te registrás o entrás con tu email o con Google, sin salir de esta página. Si ya tenés cuenta, usá "${entrar}" arriba.`,
    errorAlmacenamiento:
      "Error: tu navegador no permite guardar datos en este sitio, así que la elección no se puede guardar. Revisá la configuración de privacidad o probá en otro navegador.",
  },
  facturacion: {
    grupo: "Facturación",
    mensual: "Mensual",
    anual: "Anual",
    dosMesesGratis: "2 meses gratis",
    porMes: "/mes",
    porAnio: "/año",
  },
  estadoPlan: {
    actual: "Tu plan actual:",
    sinCuenta: "Todavía no te sumaste: elegí un plan.",
    tuPlan: "Tu plan",
    paseFundador: (nivel: string) => `${G.paseFundador.es} ${nivel}`,
  },
  pesos: {
    montos: "Montos en pesos argentinos (ARS).",
    cambiarMoneda: "Cambiar la moneda",
  },
  explorador: {
    nombre: G.explorador.es,
    precio: "Gratis",
    descripcion: "Conocé el territorio, las tribus y a la gente.",
    incluye: [
      "Mapa y páginas de tribus",
      "Entrevista con el agente",
      "Eventos abiertos",
      "Hifa y tu espacio personal",
    ],
    volver: `Volver a ${G.explorador.es}`,
    sumarme: "Sumarme gratis",
  },
  miembro: {
    nombre: `${G.miembro.es} de la red`,
    descripcion: "Entrá a las salas, proponé pactos y empezá a sumar.",
    todoExplorador: `Todo lo de ${G.explorador.es}`,
    salas: "Salas de tribu y foros",
    pactosY: "Pactos y ",
    voz: "Voz en tu tribu",
    plata: "La cobra NetX: es un servicio.",
    hacerme: "Hacerme miembro",
  },
  fundador: {
    cohorte: "Cohorte Génesis · fecha a definir",
    nivelDelPase: "Nivel del pase",
    pagoUnico: " · pago único · de por vida",
    financias: "Sostenés el Fondo Común",
    financiasFin: " y entrás a la cohorte fundadora. La misma influencia en los tres niveles.",
    plata: "Va al Fondo Común del procomún, no a NetX.",
    todoMiembro: `Todo lo de ${G.miembro.es}, 1 año incluido`,
    creditos: (monto: string) => `${monto} en créditos comunes y de estadía`,
    creditosFin: ", se liberan en 3 años y vencen a los 12 meses de liberarse",
    influencia: "Influencia en el Fondo Común",
    influenciaFin: ": la distribución de grandes sumas se va a decidir con conviction voting (próximamente)",
    canal: "Canal de fundadores",
    registroGenesis: "Registro Genesis si venís a un evento de comunidad (a definir)",
    medidorPases: "Pases de la cohorte",
    medidorMinimo: "Mínimo para abrir el Fondo Común",
    activo: (nivel: string) => `Pase ${nivel} activo`,
    quiero: (nivel: string) => `Quiero el Pase ${nivel}`,
  },
  niveles: { semilla: "Semilla", brote: "Brote", raiz: "Raíz" },
  tribu: {
    nombre: G.planTribu.es,
    descripcion: "Para tribus con personería que quieren organizarse acá.",
    incluye: [
      "Página pública y convocatorias",
      "Pactos, rondas de reconocimiento y Semillas",
      "Salas y canales propios",
      "Ritual de entrada configurable",
    ],
    plata: "Lo cobra NetX: un servicio que le factura a la tribu.",
    alElegir:
      "Al elegirlo sos líder de tu tribu: todo lo de Miembro y la administración de la tribu que elijas. Cobro simulado, sin aprobación todavía.",
    liderDe: (tribu: string) => `Sos líder de ${tribu}`,
    tribuNueva: "Tu tribu nueva está por proponerse",
    cambiar: "Cambiar de tribu",
    elegirBarrio: "Elegir un barrio vacante para proponerla",
    cual: "¿Qué tribu vas a liderar?",
    proponerNueva: "Proponer una tribu nueva",
    serLider: "Ser líder de esta tribu",
    sumarMiTribu: "Sumar mi tribu",
  },
  comparativa: {
    titulo: "Qué incluye cada plan",
    funcion: "Función",
    incluido: "Incluido",
    noIncluido: "No incluido",
    verSellos: "Ver qué te abre cada sello de tu pasaporte",
  },
  /** Adhesión al manifiesto: va fuera de las tarjetas y no condiciona ningún plan. */
  adhesion: {
    antes:
      "Para participar en las decisiones hace falta tener como mínimo el plan Miembro y adherir al manifiesto de Lighthouse VRN",
    despues:
      ". Adherís y quedás adentro al instante: nadie tiene que aceptarte. Elegir un plan no te hace adherir.",
    enlace: "Leer el manifiesto",
  },
  /** Puerta a la venta simulada de lotes (ADR-030). El precio sale de `lib/lotes/modelo.ts`. */
  comprarLote: {
    titulo: "Comprar un lote",
    texto: (precio: string) =>
      `Lotes privados: primero 4 junto a Lighthouse VRN, fuera del 7A, y después el sector norte, con un loteo provisorio e ilustrativo. Desde ${precio} el lote, con opción de casa: precios de ejemplo, a confirmar. Es una simulación: no se cobra nada y no reserva ningún lote de verdad.`,
    enlace: "Ver los lotes",
  },
  invertir: {
    titulo: "Invertir",
    intro: "Invertir es distinto de sumarte: es otro camino, con otros documentos.",
    proyectos: {
      etiqueta: "Por invitación",
      titulo: "En los proyectos de regeneración",
      textoA: "Esta plata de inversión va a proyectos (las series",
      textoB: "), no a la tierra. Las series todavía no existen: la idea es entrar con un SAFU",
      textoC: ", que después se convierte en Unidades de la Serie Madre",
      textoD: ".",
      tierraA: "La tierra común queda en una Fundación",
      tierraB: " que todavía no existe y que no podría venderla. Los lotes privados son otro camino: están en \"Comprar un lote\".",
      enlace: "Ver cómo funciona en la Vista NetX",
      referencia: "Programa de series",
      invitacionPedida: "Invitación pedida",
      pedirInvitacion: "Pedir invitación",
    },
    empresa: {
      etiqueta: "Conversación privada",
      titulo: "En NetX como empresa",
      texto:
        "Es otra inversión: en la compañía detrás de la plataforma, no en los proyectos. Lo hablamos uno a uno con el equipo.",
      // `abierto` (TICKETS_SAFE) decide si el máximo es "o más".
      tickets: (min: string, max: string, abierto: boolean) =>
        `Tickets desde ${min} hasta ${max}${abierto ? " o más" : ""}: de ejemplo, a definir con Vagner.`,
      enlace: "Ver cómo se financia NetX en la Vista NetX",
      referencia: "Invertir en NetX",
      charlaPedida: "Charla pedida",
      pedirCharla: "Pedir una charla",
    },
  },
  /** Formulario de pedido de contacto (también lo usa la consulta por un lote). */
  pedido: {
    motivos: {
      "consulta-lote": { etiqueta: "Consulta por un lote", destino: "BioPueblo, vía NetX como agencia" },
      "consulta-lote-vrn": { etiqueta: "Consulta por un lote de Lighthouse VRN", destino: "Equipo NetX" },
      "invitacion-circulo": { etiqueta: "Invitación al círculo", destino: "Equipo NetX" },
      "charla-netx": { etiqueta: "Charla para invertir en NetX", destino: "Equipo NetX" },
    },
    canales: { email: "Email", telegram: "Telegram", whatsapp: "WhatsApp" },
    momentos: { manana: "Mañana", tarde: "Tarde", noche: "Noche" },
    prototipo: "En el prototipo no te pedimos email ni teléfono: el pedido queda solo en este navegador.",
    comoContactar: "Cómo preferís que te contactemos",
    mejorMomento: "Mejor momento (opcional)",
    sinPreferencia: "Sin preferencia",
    mensaje: "Mensaje (opcional)",
    noDatosPersonales: (escritos: number, tope: number) =>
      `No escribas datos personales acá. ${escritos} de ${tope} caracteres.`,
    errorCanal: "Elegí cómo preferís que te contactemos",
    errorMensaje: (tope: number) => `El mensaje puede tener hasta ${tope} caracteres`,
    errorGuardar: "Error: tu navegador no permite guardar datos en este sitio, así que el pedido no se pudo guardar.",
    recibido: (destino: string) => `Pedido recibido (simulado). Lo vería: ${destino}.`,
    enviar: "Enviar pedido (simulado)",
  },
  entrarComo: {
    titulo: "Entrar como…",
    modoPrueba: "Modo de prueba: no usa Privy y no existe en producción.",
    sinConfigurar: "El registro no está configurado en este entorno, así que todavía no se puede entrar.",
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.sumarte.en,
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: G.sumarte.en,
    h1: "Choose how to join",
    intro:
      "Joining is the way in: how you join defines what you can do. Exploring is free. Membership opens the rooms and the pacts. The Founder Pass supports the Lighthouse Common Fund and gives you influence and credits. Buying a lot and investing are different paths: they're further down. Sample values, to be re-tuned. Nothing is really charged: everything you choose here is simulated and stays only in this browser.",
  },
  avisos: {
    rutas: {
      pactos: G.pactos.en,
      semillas: G.semillas.en,
      fogon: G.fogon.en,
      compromisos: G.compromisos.en,
      congreso: G.congreso.en,
      perfil: G.perfil.en,
      pasaporte: G.pasaporte.en,
      panel: G.miRecorrido.en,
      bandeja: "Inbox",
      configuracion: G.configuracion.en,
      netx: "NetX",
      admin: "The admin page",
      otra: "This page",
    },
    rutaSuperadmin: (pagina: string) => `${pagina} is only for the prototype's super admin.`,
    rutaFundador: (pagina: string) => `${pagina} is unlocked with the ${G.paseFundador.en}.`,
    rutaLider: (pagina: string) => `${pagina} is unlocked with the ${G.planTribu.en}.`,
    rutaMiembro: (pagina: string) => `${pagina} is unlocked with the ${G.miembro.en} plan.`,
    rutaExplorador: (pagina: string) => `${pagina} is unlocked by joining for free as an ${G.explorador.en}.`,
    accionExplorador: `This action is unlocked by joining for free as an ${G.explorador.en}.`,
    accionMiembro: `This action is unlocked with the ${G.miembro.en} plan.`,
    accionFundador: `This action is unlocked with the ${G.paseFundador.en}.`,
    accionLider: `This action is unlocked with the ${G.planTribu.en}.`,
    accionNinguna: "This action can't be unlocked from here.",
    elegiUnPlan: "Choose a plan to join",
    yVolvemos: " and we'll take you back to where you were",
  },
  registro: {
    ayuda: (entrar: string) =>
      `When you choose a plan you sign up or sign in with your email or Google, without leaving this page. If you already have an account, use "${entrar}" above.`,
    errorAlmacenamiento:
      "Error: your browser doesn't allow saving data on this site, so your choice can't be saved. Check your privacy settings or try another browser.",
  },
  facturacion: {
    grupo: "Billing",
    mensual: "Monthly",
    anual: "Yearly",
    dosMesesGratis: "2 months free",
    porMes: "/month",
    porAnio: "/year",
  },
  estadoPlan: {
    actual: "Your current plan:",
    sinCuenta: "You haven't joined yet: choose a plan.",
    tuPlan: "Your plan",
    paseFundador: (nivel: string) => `${G.paseFundador.en} ${nivel}`,
  },
  pesos: {
    montos: "Amounts in Argentine pesos (ARS).",
    cambiarMoneda: "Change currency",
  },
  explorador: {
    nombre: G.explorador.en,
    precio: "Free",
    descripcion: "Get to know the territory, the tribes and the people.",
    incluye: [
      "Map and tribe pages",
      "Interview with the agent",
      "Open events",
      "Hifa and your personal space",
    ],
    volver: `Back to ${G.explorador.en}`,
    sumarme: "Join for free",
  },
  miembro: {
    nombre: `${G.miembro.en} of the network`,
    descripcion: "Enter the rooms, propose pacts and start contributing.",
    todoExplorador: `Everything in ${G.explorador.en}`,
    salas: "Tribe rooms and forums",
    pactosY: "Pacts and ",
    voz: "A voice in your tribe",
    plata: "NetX charges it: it's a service.",
    hacerme: "Become a member",
  },
  fundador: {
    cohorte: "Genesis Cohort · date to be defined",
    nivelDelPase: "Pass level",
    pagoUnico: " · one-time payment · lifetime",
    financias: "You support the Common Fund",
    financiasFin: " and join the founding cohort. The same influence at all three levels.",
    plata: "It goes to the commons' Common Fund, not to NetX.",
    todoMiembro: `Everything in ${G.miembro.en}, 1 year included`,
    creditos: (monto: string) => `${monto} in common and stay credits`,
    creditosFin: ", released over 3 years; they expire 12 months after release",
    influencia: "Influence in the Common Fund",
    influenciaFin: ": the distribution of large sums will be decided with conviction voting (coming soon)",
    canal: "Founders channel",
    registroGenesis: "Genesis registration if you attend a community event (to be defined)",
    medidorPases: "Cohort passes",
    medidorMinimo: "Minimum to open the Common Fund",
    activo: (nivel: string) => `${nivel} Pass active`,
    quiero: (nivel: string) => `I want the ${nivel} Pass`,
  },
  niveles: { semilla: "Seed", brote: "Sprout", raiz: "Root" },
  tribu: {
    nombre: G.planTribu.en,
    descripcion: "For incorporated tribes that want to organize here.",
    incluye: [
      "Public page and open calls",
      "Pacts, recognition rounds and Semillas",
      "Their own rooms and channels",
      "Configurable entry ritual",
    ],
    plata: "NetX charges it: a service billed to the tribe.",
    alElegir:
      "By choosing it you become the leader of your tribe: everything in Member plus the administration of the tribe you pick. Simulated charge, no approval yet.",
    liderDe: (tribu: string) => `You lead ${tribu}`,
    tribuNueva: "Your new tribe is about to be proposed",
    cambiar: "Change tribe",
    elegirBarrio: "Pick a vacant neighborhood to propose it",
    cual: "Which tribe will you lead?",
    proponerNueva: "Propose a new tribe",
    serLider: "Become leader of this tribe",
    sumarMiTribu: "Add my tribe",
  },
  comparativa: {
    titulo: "What each plan includes",
    funcion: "Feature",
    incluido: "Included",
    noIncluido: "Not included",
    verSellos: "See what each stamp in your passport opens",
  },
  adhesion: {
    antes:
      "To take part in decisions you need at least the Member plan and to sign on to the Lighthouse VRN manifesto",
    despues: ". You sign on and you're in right away: nobody has to accept you. Choosing a plan doesn't sign you on.",
    enlace: "Read the manifesto",
  },
  comprarLote: {
    titulo: "Buy a lot",
    texto: (precio: string) =>
      `Private lots: first 4 next to Lighthouse VRN, outside the 7A, then the north sector, on a provisional, illustrative subdivision. From ${precio} per lot, with a house option: sample prices, to be confirmed. It's a simulation: nothing is charged and no lot is really reserved.`,
    enlace: "See the lots",
  },
  invertir: {
    titulo: "Invest",
    intro: "Investing is not the same as joining: it's a different path, with different documents.",
    proyectos: {
      etiqueta: "By invitation",
      titulo: "In the regeneration projects",
      textoA: "This investment money goes to projects (the series",
      textoB: "), not to the land. The series don't exist yet: the idea is to come in with a SAFU",
      textoC: ", which later converts into Units of the Mother Series",
      textoD: ".",
      tierraA: "The common land stays in a Foundation",
      tierraB: " that doesn't exist yet and could not sell it. Private lots are a different path: see \"Buy a lot\".",
      enlace: "See how it works in the NetX View (in Spanish)",
      referencia: "Series program",
      invitacionPedida: "Invitation requested",
      pedirInvitacion: "Request an invitation",
    },
    empresa: {
      etiqueta: "Private conversation",
      titulo: "In NetX as a company",
      texto:
        "It's a different investment: in the company behind the platform, not in the projects. We talk it over one on one with the team.",
      tickets: (min: string, max: string, abierto: boolean) =>
        `Tickets from ${min} to ${max}${abierto ? " or more" : ""}: samples, to be defined with Vagner.`,
      enlace: "See how NetX is funded in the NetX View (in Spanish)",
      referencia: "Invest in NetX",
      charlaPedida: "Talk requested",
      pedirCharla: "Request a talk",
    },
  },
  pedido: {
    motivos: {
      "consulta-lote": { etiqueta: "Inquiry about a lot", destino: "BioPueblo, through NetX as agency" },
      "consulta-lote-vrn": { etiqueta: "Inquiry about a Lighthouse VRN lot", destino: "NetX team" },
      "invitacion-circulo": { etiqueta: "Invitation to the circle", destino: "NetX team" },
      "charla-netx": { etiqueta: "Talk about investing in NetX", destino: "NetX team" },
    },
    canales: { email: "Email", telegram: "Telegram", whatsapp: "WhatsApp" },
    momentos: { manana: "Morning", tarde: "Afternoon", noche: "Evening" },
    prototipo: "In the prototype we don't ask for your email or phone: the request stays only in this browser.",
    comoContactar: "How would you like us to contact you",
    mejorMomento: "Best time (optional)",
    sinPreferencia: "No preference",
    mensaje: "Message (optional)",
    noDatosPersonales: (escritos: number, tope: number) =>
      `Don't write personal data here. ${escritos} of ${tope} characters.`,
    errorCanal: "Choose how you'd like us to contact you",
    errorMensaje: (tope: number) => `The message can have up to ${tope} characters`,
    errorGuardar: "Error: your browser doesn't allow saving data on this site, so the request couldn't be saved.",
    recibido: (destino: string) => `Request received (simulated). It would be seen by: ${destino}.`,
    enviar: "Send request (simulated)",
  },
  entrarComo: {
    titulo: "Sign in as…",
    modoPrueba: "Test mode: it doesn't use Privy and doesn't exist in production.",
    sinConfigurar: "Sign-up isn't set up in this environment, so signing in isn't possible yet.",
  },
};

export const sumarte = { es, en };
