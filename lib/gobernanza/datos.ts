// Datos de ejemplo de la gobernanza fractal (fogon-gobernanza-fractal y fogon-gobernanza-holarquia). Los círculos, los
// roles, las personas y el consejo son de EJEMPLO: el reglamento real lo define el diseño legal. Los nombres, los
// propósitos y los "Decide sobre" se pueden cambiar acá sin tocar la spec.
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import { buscarTribuBilingue, listarTribusBilingues } from "@/lib/tribus/datos";
import type { Circulo, Nodo, PersonaDeEjemplo, Proposito, Registro, Rol } from "./tipos";

const b = (es: string, en: string): BilingueConOriginal => ({ es, en });

/** El común (Lighthouse como meta-comunidad): la raíz de la estructura. */
export const COMUN_ID = "lighthouse";

export function nodoComun(): Nodo {
  return { tipo: "comun", id: COMUN_ID, nombre: "Lighthouse" };
}

type Def = { nombre: BilingueConOriginal; proposito: Proposito; decide: BilingueConOriginal[] };
const d = (nombre: BilingueConOriginal, proposito: Proposito, ...decide: BilingueConOriginal[]): Def => ({
  nombre,
  proposito,
  decide,
});

/** Círculos de ejemplo de las tribus activas o en formación (Avelan Kerum sale de sus áreas, ver `circulosDe`). */
const CIRCULOS_POR_TRIBU: Record<string, Def[]> = {
  semilla: [
    d(b("Banco de semillas", "Seed bank"), "tierra", b("Semillas locales", "Local seeds"), b("Intercambio de semillas", "Seed exchange")),
    d(b("Huerta intensiva", "Intensive garden"), "tierra", b("Cultivos de la huerta", "Garden crops"), b("Riego de la huerta", "Garden irrigation")),
    d(b("Compost", "Compost"), "tierra", b("Compostaje", "Composting"), b("Residuos orgánicos", "Organic waste")),
  ],
  barda: [
    d(b("Olivos y aceite", "Olives and oil"), "economia", b("Cosecha de olivos", "Olive harvest"), b("Venta del aceite", "Oil sales")),
    d(b("Vid y bodega", "Vines and winery"), "economia", b("Cosecha de uva", "Grape harvest"), b("Bodega", "Winery")),
  ],
  monte: [
    d(b("Forestación", "Forestry"), "tierra", b("Especies a plantar", "Species to plant"), b("Cortinas forestales", "Windbreaks")),
    d(b("Bioconstrucción", "Natural building"), "conocimiento", b("Técnicas de obra", "Building techniques"), b("Capacitaciones", "Training")),
  ],
  agua: [
    d(b("Toma y cisterna", "Intake and cistern"), "agua", b("Toma de agua", "Water intake"), b("Cisternas de la tribu", "Tribe cisterns")),
    d(b("Tratamiento de aguas", "Water treatment"), "agua", b("Aguas grises", "Greywater"), b("Humedales filtrantes", "Filter wetlands")),
  ],
  valle: [
    d(b("Cuidado de la tierra", "Land care"), "tierra", b("Calendario de siembra", "Sowing calendar"), b("Manejo del suelo", "Soil management")),
    d(b("Arquitectura", "Architecture"), "conocimiento", b("Diseño de viviendas", "Housing design"), b("Normas de obra", "Building rules")),
    d(b("Comunicación", "Communications"), "comunidad", b("Boletín de la tribu", "Tribe newsletter"), b("Bienvenida a quien llega", "Welcoming newcomers")),
    d(b("Energía solar", "Solar energy"), "economia", b("Instalaciones solares", "Solar installations"), b("Mantenimiento de bombas", "Pump maintenance")),
  ],
  taller: [
    d(b("Herrería", "Blacksmithing"), "economia", b("Herramientas del territorio", "Territory tools"), b("Pedidos de trabajo", "Work orders")),
    d(b("Carpintería", "Carpentry"), "economia", b("Maderas y muebles", "Wood and furniture"), b("Pedidos de trabajo", "Work orders")),
    d(b("Reparación", "Repair"), "comunidad", b("Taller de reparación abierto", "Open repair workshop"), b("Préstamo de herramientas", "Tool lending")),
  ],
  puerto: [
    d(b("Hospedaje", "Lodging"), "comunidad", b("Camas y turnos", "Beds and shifts"), b("Reglas de convivencia", "House rules")),
    d(b("Mercado", "Market"), "economia", b("Puestos del mercado", "Market stalls"), b("Precios de referencia", "Reference prices")),
    d(b("Eventos", "Events"), "comunidad", b("Calendario de eventos", "Event calendar"), b("Uso de los espacios", "Use of the spaces")),
  ],
};

