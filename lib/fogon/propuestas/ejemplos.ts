// Propuestas de ejemplo (design §8). Cinco propuestas sobre decisiones que ya existen en `lib/fogon/datos.ts`, con personas
// de ejemplo marcadas "(ejemplo)". Son datos de prueba: los registros son solo de personas (nunca de Hifa ni del Guardián).
// El monto y la fuente de la plata NO se copian acá: salen de la decisión. Las fechas son de fines de octubre de 2026.
import { COMUN_ID } from "@/lib/gobernanza/datos";
import type { Bi, NivelImplicacion, PersonaEjemplo, Propuesta, Registro, TipoRegistro } from "./tipos";

const b = (es: string, en: string): Bi => ({ es, en });
const persona = (id: string, es: string, en: string): PersonaEjemplo => ({ id, nombre: b(`${es} (ejemplo)`, `${en} (example)`) });

export const LAUTARO = persona("lautaro", "Lautaro", "Lautaro");
export const MORA = persona("mora", "Mora", "Mora");
export const INES = persona("ines", "Inés", "Inés");
export const RAMIRO = persona("ramiro", "Ramiro", "Ramiro");
export const PAZ = persona("paz", "Paz", "Paz");
export const GALA = persona("gala", "Gala", "Gala");
export const NICO = persona("nico", "Nico", "Nico");
export const EMA = persona("ema", "Ema", "Ema");
export const DANI = persona("dani", "Dani", "Dani");
export const TOMAS = persona("tomas", "Tomás", "Tomás");

const TODAS = [LAUTARO, MORA, INES, RAMIRO, PAZ, GALA, NICO, EMA, DANI, TOMAS];

/** Las siete personas de ejemplo que el board de NetXGen definió como ámbito del consejo (G1). "vos" no está. */
export const AMBITO_CONSEJO_DE_EJEMPLO: readonly string[] = ["mora", "ines", "ramiro", "paz", "gala", "nico", "dani"];

type Extra = {
  apuntaA?: string;
  texto?: Bi;
  principio?: Registro["principio"];
  datos?: Registro["datos"];
};

/** Un registro de ejemplo. El id lo arma `<propuesta>:<n>` salvo que se pida uno (para apuntarlo desde otro). */
function reg(
  propuestaId: string,
  id: string,
  tipo: TipoRegistro,
  quien: string,
  nivel: NivelImplicacion,
  cuando: string,
  extra: Extra = {},
): Registro {
  return { id, propuestaId, version: 1, quien, nivel, cuando: `${cuando}:00Z`, tipo, simulado: true, ...extra };
}
const fase = (pid: string, id: string, quien: string, cuando: string, f: string): Registro =>
  reg(pid, id, "fase", quien, "proceso", cuando, { datos: { fase: f } });

