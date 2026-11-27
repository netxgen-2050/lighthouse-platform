// Textos de Sumarte (`/sumarte`): encabezado, planes de la fase 1 (Explorador, Amigo, Fundador y Aliados), FARO de prepago en
// borrador, comparativa, comprar un lote, invertir, avisos de nivel, formulario de pedido de contacto y panel "Entrar como…".
// Los nombres de planes salen del glosario (una sola fuente). Los textos con peso legal viven en el catálogo
// (`lib/legal/terminos.ts`). Los números (precios, cupo, reglas del FARO) tampoco están acá: salen de `lib/sumarte/datos.ts`,
// de `lib/lotes/modelo.ts` y llegan como argumentos. Ningún texto de los planes dice "inversión", "retorno", "rendimiento" ni
// "de por vida" (un test lo revisa).
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";
import { conVocabulario } from "../vocabulario";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.sumarte.es,
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: G.sumarte.es,
    h1: "Elegí cómo sumarte",
    intro:
      "Sumarte es la puerta de entrada. Explorar es gratis y alcanza para adherir al manifiesto y sumarte a un equipo de Participa: la voz y el trabajo no se compran. Amigo y Fundador suman utilidades y FARO de prepago. Comprar un lote e invertir son otros caminos: están más abajo. Valores de ejemplo, a re-ajustar. El pago es simulado: no se cobra nada y lo que elijas queda solo en este navegador.",
  },
  /** Los tres caminos de arriba (ux-sumarte): cada uno lleva a la parte de la página que le corresponde. */
  caminos: {
    titulo: "¿Qué querés hacer?",
    vivir: { etiqueta: "Quiero vivir", titulo: "Comprar un lote", texto: "Lotes de ejemplo en Lighthouse VRN." },
    invertir: { etiqueta: "Quiero invertir", titulo: "Invertir", texto: "Otro camino, con otros documentos." },
    cuidar: { etiqueta: "Quiero cuidar el bien común", titulo: "Elegir un plan", texto: "Tres planes y una franja para organizaciones." },
  },
  /** Selector de planes (en el celular, un plan por vez). */
  selector: {
    grupo: "Plan",
    planes: "Planes",
    explorador: G.explorador.es,
    miembro: G.miembro.es,
    fundador: G.fundador.es,
    queIncluye: "Qué incluye y qué no",
    paraQuien: {
      titulo: "Para quién es",
      explorador: "Para quien recién conoce el proyecto.",
      miembro: "Para quien sigue el proyecto y quiere estar cerca.",
      fundador: "Para quien quiere apoyar desde el principio.",
      aliados: "Empresas, ONG y universidades.",
    },
  },
  /** Cajón del modo de prueba, al final de la página. */
  modoPrueba: { titulo: "Modo de prueba" },
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
    rutaFundador: (pagina: string) => `${pagina} se habilita con el plan ${G.fundador.es}.`,
    rutaLider: (pagina: string) => `${pagina} es para ${G.aliado.es}s, según el acuerdo.`,
    rutaMiembro: (pagina: string) => `${pagina} se habilita con el plan ${G.miembro.es}.`,
    rutaExplorador: (pagina: string) => `${pagina} se habilita al sumarte gratis como ${G.explorador.es}.`,
    accionExplorador: `Esta acción se habilita al sumarte gratis como ${G.explorador.es}.`,
    accionMiembro: `Esta acción se habilita con el plan ${G.miembro.es}.`,
    accionFundador: `Esta acción se habilita con el plan ${G.fundador.es}.`,
    accionLider: `Esta acción es para ${G.aliado.es}s, según el acuerdo.`,
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
  },
  pesos: {
    montos: "Montos en pesos argentinos (ARS).",
    cambiarMoneda: "Cambiar la moneda",
  },
  /** Los planes. Cada beneficio con `pronto` todavía no existe y se marca "Próximamente" en texto. */
  planes: {
    destacado: "El más elegido",
    pronto: "Próximamente",
    ningunPlan: "Ningún plan da prioridad, reserva ni crédito sobre un lote, ni acceso a invertir.",
    explorador: {
      nombre: G.explorador.es,
      precio: "Gratis",
      incluye: [
        { texto: "Mapa y lotes en vitrina", pronto: false },
        { texto: "Bien común: leer números y propuestas", pronto: false },
        { texto: "Participa: sumarte a un equipo", pronto: false },
        { texto: "Adherir al manifiesto", pronto: false },
        { texto: "Mi tierra, Hifa y novedades mensuales", pronto: false },
      ],
      volver: `Volver a ${G.explorador.es}`,
      sumarme: "Sumarme gratis",
    },
    amigo: {
      nombre: G.miembro.es,
      incluye: [
        { texto: `Todo lo de ${G.explorador.es}`, pronto: false },
        { texto: "Bitácora de obra y masterplan", pronto: true },
        { texto: "Una sesión al mes con el equipo", pronto: true },
        { texto: "Cupo antes que nadie en visitas y eventos (nunca en lotes)", pronto: true },
        { texto: "FARO de prepago por mes", pronto: false },
      ],
      hacerme: `Hacerme ${G.miembro.es}`,
      incluidoEnFundador: `Incluido en tu plan ${G.fundador.es}`,
      darmeDeBaja: "Darme de baja",
    },
    fundador: {
      nombre: G.fundador.es,
      pagoUnico: " · pago único",
      /** Cuántos pases quedan, en texto. */
      cohorte: (quedan: string, cupo: string) => `Quedan ${quedan} de ${cupo} pases`,
      incluye: [
        { texto: `Todo lo de ${G.miembro.es} mientras dure tu FARO`, pronto: false },
        { texto: "FARO de prepago de una vez", pronto: false },
        { texto: "Visita guiada al sitio", pronto: true },
        { texto: "Tu nombre en el registro Génesis", pronto: false },
      ],
      quiero: `Quiero ser ${G.fundador.es}`,
      activo: `${G.fundador.es} activo`,
    },
  },
  /** Franja de Aliados (organizaciones): no se elige con un plan, abre el pedido de contacto. */
  aliados: {
    nombre: "Aliados",
    etiqueta: "Para organizaciones",
    sinPrecio: "Sin precio fijo: lo hablamos con cada organización.",
    incluye: [
      { texto: "Patrocinar un proyecto de regeneración", pronto: true },
      { texto: "Talleres para equipos", pronto: true },
      { texto: "Acceso a datos para investigación", pronto: true },
    ],
    hablemos: "Hablemos",
    referencia: "Aliados",
    pedido: "Pedido enviado",
  },
  /** FARO de prepago (borrador): sus números llegan como argumentos desde `FARO_PREPAGO`. */
  faro: {
    titulo: "Cómo funciona el FARO de tu plan",
    borrador: "Borrador · a definir",
    aDefinir: "(a definir)",
    intro: "Tu plan acredita FARO para canjear después por lo que ofrece: es la tercera puerta de FARO, «Prepagando servicios».",
    reglas: {
      precio: (precio: string, ad: string) => `Precio fijo: 1 FARO = ${precio}${ad} a precio de lista.`,
      canje: "Se canjea solo por lo que existe: en la fase 1, eventos de comunidad, visitas, talleres y sesiones.",
      quema: "Se quema al usarse y no se devuelve en plata.",
      vence: (amigo: string, fundador: string, ad: string) =>
        `Vence: el de ${G.miembro.es} a los ${amigo} meses${ad} de acreditarse, el de ${G.fundador.es} a los ${fundador} meses${ad}.`,
      sinVoz:
        "No da voz: la voz sale del FARO del lote, del trabajo en Participa y de adherir al manifiesto.",
    },
    acredita: {
      amigo: (faro: string, ad: string) => `Cada mes se te acreditan ${faro} FARO${ad}.`,
      fundador: (faro: string, ad: string) => `Se te acreditan ${faro} FARO de una vez${ad}.`,
    },
    reparto: {
      amigo: (servicio: string, faro: string, ad: string) =>
        `De tu cuota: ${servicio} por el servicio de NetX · ${faro} en FARO que se reserva para el bien común${ad}.`,
      fundador: (servicio: string, faro: string, ad: string) =>
        `De tu pago: ${servicio} por el servicio de NetX · ${faro} en FARO que se reserva para el bien común${ad}.`,
    },
  },
  comparativa: {
    titulo: "Qué incluye cada plan",
    funcion: "Función",
    incluido: "Incluido",
    noIncluido: "No incluido",
    proximamente: "Próximamente",
    verSellos: "Ver qué te abre cada sello de tu pasaporte",
  },
  /** Adhesión al manifiesto: va fuera de las tarjetas y no condiciona ningún plan. */
  adhesion: {
    antes:
      "Para participar en las decisiones hace falta una cuenta gratis y adherir al manifiesto de Lighthouse VRN",
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
  /** Tarjeta de destino: Invertir tiene su propio camino y no depende de ningún plan. */
  invertir: {
    titulo: "Invertir",
    texto: "Es otro camino, con otros documentos y sus propios números. No depende de ningún plan: quien tiene cuenta ve lo mismo.",
    enlace: "Ir a Invertir",
  },
  /** Formulario de pedido de contacto (también lo usa la consulta por un lote). */
  pedido: {
    motivos: {
      "consulta-lote": { etiqueta: "Consulta por un lote", destino: "BioPueblo, vía NetX como agencia" },
      "consulta-lote-vrn": { etiqueta: "Consulta por un lote de Lighthouse VRN", destino: "Equipo NetX" },
      "invitacion-circulo": { etiqueta: "Invitación al círculo", destino: "Equipo NetX" },
      "charla-netx": { etiqueta: "Charla para invertir en NetX", destino: "Equipo NetX" },
      aliados: { etiqueta: "Pedido de Aliados", destino: "Equipo NetX" },
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
      "Joining is the way in. Exploring is free and is enough to sign on to the manifesto and join a Take part team: your voice and your work are not for sale. Friend and Founder add utilities and prepaid FARO. Buying a lot and investing are different paths: they're further down. Sample values, to be re-tuned. The payment is simulated: nothing is charged and what you choose stays only in this browser.",
  },
  caminos: {
    titulo: "What do you want to do?",
    vivir: { etiqueta: "I want to live", titulo: "Buy a lot", texto: "Sample lots at Lighthouse VRN." },
    invertir: { etiqueta: "I want to invest", titulo: "Invest", texto: "A different path, with different documents." },
    cuidar: { etiqueta: "I want to look after the common good", titulo: "Choose a plan", texto: "Three plans and a band for organizations." },
  },
  selector: {
    grupo: "Plan",
    planes: "Plans",
    explorador: G.explorador.en,
    miembro: G.miembro.en,
    fundador: G.fundador.en,
    queIncluye: "What's included and what's not",
    paraQuien: {
      titulo: "Who it's for",
      explorador: "For people who are just getting to know the project.",
      miembro: "For people who follow the project and want to stay close.",
      fundador: "For people who want to back it from the start.",
      aliados: "Companies, NGOs and universities.",
    },
  },
  modoPrueba: { titulo: "Test mode" },
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
    rutaFundador: (pagina: string) => `${pagina} is unlocked with the ${G.fundador.en} plan.`,
    rutaLider: (pagina: string) => `${pagina} is for Allies, by agreement.`,
    rutaMiembro: (pagina: string) => `${pagina} is unlocked with the ${G.miembro.en} plan.`,
    rutaExplorador: (pagina: string) => `${pagina} is unlocked by joining for free as an ${G.explorador.en}.`,
    accionExplorador: `This action is unlocked by joining for free as an ${G.explorador.en}.`,
    accionMiembro: `This action is unlocked with the ${G.miembro.en} plan.`,
    accionFundador: `This action is unlocked with the ${G.fundador.en} plan.`,
    accionLider: "This action is for Allies, by agreement.",
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
  },
  pesos: {
    montos: "Amounts in Argentine pesos (ARS).",
    cambiarMoneda: "Change currency",
  },
  planes: {
    destacado: "Most chosen",
    pronto: "Coming soon",
    ningunPlan: "No plan gives priority, reservation or credit toward a lot, or access to investing.",
    explorador: {
      nombre: G.explorador.en,
      precio: "Free",
      incluye: [
        { texto: "Map and lots on display", pronto: false },
        { texto: "Common good: read the numbers and proposals", pronto: false },
        { texto: "Take part: join a team", pronto: false },
        { texto: "Sign on to the manifesto", pronto: false },
        { texto: "My land, Hifa and monthly news", pronto: false },
      ],
      volver: `Back to ${G.explorador.en}`,
      sumarme: "Join for free",
    },
    amigo: {
      nombre: G.miembro.en,
      incluye: [
        { texto: `Everything in ${G.explorador.en}`, pronto: false },
        { texto: "Construction log and masterplan", pronto: true },
        { texto: "One session a month with the team", pronto: true },
        { texto: "First access to visits and events (never to lots)", pronto: true },
        { texto: "Prepaid FARO every month", pronto: false },
      ],
      hacerme: `Become a ${G.miembro.en}`,
      incluidoEnFundador: `Included in your ${G.fundador.en} plan`,
      darmeDeBaja: "Cancel my plan",
    },
    fundador: {
      nombre: G.fundador.en,
      pagoUnico: " · one-time payment",
      cohorte: (quedan: string, cupo: string) => `${quedan} of ${cupo} passes left`,
      incluye: [
        { texto: `Everything in ${G.miembro.en} while your FARO lasts`, pronto: false },
        { texto: "Prepaid FARO all at once", pronto: false },
        { texto: "Guided visit to the site", pronto: true },
        { texto: "Your name in the Genesis registry", pronto: false },
      ],
      quiero: `I want to be a ${G.fundador.en}`,
      activo: `${G.fundador.en} active`,
    },
  },
  aliados: {
    nombre: "Allies",
    etiqueta: "For organizations",
    sinPrecio: "No fixed price: we talk it over with each organization.",
    incluye: [
      { texto: "Sponsor a regeneration project", pronto: true },
      { texto: "Workshops for teams", pronto: true },
      { texto: "Access to data for research", pronto: true },
    ],
    hablemos: "Let's talk",
    referencia: "Allies",
    pedido: "Request sent",
  },
  faro: {
    titulo: "How the FARO of your plan works",
    borrador: "Draft · to be defined",
    aDefinir: "(to be defined)",
    intro: "Your plan grants FARO to redeem later for what it offers: it is the third FARO door, \"Prepaying services\".",
    reglas: {
      precio: (precio: string, ad: string) => `Fixed price: 1 FARO = ${precio}${ad} at list price.`,
      canje: "It is redeemed only for what exists: in phase 1, community events, visits, workshops and sessions.",
      quema: "It is burned when used and is not refunded in money.",
      vence: (amigo: string, fundador: string, ad: string) =>
        `It expires: ${G.miembro.en}'s after ${amigo} months${ad} from being granted, ${G.fundador.en}'s after ${fundador} months${ad}.`,
      sinVoz:
        "It gives no voice: your voice comes from the lot's FARO, from the work in Take part and from signing on to the manifesto.",
    },
    acredita: {
      amigo: (faro: string, ad: string) => `Every month you are granted ${faro} FARO${ad}.`,
      fundador: (faro: string, ad: string) => `You are granted ${faro} FARO at once${ad}.`,
    },
    reparto: {
      amigo: (servicio: string, faro: string, ad: string) =>
        `Of your fee: ${servicio} for NetX's service · ${faro} in FARO set aside for the common good${ad}.`,
      fundador: (servicio: string, faro: string, ad: string) =>
        `Of your payment: ${servicio} for NetX's service · ${faro} in FARO set aside for the common good${ad}.`,
    },
  },
  comparativa: {
    titulo: "What each plan includes",
    funcion: "Feature",
    incluido: "Included",
    noIncluido: "Not included",
    proximamente: "Coming soon",
    verSellos: "See what each stamp in your passport opens",
  },
  adhesion: {
    antes:
      "To take part in decisions you need a free account and to sign on to the Lighthouse VRN manifesto",
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
    texto: "It's a different path, with different documents and its own numbers. It doesn't depend on any plan: anyone with an account sees the same.",
    enlace: "Go to Invest",
  },
  pedido: {
    motivos: {
      "consulta-lote": { etiqueta: "Inquiry about a lot", destino: "BioPueblo, through NetX as agency" },
      "consulta-lote-vrn": { etiqueta: "Inquiry about a Lighthouse VRN lot", destino: "NetX team" },
      "invitacion-circulo": { etiqueta: "Invitation to the circle", destino: "NetX team" },
      "charla-netx": { etiqueta: "Talk about investing in NetX", destino: "NetX team" },
      aliados: { etiqueta: "Allies request", destino: "NetX team" },
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

export const sumarte = conVocabulario({ es, en });