/** Propósito y "Decide sobre" de cada área de Avelan Kerum (el nombre sale de las `areas` de la tribu, en el mismo orden). */
const AREAS_AVELAN: { proposito: Proposito; decide: BilingueConOriginal[] }[] = [
  { proposito: "tierra", decide: [b("Alimentación de la tribu", "Tribe food")] },
  { proposito: "conocimiento", decide: [b("Propuestas educativas", "Educational proposals")] },
  { proposito: "comunidad", decide: [b("Prácticas de sanación", "Healing practices")] },
  { proposito: "economia", decide: [b("Fuentes de energía", "Energy sources")] },
  { proposito: "economia", decide: [b("Trueque y moneda propia", "Barter and own currency")] },
  { proposito: "gobierno", decide: [b("Acuerdos de la tribu", "Tribe agreements")] },
  { proposito: "comunidad", decide: [b("Cuidado de las personas", "Care of people")] },
  { proposito: "comunidad", decide: [b("Comunicación interna", "Internal communication")] },
  { proposito: "conocimiento", decide: [b("Herramientas digitales", "Digital tools")] },
  { proposito: "comunidad", decide: [b("Encuentros de la tribu", "Tribe gatherings")] },
];

const delComun = (id: string, x: Def): Circulo => ({
  id: `comun-${id}`,
  nombre: x.nombre,
  tribus: [],
  proposito: x.proposito,
  decide: x.decide,
});

/** Los círculos del común (de ejemplo, del boceto aprobado). Su id lleva prefijo `comun-` para no chocar con una tribu. */
export const CIRCULOS_DEL_COMUN: Circulo[] = [
  delComun("permacultura", d(b("Permacultura y suelo", "Permaculture and soil"), "tierra", b("Diseño del paisaje", "Landscape design"), b("Suelo y compost del común", "Soil and compost of the commons"))),
  delComun("agua", d(b("Agua del Lighthouse", "Lighthouse water"), "agua", b("Cuenca y riego", "Watershed and irrigation"), b("Cisternas compartidas", "Shared cisterns"))),
  delComun("legal", d(b("Legal y fideicomiso", "Legal and trust"), "gobierno", b("Estatuto", "Bylaws"), b("Contratos con las series", "Contracts with the series"))),
  delComun("token", d(b("Tokenomics y Semillas", "Tokenomics and Seeds"), "economia", b("Emisión de Semillas", "Seed issuance"), b("Parámetros del Juego B", "Game B parameters"))),
  delComun("marketing", d(b("Comunicación y marketing", "Communications and marketing"), "comunidad", b("Relato público", "Public story"), b("Bienvenida a quien llega", "Welcoming newcomers"))),
  delComun("cuidado", d(b("Cuidado y conflictos", "Care and conflicts"), "comunidad", b("Acuerdos de convivencia", "Coexistence agreements"), b("Mediación", "Mediation"))),
  delComun("plataforma", d(b("Plataforma y datos", "Platform and data"), "conocimiento", b("NetX", "NetX"), b("Privacidad", "Privacy"))),
  // Mismo id y mismos datos que define `manifiesto-lighthouse-vrn` (design §6): si ese cambio entra después, no lo duplica.
  delComun("contratistas", d(b("Gestión de contratistas", "Contractor management"), "economia", b("Convocatorias y contratos de obra", "Calls and contracts for works"), b("Seguimiento de entregas", "Follow-up of deliveries"))),
];

/** Lo que decide el común, el consejo y cada tribu (ejemplo). Una tribu que busca tribu no decide nada todavía. */
export const DECIDE_COMUN: BilingueConOriginal[] = [
  b("Fondo común", "Common fund"),
  b("Reglas del territorio", "Rules of the territory"),
  b("Validar tribus", "Validating tribes"),
];
export const DECIDE_CONSEJO: BilingueConOriginal[] = [
  b("Pedidos al fondo común", "Requests to the common fund"),
  b("Lo que ninguna tribu decide sola", "What no tribe decides alone"),
];
export const DECIDE_TRIBU: BilingueConOriginal[] = [
  b("Su barrio", "Its neighborhood"),
  b("Quién entra a la tribu", "Who joins the tribe"),
  b("Su manifiesto", "Its manifesto"),
];

/** Círculos transversales de ejemplo: cuelgan del común y muestran qué tribus participan. Sin zona asignada. */
const TRANSVERSALES: Circulo[] = [
  {
    id: "comunicacion-comun",
    nombre: b("Comunicación del común", "Communications of the commons"),
    tribus: ["valle", "taller"],
    proposito: "comunidad",
    decide: [b("Mensajes entre tribus", "Messages between tribes"), b("Agenda compartida", "Shared calendar")],
  },
];

/** Los círculos de una tribu en un solo idioma. Las tribus que buscan tribu (vacantes) no tienen. */
export function circulosDe(tribuId: string): Circulo[] {
  const t = buscarTribuBilingue(tribuId);
  if (!t || t.estado === "vacante") return [];
  if (t.areas) {
    return t.areas.map((a, i) => ({
      id: `${tribuId}-area-${i}`,
      nombre: a,
      tribus: [tribuId],
      proposito: AREAS_AVELAN[i]?.proposito,
      decide: AREAS_AVELAN[i]?.decide,
    }));
  }
  return (CIRCULOS_POR_TRIBU[tribuId] ?? []).map((x, i) => ({
    id: `${tribuId}-${i}`,
    nombre: x.nombre,
    tribus: [tribuId],
    proposito: x.proposito,
    decide: x.decide,
  }));
}