// ---- Pedido de Valle Solar al Fondo Común para la bomba solar (consejo) ----
const B = "consejo-bomba";
const bomba: Propuesta = {
  decisionId: B,
  recorrido: "importante",
  holonId: "consejo",
  presenta: { personaId: "lautaro", desde: b("Cuidado de la tierra · Valle Solar", "Land Care · Valle Solar") },
  problema: b(
    "La huerta de Valle Solar riega a mano con baldes y mangueras y en verano no alcanza: se pierde parte de la cosecha.",
    "The Valle Solar garden is watered by hand with buckets and hoses and in summer it is not enough: part of the harvest is lost.",
  ),
  propone: b(
    "Comprar una bomba solar con plata del Fondo Común y compartir su uso entre los círculos con turnos de riego.",
    "Buy a solar pump with Common Fund money and share its use among the circles with watering shifts.",
  ),
  inicio: "2026-10-26",
  principios: ["agua-viva", "recursos-con-medida", "plata-vuelve-a-la-tierra"],
  tamanoAmbito: null,
  ambitoConsejo: { personas: [...AMBITO_CONSEJO_DE_EJEMPLO] },
  plata: { pide: true },
  personas: TODAS,
  registros: [
    fase(B, "b-f1", "nico", "2026-10-26T09:00", "presentacion"),
    fase(B, "b-f2", "nico", "2026-10-26T10:00", "preguntas"),
    reg(B, "b-urg", "urgencia", "lautaro", "presenta", "2026-10-26T11:00", {
      datos: {
        criterio: "plazo-externo",
        pierde: "Si se espera al verano, la huerta de Valle Solar se queda sin riego en enero",
        fechaLimite: "2026-12-15",
        porQueReversible: "La bomba se puede apagar y el riego vuelve a los turnos de hoy",
        destinoPlata: "revender",
        queSeCompra: "una bomba solar",
      },
    }),
    reg(B, "b-resp1", "respaldo-urgencia", "mora", "ambito", "2026-10-26T12:00", { apuntaA: "b-urg" }),
    reg(B, "b-preg", "pregunta", "mora", "ambito", "2026-10-26T13:00", {
      texto: b("¿Cuántas horas por día funcionaría la bomba?", "How many hours a day would the pump run?"),
    }),
    reg(B, "b-resp", "respuesta", "lautaro", "presenta", "2026-10-26T18:00", {
      apuntaA: "b-preg",
      texto: b("Unas cuatro horas, a la mañana temprano, con el sol.", "About four hours, early in the morning, with the sun."),
    }),
    fase(B, "b-f3", "nico", "2026-10-28T09:00", "discusion"),
    reg(B, "b-com", "comentario", "ines", "ambito", "2026-10-28T11:00", {
      texto: b("Me parece bien que el riego deje de depender de los baldes.", "I like that watering no longer depends on buckets."),
    }),
    fase(B, "b-f4", "nico", "2026-10-28T15:00", "concerns"),
    reg(B, "b-c-ramiro", "concern", "ramiro", "ambito", "2026-10-28T16:00", {
      principio: "agua-viva",
      texto: b(
        "Si todo el riego sale de la misma bomba, los círculos más lejanos se quedan sin agua en los días de calor.",
        "If all the watering comes from the same pump, the farthest circles run out of water on hot days.",
      ),
    }),
    reg(B, "b-c-paz", "concern", "paz", "ambito", "2026-10-28T17:00", {
      principio: "voz-afectada",
      texto: b(
        "Los días de riego se repartirían sin hablar con quienes riegan a la tarde.",
        "Watering days would be shared out without talking to the people who water in the afternoon.",
      ),
    }),
    reg(B, "b-agr1", "agrupar", "nico", "proceso", "2026-10-29T09:00", {
      apuntaA: "b-c-ramiro",
      datos: { accion: "agrupar", grupoId: "g-uso", nombre: "Uso compartido" },
    }),
    reg(B, "b-agr2", "agrupar", "nico", "proceso", "2026-10-29T09:01", {
      apuntaA: "b-c-paz",
      datos: { accion: "agrupar", grupoId: "g-uso", nombre: "Uso compartido" },
    }),
    reg(B, "b-c-ines", "concern", "ines", "ambito", "2026-10-29T10:00", {
      apuntaA: "b-g-impacto",
      principio: "agua-viva",
      texto: b(
        "Coincido con la sugerencia: antes de aprobar quiero saber cuánta agua de la napa se va a usar en verano.",
        "I agree with the suggestion: before approving I want to know how much groundwater will be used in summer.",
      ),
    }),
    fase(B, "b-f5", "nico", "2026-10-29T11:00", "resolver"),
    reg(B, "b-res-gala", "resolucion", "gala", "ambito", "2026-10-29T12:00", {
      texto: b(
        "Turnos de riego: cada círculo tiene dos mañanas por semana y la bomba se apaga si la napa baja de un nivel acordado.",
        "Watering shifts: each circle gets two mornings a week and the pump is switched off if the water table drops below an agreed level.",
      ),
    }),
    reg(B, "b-mec", "mecanismo", "ramiro", "ambito", "2026-10-29T13:00", {
      apuntaA: "b-res-gala",
      datos: { mecanismo: "cuadratico", fin: "Repartir los días de riego entre los círculos" },
    }),
  ],
  guion: {
    hifa: {
      resumen: b(
        "Hay una pregunta respondida, un grupo de concerns sobre el uso compartido y una contrapropuesta de turnos. Falta resolver el concern de Inés sobre la napa.",
        "One question has been answered, there is a group of concerns about shared use and a counter-proposal with shifts. Inés's concern about the water table is still open.",
      ),
      agrupaciones: [],
    },
    guardian: [
      {
        id: "b-g-impacto",
        fase: "concerns",
        tipo: "posible-impacto",
        principio: "agua-viva",
        texto: b(
          "Bombear más en verano podría bajar la napa y afectar a las vecinas de la zona baja. ¿Se midió cuánta agua se puede sacar sin dañarla?",
          "Pumping more in summer could lower the water table and affect the neighbors in the lower area. Was it measured how much water can be taken without harming it?",
        ),
      },
      {
        id: "b-g-reversible",
        fase: "discusion",
        tipo: "posible-no-reversible",
        urgencia: "b-urg",
        texto: b(
          "Si se apaga la bomba, revenderla podría recuperar solo una parte de la plata del Fondo Común. ¿La medida es tan reversible como se dice?",
          "If the pump is switched off, reselling it might recover only part of the Common Fund money. Is the measure as reversible as it is said to be?",
        ),
      },
    ],
  },
};

