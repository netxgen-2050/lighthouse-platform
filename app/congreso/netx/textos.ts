// Textos fijos de las piezas de NetX en /congreso, en español (voseo, decisión de Gus del 14-oct-2026) y en inglés.
// TypeScript obliga a que el inglés tenga todas las claves del español. Un solo lugar para cambiarlos cuando se sepa
// quién cobra el ticket (pregunta abierta para Gabriel).
import type { Idioma } from "@/lib/congreso/idioma";

const ES = {
  cinta: {
    aviso: "Prototipo interno · datos de ejemplo",
    boton: "¿Qué viene de UnityHub?",
  },

  /** "Viene de UnityHub · agenda" (marca de origen de cada sección). */
  fuente: {
    viene: "Viene de",
    detalles: {
      fichaEvento: "ficha del evento",
      descripcion: "descripción",
      agenda: "agenda",
      speakers: "speakers",
      temas: "temas",
      mapa: "mapa del territorio",
      tribus: "tribus",
      tickets: "tickets y Stripe",
      ticketVinculado: "ticket vinculado y presencia",
      faq: "FAQ",
    },
    sinTraducir: "Parte de esta sección solo está disponible en español.",
  },

  /** Diálogo de demostración de la compra. NO dice quién cobra: ni UnityHub, ni Stripe, ni NetX. */
  dialogoCompra: {
    titulo: "Acá se abriría la compra del ticket",
    texto:
      "En la versión real, este botón abriría la compra del pase elegido. Al terminar, te llegaría un email con tu entrada y su código.",
    prototipo: "Prototipo: no se cobra nada ni se abre otra página.",
    cerrar: "Entendido",
  },

  dialogoPaginaOficial: {
    titulo: "Acá se abriría la página oficial del evento",
    texto: "En la versión real, este botón te llevaría a la página oficial del evento.",
    prototipo: "Prototipo: no se abre otra página.",
    cerrar: "Entendido",
  },

  territorio: {
    titulo: "Un valle que aprende a guardar el agua",
    cuerpo:
      "Estepa semiárida donde la lluvia de cada temporada todavía corre y se lleva el suelo. Devolverle el agua a la tierra es la primera tarea del pueblo, y la primera lección del Gathering.",
    alternativa: "Ilustración del valle: el Río Negro atraviesa la estepa y el Lighthouse está en su orilla",
    boton: "Explorar el mapa en NetX",
    superficie: "de superficie",
    barrios: "barrios con tribu",
    sinDato: "sin dato",
  },

  tribus: {
    titulo: "No vengas solo. Llegá con tu tribu.",
    bajada:
      "Las tribus son los grupos que se forman en NetX para vivir y construir juntos. Si llegan juntas, tienen precio especial y su primera minga en el territorio.",
    encontrar: "Encontrar mi tribu",
    precio: "Precio de tribu",
    lista: "Tribus con tickets vinculados (ejemplo)",
    ejemplo: "ejemplo",
    van: (n: number, m: number) => `${n} de ${m} van`,
    estado: { activa: "Activa", formacion: "En formación", vacante: "Busca tribu" },
  },

  ticket: {
    titulo: "Tu ticket también abre la puerta a NetX",
    bajada:
      "Cada día que estés en el territorio queda registrado. La primera vez, recibís el sello Genesis: la prueba de que estuviste en el comienzo.",
    loHace: "Lo hace ",
    pasos: [
      { id: "compra", titulo: "Comprás tu entrada", texto: "En la página de entradas del evento.", quien: "UnityHub" },
      { id: "email", titulo: "Te llega el email con tu QR", texto: "Con tu entrada, el código y el calendario.", quien: "UnityHub" },
      { id: "vinculo", titulo: "Vinculás tu ticket", texto: "Con el código que te llegó por email.", quien: "NetX" },
      { id: "escaneo", titulo: "Te escanean al llegar", texto: "Cada día, en la entrada del territorio.", quien: "UnityHub" },
      { id: "presencia", titulo: "Sumás tu presencia", texto: "Días en el territorio y sello Genesis en tu pasaporte.", quien: "NetX" },
    ],
    llamado: {
      titulo: "¿Ya tenés tu entrada?",
      texto: "Para vincular tu ticket a tu perfil necesitás una cuenta gratis.",
      sumate: "Sumate gratis para vincular tu ticket",
      politica: "Aceptá la política de privacidad para vincular tu ticket",
    },
    genesis: {
      titulo: "Sello Genesis",
      sinTicket: "Se activa con tu primer check-in en el territorio.",
      conTicket: "Pendiente del primer check-in",
      presencia: "La presencia da acceso y voz, no se compra ni se transfiere.",
      sello: "GENESIS 2027",
    },
  },

  paginaOficial: { boton: "Página oficial del evento" },

  /** Anclas de la barra del evento. */
  anclas: {
    encuentro: "El encuentro",
    recorrido: "Recorrido",
    voces: "Voces",
    territorio: "El territorio",
    tribus: "Tribus",
    preguntas: "Preguntas",
  },

  /** Título y descripción de la página (metadata). */
  pagina: {
    sufijoTitulo: "Congreso",
    descripcion: "El Congreso de febrero de 2027 en el Lighthouse: recorrido, voces, entradas y cómo llegar con tu tribu.",
  },
};