export function circulosTransversales(): Circulo[] {
  return TRANSVERSALES;
}

/** Todos los círculos de ejemplo, de una tribu y transversales (sin los del común). */
export function todosLosCirculos(): Circulo[] {
  return [...listarTribusBilingues().flatMap((t) => circulosDe(t.id)), ...TRANSVERSALES];
}

/** Del que cuelga un círculo: de su tribu si tiene una sola; si no, del común. */
export function padreDe(c: Circulo): string {
  return c.tribus.length === 1 ? c.tribus[0] : COMUN_ID;
}

/** El círculo como nodo de la estructura, con su nombre en el idioma pedido. */
export function nodoDe(c: Circulo, idioma: Idioma): Nodo {
  return { tipo: "circulo", id: c.id, nombre: textoEn(c.nombre, idioma), padreId: padreDe(c) };
}

// ---------------------------------------------------------------------------------------------------------------
// Personas y roles de ejemplo. Todo es de ejemplo: ninguna persona es real.

/** La persona demo: quien mira la página. Su nombre sale del idioma ("Vos" / "You"). */
export const PERSONA_YO: PersonaDeEjemplo = { id: "yo", nombre: b("Vos", "You") };

/** Quienes participan en varios lugares, con id estable. Sus nombres no se reusan como relleno. */
export const PERSONAS_DE_EJEMPLO: readonly PersonaDeEjemplo[] = [
  PERSONA_YO,
  { id: "ana", nombre: b("Ana", "Ana") },
  { id: "bruno", nombre: b("Bruno", "Bruno") },
  { id: "carla", nombre: b("Carla", "Carla") },
  { id: "diego", nombre: b("Diego", "Diego") },
];

export type RolCruzado = { personaId: string; circuloId: string; rol: Rol };

/** Los dos roles de "Vos" (como en el boceto). */
export const ROLES_DE_VOS: readonly RolCruzado[] = [
  { personaId: "yo", circuloId: "comun-permacultura", rol: "miembro" },
  { personaId: "yo", circuloId: "valle-0", rol: "enlace-arriba" },
];

/** Personas con roles en varios círculos y niveles (ejemplo, fijado a mano). */
export const ROLES_CRUZADOS: readonly RolCruzado[] = [
  { personaId: "ana", circuloId: "semilla-1", rol: "facilita" },
  { personaId: "ana", circuloId: "comun-agua", rol: "miembro" },
  { personaId: "bruno", circuloId: "comun-agua", rol: "facilita" },
  { personaId: "bruno", circuloId: "agua-0", rol: "enlace-arriba" },
  { personaId: "bruno", circuloId: "valle-3", rol: "memoria" },
  { personaId: "carla", circuloId: "semilla-0", rol: "enlace-de-arriba" },
  { personaId: "carla", circuloId: "comun-token", rol: "miembro" },
  { personaId: "diego", circuloId: "taller-0", rol: "memoria" },
  { personaId: "diego", circuloId: "monte-1", rol: "miembro" },
];

const NOMBRES_RELLENO = [
  "Eva", "Facu", "Gala", "Hugo", "Inés", "Joaquín", "Kira", "Lautaro", "Mora", "Nico", "Olivia", "Pablo",
  "Quimey", "Rocío", "Santi", "Tina", "Ulises", "Vera", "Wanda", "Ximena", "Yago", "Zoe", "Abril", "Benja",
];
const INICIALES_RELLENO = ["G", "L", "M", "P", "R", "S", "T", "V", "B", "C", "D", "F"];

/** Persona de relleno número `n`: nombre y apellido abreviado únicos, determinísticos y sin repetir con las cruzadas. */
export function personaDeRelleno(n: number): PersonaDeEjemplo {
  const nombre = `${NOMBRES_RELLENO[n % NOMBRES_RELLENO.length]} ${INICIALES_RELLENO[Math.floor(n / NOMBRES_RELLENO.length) % INICIALES_RELLENO.length]}.`;
  return { id: `p${n + 1}`, nombre: { es: nombre, en: nombre } };
}

/** Cuántas personas de relleno distintas se pueden generar sin repetir un nombre. */
export const MAXIMO_RELLENO = NOMBRES_RELLENO.length * INICIALES_RELLENO.length;

/**
 * Registros de ejemplo con los que arranca la estructura: el común valida a las tribus que ya son activas o están en
 * formación. Las que buscan tribu todavía no tienen quién las valide. Dato de ejemplo, no una decisión real.
 */
export function validacionesDeEjemplo(): Registro[] {
  return listarTribusBilingues()
    .filter((t) => t.estado !== "vacante")
    .map((t) => ({
      id: `ejemplo-comun-valida-${t.id}`,
      esquema: "valida-tribu" as const,
      afirma: COMUN_ID,
      sobre: t.id,
      apuntaA: null,
      cuando: "2026-10-23T00:00:00.000Z",
      datos: { ejemplo: "true" },
    }));
}