// ---- Parámetros de la regalía de regeneración (el común) ----
const R = "regalia";
const regalia: Propuesta = {
  decisionId: R,
  recorrido: "importante",
  holonId: COMUN_ID,
  presenta: { personaId: "mora", desde: b("Tokenomics y Semillas", "Tokenomics and Semillas") },
  problema: b(
    "Hoy no hay una regla clara de cuánto de lo que se produce en el territorio vuelve a regenerarlo.",
    "Today there is no clear rule on how much of what is produced in the territory goes back into regenerating it.",
  ),
  propone: b(
    "Fijar los parámetros de la regalía de regeneración que se apoyan en el pacto de regalía regenerativa.",
    "Set the parameters of the regeneration royalty that rely on the regenerative royalty pact.",
  ),
  inicio: "2026-10-27",
  principios: ["plata-vuelve-a-la-tierra", "generaciones-futuras"],
  tamanoAmbito: 40,
  plata: { pide: false },
  personas: TODAS,
  registros: [
    fase(R, "r-f1", "nico", "2026-10-27T09:00", "presentacion"),
    fase(R, "r-f2", "nico", "2026-10-27T10:00", "preguntas"),
    reg(R, "r-preg", "pregunta", "ramiro", "comun", "2026-10-27T15:00", {
      texto: b("¿La regalía se calcula sobre lo producido o sobre lo vendido?", "Is the royalty calculated on what is produced or on what is sold?"),
    }),
    fase(R, "r-f3", "nico", "2026-10-29T09:00", "discusion"),
    reg(R, "r-com", "comentario", "gala", "comun", "2026-10-29T10:00", {
      texto: b("Sería bueno que el primer año sea de prueba.", "It would be good for the first year to be a trial."),
    }),
  ],
  guion: {
    hifa: {
      resumen: b(
        "La propuesta está en discusión abierta. Hay una pregunta sin responder y un comentario.",
        "The proposal is in open discussion. There is one unanswered question and one comment.",
      ),
      agrupaciones: [],
    },
    guardian: [],
  },
};