type ProfundoTexto<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : T extends readonly (infer U)[]
      ? ProfundoTexto<U>[]
      : { [K in keyof T]: ProfundoTexto<T[K]> };

export type TextosNetx = ProfundoTexto<typeof ES>;

const EN: TextosNetx = {
  cinta: {
    aviso: "Internal prototype · sample data",
    boton: "What comes from UnityHub?",
  },

  fuente: {
    viene: "From",
    detalles: {
      fichaEvento: "event page",
      descripcion: "description",
      agenda: "schedule",
      speakers: "speakers",
      temas: "themes",
      mapa: "territory map",
      tribus: "tribes",
      tickets: "tickets and Stripe",
      ticketVinculado: "linked ticket and presence",
      faq: "FAQ",
    },
    sinTraducir: "Part of this section is only available in Spanish.",
  },

  dialogoCompra: {
    titulo: "Here you would buy your ticket",
    texto:
      "In the real version, this button would open the purchase of the selected pass. Once done, you would get an email with your ticket and its code.",
    prototipo: "Prototype: nothing is charged and no other page opens.",
    cerrar: "Got it",
  },

  dialogoPaginaOficial: {
    titulo: "Here the event's official page would open",
    texto: "In the real version, this button would take you to the event's official page.",
    prototipo: "Prototype: no other page opens.",
    cerrar: "Got it",
  },

  territorio: {
    titulo: "A valley learning to hold its water",
    cuerpo:
      "Semi-arid steppe where each season's rain still runs off and carries the soil away. Giving water back to the land is the village's first task, and the Gathering's first lesson.",
    alternativa: "Illustration of the valley: the Río Negro crosses the steppe and the Lighthouse sits on its bank",
    boton: "Explore the map in NetX (in Spanish)",
    superficie: "of surface area",
    barrios: "neighborhoods with a tribe",
    sinDato: "no data",
  },

  tribus: {
    titulo: "Don't come alone. Arrive with your tribe.",
    bajada:
      "Tribes are the groups formed in NetX to live and build together. If they arrive together, they get a special price and their first minga (community work day) in the territory.",
    encontrar: "Find my tribe (in Spanish)",
    precio: "Tribe price",
    lista: "Tribes with linked tickets (sample)",
    ejemplo: "sample",
    van: (n: number, m: number) => `${n} of ${m} are going`,
    estado: { activa: "Active", formacion: "Forming", vacante: "Looking for a tribe" },
  },

  ticket: {
    titulo: "Your ticket also opens the door to NetX",
    bajada:
      "Every day you spend in the territory is recorded. The first time, you get the Genesis seal: proof that you were there at the beginning.",
    loHace: "Done by ",
    pasos: [
      { id: "compra", titulo: "Buy your ticket", texto: "On the event's ticket page.", quien: "UnityHub" },
      { id: "email", titulo: "You get an email with your QR", texto: "With your ticket, the code and the calendar.", quien: "UnityHub" },
      { id: "vinculo", titulo: "Link your ticket", texto: "With the code from your email.", quien: "NetX" },
      { id: "escaneo", titulo: "You get scanned on arrival", texto: "Every day, at the territory's entrance.", quien: "UnityHub" },
      { id: "presencia", titulo: "Add your presence", texto: "Days in the territory and the Genesis seal in your passport.", quien: "NetX" },
    ],
    llamado: {
      titulo: "Already have your ticket?",
      texto: "To link your ticket to your profile you need a free account.",
      sumate: "Join for free to link your ticket (sign-up is in Spanish for now)",
      politica: "Accept the privacy policy to link your ticket (in Spanish)",
    },
    genesis: {
      titulo: "Genesis seal",
      sinTicket: "Unlocked with your first check-in at the territory.",
      conTicket: "Pending first check-in",
      presencia: "Presence gives access and a voice; it is not bought or transferred.",
      sello: "GENESIS 2027",
    },
  },

  paginaOficial: { boton: "Official event page" },

  anclas: {
    encuentro: "The gathering",
    recorrido: "Itinerary",
    voces: "Voices",
    territorio: "The territory",
    tribus: "Tribes",
    preguntas: "Questions",
  },

  pagina: {
    sufijoTitulo: "Congress",
    descripcion: "The February 2027 Congress at the Lighthouse: itinerary, voices, tickets and how to arrive with your tribe.",
  },
};

export const TEXTOS_NETX: Record<Idioma, TextosNetx> = { es: ES, en: EN };

export function textosNetx(idioma: Idioma = "es"): TextosNetx {
  return TEXTOS_NETX[idioma];
}

/** Todos los textos fijos de un idioma, para los tests de voseo y de completitud. */
export function todosLosTextos(idioma: Idioma = "es"): string[] {
  const salida: string[] = [];
  const recorrer = (v: unknown) => {
    if (typeof v === "string") salida.push(v);
    else if (Array.isArray(v)) v.forEach(recorrer);
    else if (v && typeof v === "object") Object.values(v).forEach(recorrer);
  };
  recorrer(TEXTOS_NETX[idioma]);
  return salida;
}