// ---- Calendario de siembra de otoño (Valle Solar, cerrada por consenso) ----
const S = "siembra";
const siembra: Propuesta = {
  decisionId: S,
  recorrido: "importante",
  holonId: "valle-0",
  presenta: { personaId: "gala", desde: b("Cuidado de la tierra · Valle Solar", "Land Care · Valle Solar") },
  problema: b(
    "Cada huerta siembra cuando le parece y se pisan las semillas y el agua de riego.",
    "Each garden sows when it sees fit and seeds and irrigation water overlap.",
  ),
  propone: b(
    "Un calendario único de siembra de otoño, con una semana de margen entre huertas.",
    "A single autumn sowing calendar, with a week of margin between gardens.",
  ),
  inicio: "2026-10-12",
  principios: ["suelo-vivo", "subsidiariedad"],
  tamanoAmbito: 12,
  plata: { pide: false },
  personas: TODAS,
  registros: [
    fase(S, "s-f1", "nico", "2026-10-12T09:00", "presentacion"),
    fase(S, "s-f2", "nico", "2026-10-12T10:00", "preguntas"),
    reg(S, "s-preg", "pregunta", "mora", "ambito", "2026-10-12T14:00", {
      texto: b("¿Qué pasa si llueve en la semana de siembra?", "What happens if it rains during the sowing week?"),
    }),
    fase(S, "s-f3", "nico", "2026-10-14T09:00", "discusion"),
    reg(S, "s-com1", "comentario", "ines", "ambito", "2026-10-14T11:00", {
      texto: b("La semana de margen ayuda a no competir por el agua.", "The week of margin helps avoid competing for water."),
    }),
    reg(S, "s-com2", "comentario", "ramiro", "ambito", "2026-10-14T12:00", {
      texto: b("Me gusta que sea un calendario y no una regla fija.", "I like that it is a calendar and not a fixed rule."),
    }),
    reg(S, "s-com3", "comentario", "dani", "ambito", "2026-10-14T13:00", {
      texto: b("Lo hablamos con Agua Clara y les parece bien.", "We talked it over with Agua Clara and they are fine with it."),
    }),
    fase(S, "s-f4", "nico", "2026-10-16T09:00", "concerns"),
    fase(S, "s-f5", "nico", "2026-10-17T09:00", "resolver"),
    fase(S, "s-f6", "nico", "2026-10-19T09:00", "llamado"),
    reg(S, "s-acuse", "acuse", "ema", "ambito", "2026-10-19T10:00"),
    reg(S, "s-lado", "a-un-lado", "paz", "ambito", "2026-10-19T11:00", {
      texto: b(
        "Prefiero sembrar una semana más tarde, pero no quiero frenar al grupo.",
        "I would rather sow a week later, but I do not want to hold the group back.",
      ),
    }),
    reg(S, "s-cierre", "cierre", "nico", "proceso", "2026-10-19T12:00", { datos: { resultado: "consenso" } }),
    reg(S, "s-acta", "acta", "tomas", "proceso", "2026-10-19T13:00", {
      texto: b(
        "Se adopta por consenso el calendario de siembra de otoño. Paz se hizo a un lado: prefiere sembrar una semana más tarde.",
        "The autumn sowing calendar is adopted by consensus. Paz stood aside: she prefers to sow a week later.",
      ),
    }),
  ],
  guion: {
    hifa: {
      resumen: b("La propuesta se cerró por consenso con una persona a un lado.", "The proposal closed by consensus with one person standing aside."),
      agrupaciones: [],
    },
    guardian: [],
  },
};

// ---- Cisterna compartida entre Agua Clara y Valle Solar (consejo, en preguntas) ----
const C = "cisterna-compartida";
const cisterna: Propuesta = {
  decisionId: C,
  recorrido: "importante",
  holonId: "consejo",
  presenta: { personaId: "dani", desde: b("Agua del Lighthouse · Agua Clara", "Lighthouse Water · Agua Clara") },
  problema: b(
    "Agua Clara y Valle Solar quieren una cisterna en el mismo lugar y no hay una forma acordada de compartirla.",
    "Agua Clara and Valle Solar both want a cistern in the same place and there is no agreed way of sharing it.",
  ),
  propone: b(
    "Construir una sola cisterna compartida y acordar entre las dos tribus la ubicación y el uso.",
    "Build a single shared cistern and agree between the two tribes on its location and use.",
  ),
  inicio: "2026-10-28",
  tema: "cuidado-conflicto",
  principios: ["agua-viva", "voz-afectada"],
  tamanoAmbito: null,
  ambitoConsejo: { personas: [...AMBITO_CONSEJO_DE_EJEMPLO] },
  plata: { pide: true },
  personas: TODAS,
  registros: [
    fase(C, "c-f1", "nico", "2026-10-28T09:00", "presentacion"),
    fase(C, "c-f2", "nico", "2026-10-28T10:00", "preguntas"),
    reg(C, "c-preg", "pregunta", "mora", "ambito", "2026-10-29T09:00", {
      texto: b("¿Cuántas ubicaciones se están considerando?", "How many locations are being considered?"),
    }),
  ],
  guion: {
    hifa: {
      resumen: b(
        "La propuesta está en preguntas para aclarar. Hay una pregunta sin responder.",
        "The proposal is in clarifying questions. There is one unanswered question.",
      ),
      agrupaciones: [],
      mecanismo: {
        mecanismo: "puntos",
        fin: b("Priorizar entre las tres ubicaciones", "Prioritize among the three locations"),
        porque: b(
          "Hay varias opciones parecidas y conviene ver cuáles prefiere más gente.",
          "There are several similar options and it helps to see which ones more people prefer.",
        ),
      },
    },
    guardian: [
      {
        id: "c-g-previa",
        fase: "preguntas",
        tipo: "posible-ilegitimidad",
        decisionPrevia: "siembra",
        texto: b(
          "Una de las ubicaciones podría usar la parcela que el Calendario de siembra de otoño reservó. ¿Contradice esa decisión?",
          "One of the locations could use the plot that the Autumn sowing calendar set aside. Does it contradict that decision?",
        ),
      },
    ],
  },
};

// ---- Plan de huerta comunitaria 2027 (simple, plazo para objetar) ----
const H = "huerta";
const huerta: Propuesta = {
  decisionId: H,
  recorrido: "simple",
  holonId: null,
  presenta: { personaId: "ema", desde: b("Círculo de Tierra", "Círculo de Tierra") },
  problema: b(
    "No hay un plan para la huerta comunitaria del próximo año y cada quien siembra por su lado.",
    "There is no plan for next year's community garden and everyone sows on their own.",
  ),
  propone: b(
    "Adoptar el plan de huerta comunitaria 2027 con camas compartidas y un turno de cuidado por semana.",
    "Adopt the 2027 community garden plan with shared beds and one care shift per week.",
  ),
  inicio: "2026-10-28",
  principios: ["suelo-vivo", "poder-compartido"],
  tamanoAmbito: 4,
  plata: { pide: false },
  personas: TODAS,
  registros: [
    fase(H, "h-f1", "nico", "2026-10-28T09:00", "objetar"),
    reg(H, "h-a1", "acuse", "mora", "ambito", "2026-10-28T12:00"),
    reg(H, "h-a2", "acuse", "ines", "ambito", "2026-10-28T15:00"),
  ],
  guion: {
    hifa: {
      resumen: b(
        "Nadie objetó todavía. Dos personas firmaron el acuse; falta una para el quórum.",
        "Nobody has objected yet. Two people signed the acknowledgment; one more is needed for the quorum.",
      ),
      agrupaciones: [],
    },
    guardian: [],
  },
};

export const PROPUESTAS_DE_EJEMPLO: readonly Propuesta[] = [bomba, regalia, siembra, cisterna, huerta];

/** La propuesta de ejemplo de una decisión del Fogón; null si no tiene (por ejemplo, las del fideicomiso). */
export function propuestaDe(decisionId: string): Propuesta | null {
  return PROPUESTAS_DE_EJEMPLO.find((p) => p.decisionId === decisionId) ?? null;
}

/** Nombre de una persona de ejemplo en el idioma; null si no es de ejemplo. */
export function personaDeEjemplo(p: Propuesta, id: string): PersonaEjemplo | null {
  return p.personas.find((x) => x.id === id) ?? null;
}
