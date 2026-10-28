// Necesidades de las tribus como tareas con ficha (openspec/changes/tribu-necesidades). Datos de EJEMPLO: se pueden
// ajustar acá sin tocar la spec, salvo los que usan los escenarios. El inglés queda para revisión nativa.
import { circulosDe, circulosTransversales } from "@/lib/gobernanza/datos";
import type { Circulo, Registro } from "@/lib/gobernanza/tipos";
import { buscarRol, type ClaveRol } from "@/lib/pactos/datos";
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import { listarTribusBilingues } from "./datos";

const b = (es: string, en: string): BilingueConOriginal => ({ es, en });

export type TipoNecesidad = "diseno" | "campo";
export type EstadoNecesidad = "abierta" | "tomada" | "hecha";

/** Máximo en horas o en Semillas (entero positivo). Lo fija quien administra el holón. */
export type Tope = { unidad: "horas" | "semillas"; valor: number };
/** Máximo por persona. */
export type TopePorPersona = Tope;
/** Máximo total de la tarea, sumando a todas las personas (decisión de Gus, 28-oct). */
export type TopeTotal = Tope;

export type NecesidadBilingue = {
  /** "<tribu>-<slug>", estable: lo usan el ancla y, después, el pacto puntual. */
  id: string;
  tribuId: string;
  titulo: BilingueConOriginal;
  que: BilingueConOriginal;
  /** Horas aproximadas; null = sin dato. */
  horas: number | null;
  tipo: TipoNecesidad;
  /** "AAAA-MM-DD"; null = sin dato. */
  paraCuando: string | null;
  habilidad: ClaveRol;
  habilidadOtra?: BilingueConOriginal;
  estado: EstadoNecesidad;
  circuloId?: string;
  /** Máximo por persona; null = sin máximo. */
  tope: TopePorPersona | null;
  /** Máximo total de la tarea; null = sin máximo total. */
  topeTotal: TopeTotal | null;
};

export type Necesidad = Omit<NecesidadBilingue, "titulo" | "que" | "habilidadOtra"> & {
  titulo: string;
  que: string;
  habilidadOtra?: string;
};

const N = (x: Omit<NecesidadBilingue, "tope" | "topeTotal"> & Partial<Pick<NecesidadBilingue, "tope" | "topeTotal">>): NecesidadBilingue => ({
  tope: null,
  topeTotal: null,
  ...x,
});

const NECESIDADES: NecesidadBilingue[] = [
  N({
    id: "semilla-riego", tribuId: "semilla", titulo: b("Riego", "Irrigation"),
    que: b("Diseñar el riego por goteo de la huerta intensiva", "Design the drip irrigation for the intensive garden"),
    horas: 20, tipo: "diseno", paraCuando: "2026-12-15", habilidad: "permacultura", estado: "abierta", circuloId: "semilla-1",
  }),
  N({
    id: "barda-riego", tribuId: "barda", titulo: b("Riego", "Irrigation"),
    que: b("Instalar las mangueras de goteo en la hilera nueva de olivos", "Install the drip hoses in the new row of olive trees"),
    horas: 12, tipo: "campo", paraCuando: "2026-11-30", habilidad: "jardineria", estado: "abierta", circuloId: "barda-0",
  }),
  N({
    id: "monte-bioconstruccion", tribuId: "monte", titulo: b("Bioconstrucción", "Natural building"),
    que: b("Levantar el muro de quincha del galpón de herramientas", "Raise the wattle-and-daub wall of the tool shed"),
    horas: 24, tipo: "campo", paraCuando: "2027-01-20", habilidad: "bioconstruccion", estado: "abierta", circuloId: "monte-1",
    topeTotal: { unidad: "horas", valor: 40 },
  }),
  N({
    id: "monte-maquinaria", tribuId: "monte", titulo: b("Maquinaria", "Machinery"),
    que: b("Mover tierra con un tractor prestado para la cortina forestal", "Move earth with a borrowed tractor for the windbreak"),
    horas: 8, tipo: "campo", paraCuando: null, habilidad: "otro", habilidadOtra: b("Manejo de tractor", "Tractor driving"),
    estado: "tomada", circuloId: "monte-0",
  }),
  N({
    id: "agua-plomeria", tribuId: "agua", titulo: b("Plomería", "Plumbing"),
    que: b("Conectar la cisterna nueva con la red del núcleo común", "Connect the new cistern to the shared core network"),
    horas: 16, tipo: "campo", paraCuando: "2026-12-05", habilidad: "otro", habilidadOtra: b("Plomería", "Plumbing"),
    estado: "abierta", circuloId: "agua-0",
    tope: { unidad: "semillas", valor: 60 }, topeTotal: { unidad: "semillas", valor: 150 },
  }),
  N({
    id: "agua-tratamiento", tribuId: "agua", titulo: b("Tratamiento de aguas", "Water treatment"),
    que: b("Diseñar el humedal que trata las aguas grises del barrio", "Design the wetland that treats the neighborhood's greywater"),
    horas: 30, tipo: "diseno", paraCuando: "2027-02-28", habilidad: "permacultura", estado: "abierta", circuloId: "agua-1",
  }),
  N({
    id: "valle-solar", tribuId: "valle", titulo: b("Energía solar", "Solar energy"),
    que: b("Montar dos paneles solares en el techo del salón común", "Mount two solar panels on the roof of the common hall"),
    horas: 10, tipo: "campo", paraCuando: "2026-11-21", habilidad: "otro", habilidadOtra: b("Electricidad", "Electrical work"),
    estado: "abierta", circuloId: "valle-3",
    tope: { unidad: "horas", valor: 10 }, topeTotal: { unidad: "horas", valor: 20 },
  }),
  N({
    id: "valle-bioconstruccion", tribuId: "valle", titulo: b("Bioconstrucción", "Natural building"),
    que: b("Revocar con barro las paredes de la casa 3", "Plaster the walls of house 3 with mud"),
    horas: 16, tipo: "campo", paraCuando: "2026-12-12", habilidad: "bioconstruccion", estado: "hecha", circuloId: "valle-1",
  }),
  N({
    id: "valle-eventos", tribuId: "valle", titulo: b("Eventos y comunidad", "Events and community"),
    que: b("Organizar la jornada de puertas abiertas del barrio", "Organize the neighborhood open-doors day"),
    horas: null, tipo: "campo", paraCuando: "2026-12-19", habilidad: "coordinacion", estado: "abierta", circuloId: "comunicacion-comun",
  }),
  N({
    id: "taller-textil", tribuId: "taller", titulo: b("Textil", "Textiles"),
    que: b("Coser las fundas de los almohadones del salón de reparaciones", "Sew the cushion covers for the repair hall"),
    horas: 6, tipo: "campo", paraCuando: null, habilidad: "otro", habilidadOtra: b("Costura", "Sewing"), estado: "abierta", circuloId: "taller-2",
  }),
  N({
    id: "avelan-alimentos", tribuId: "avelan", titulo: b("Producción de alimentos", "Food production"),
    que: b("Diseñar el plan de huerta del núcleo", "Design the vegetable garden plan for the core"),
    horas: 20, tipo: "diseno", paraCuando: "2027-03-01", habilidad: "permacultura", estado: "abierta", circuloId: "avelan-area-0",
  }),
  N({
    id: "puerto-marketing", tribuId: "puerto", titulo: b("Marketing", "Marketing"),
    que: b("Armar la difusión del mercado mensual", "Set up the promotion of the monthly market"),
    horas: 12, tipo: "diseno", paraCuando: "2026-11-28", habilidad: "comunicacion", estado: "abierta", circuloId: "puerto-1",
  }),
];

export function necesidadesBilingues(): NecesidadBilingue[] {
  return NECESIDADES;
}

export function resolverNecesidad(n: NecesidadBilingue, idioma: Idioma): Necesidad {
  return {
    ...n,
    titulo: textoEn(n.titulo, idioma),
    que: textoEn(n.que, idioma),
    habilidadOtra: n.habilidadOtra && textoEn(n.habilidadOtra, idioma),
  };
}

export function necesidadesDe(tribuId: string, idioma: Idioma = "es"): Necesidad[] {
  return NECESIDADES.filter((n) => n.tribuId === tribuId).map((n) => resolverNecesidad(n, idioma));
}

export function buscarNecesidad(id: string, idioma: Idioma = "es"): Necesidad | undefined {
  const n = NECESIDADES.find((x) => x.id === id);
  return n && resolverNecesidad(n, idioma);
}

function circuloDe(n: Pick<NecesidadBilingue, "tribuId" | "circuloId">): Circulo | undefined {
  if (!n.circuloId) return undefined;
  return [...circulosDe(n.tribuId), ...circulosTransversales()].find((c) => c.id === n.circuloId);
}

/** Nombre del círculo de la necesidad en el idioma pedido, o `undefined` si no tiene. */
export function circuloDeNecesidad(n: Pick<NecesidadBilingue, "tribuId" | "circuloId">, idioma: Idioma = "es"): string | undefined {
  const c = circuloDe(n);
  return c && textoEn(c.nombre, idioma);
}

/** ¿El círculo de la necesidad es transversal (cuelga del común)? */
export function esCirculoTransversal(n: Pick<NecesidadBilingue, "tribuId" | "circuloId">): boolean {
  const c = circuloDe(n);
  return !!c && c.tribus.length !== 1;
}

// --- Holón y aval (D19) ---

export type Holon =
  | { tipo: "circulo"; id: string; transversal: boolean }
  | { tipo: "tribu"; id: string }
  | { tipo: "comun" };

export function holonDe(n: Pick<NecesidadBilingue, "tribuId" | "circuloId">): Holon {
  if (n.circuloId) return { tipo: "circulo", id: n.circuloId, transversal: esCirculoTransversal(n) };
  return { tipo: "tribu", id: n.tribuId };
}

export function idDeHolon(h: Holon): string {
  return h.tipo === "comun" ? "comunidad:lighthouse" : `${h.tipo}:${h.id}`;
}

/**
 * Quién administra y facilita un holón (decisión de Gus, 28-oct). Los círculos transversales los administra y facilita
 * Hifa (la IA): en el prototipo es SIMULADO y EXPERIMENTAL, y si Hifa no está disponible responde el super admin. La
 * decisión definitiva depende de probar que sea estable y fiable. Los demás holones los administran personas.
 */
export type Administrador =
  | { tipo: "personas" }
  | { tipo: "hifa"; experimental: true; respaldo: "super-admin" };

export function administradorDe(h: Holon): Administrador {
  return h.tipo === "circulo" && h.transversal ? { tipo: "hifa", experimental: true, respaldo: "super-admin" } : { tipo: "personas" };
}

export type AvalNecesidad = Omit<Registro, "esquema"> & { esquema: "avala-necesidad" };

const aval = (necesidadId: string, holon: string): AvalNecesidad => ({
  id: `ejemplo-aval-${necesidadId}`,
  esquema: "avala-necesidad",
  afirma: holon,
  sobre: `necesidad:${necesidadId}`,
  apuntaA: null,
  cuando: "2026-10-20T12:00:00.000Z",
  datos: { por: "ejemplo" },
});

export const AVALES_DE_EJEMPLO: readonly AvalNecesidad[] = [
  aval("semilla-riego", "circulo:semilla-1"),
  aval("agua-tratamiento", "circulo:agua-1"),
  aval("avelan-alimentos", "circulo:avelan-area-0"),
];

export function avalDe(
  n: Pick<NecesidadBilingue, "id" | "tribuId" | "circuloId">,
  avales: readonly AvalNecesidad[] = AVALES_DE_EJEMPLO,
): AvalNecesidad | null {
  const holon = idDeHolon(holonDe(n));
  return avales.find((a) => a.sobre === `necesidad:${n.id}` && a.afirma === holon) ?? null;
}

/** Abierta y, si es de diseño, con el aval de su holón. */
export function tomable(
  n: Pick<NecesidadBilingue, "id" | "tribuId" | "circuloId" | "tipo" | "estado">,
  avales: readonly AvalNecesidad[] = AVALES_DE_EJEMPLO,
): boolean {
  return n.estado === "abierta" && (n.tipo === "campo" || avalDe(n, avales) !== null);
}

// --- Máximos ---

export type ResultadoTope = { horasConSemillas: number; horasSinSemillas: number; semillas: number };

/** Máximo por persona. Con máximo en Semillas, las horas con Semillas se redondean hacia abajo (lado prudente). */
export function aplicarTope(horas: number, tope: TopePorPersona | null, valorHora: number): ResultadoTope {
  const todas = Math.round(horas * valorHora);
  let horasCon = horas;
  let semillas = todas;
  if (tope?.unidad === "horas") {
    horasCon = Math.min(horas, tope.valor);
    semillas = Math.round(horasCon * valorHora);
  } else if (tope?.unidad === "semillas") {
    semillas = Math.min(todas, tope.valor);
    horasCon = Math.min(horas, Math.floor(tope.valor / valorHora));
    if (semillas === todas) horasCon = horas;
  }
  return { horasConSemillas: horasCon, horasSinSemillas: horas - horasCon, semillas };
}

export type HorasDePersona = { persona: string; horas: number };
export type ResultadoPersona = ResultadoTope & { persona: string };

/**
 * Máximo por persona y máximo total de la tarea. Las personas se recorren en el orden en que se verificaron sus horas:
 * primero se aplica el máximo de cada una y después lo que queda del total. Lo que supera el total no genera Semillas.
 */
export function repartirConTopeTotal(
  personas: readonly HorasDePersona[],
  tope: TopePorPersona | null,
  topeTotal: TopeTotal | null,
  valorHora: number,
): { personas: ResultadoPersona[]; horasConSemillas: number; semillas: number } {
  let resto = topeTotal ? topeTotal.valor : Infinity;
  const salida: ResultadoPersona[] = [];
  for (const p of personas) {
    const r = aplicarTope(p.horas, tope, valorHora);
    let { horasConSemillas, semillas } = r;
    if (topeTotal?.unidad === "horas" && horasConSemillas > resto) {
      horasConSemillas = Math.max(0, resto);
      semillas = Math.min(semillas, Math.round(horasConSemillas * valorHora));
    } else if (topeTotal?.unidad === "semillas" && semillas > resto) {
      semillas = Math.max(0, resto);
      horasConSemillas = Math.min(horasConSemillas, Math.floor(semillas / valorHora));
    }
    resto -= topeTotal?.unidad === "horas" ? horasConSemillas : topeTotal?.unidad === "semillas" ? semillas : 0;
    salida.push({ persona: p.persona, horasConSemillas, horasSinSemillas: p.horas - horasConSemillas, semillas });
  }
  return {
    personas: salida,
    horasConSemillas: salida.reduce((s, x) => s + x.horasConSemillas, 0),
    semillas: salida.reduce((s, x) => s + x.semillas, 0),
  };
}

// --- Validación ---

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const entero = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n > 0;

export function validarNecesidades(
  lista: readonly NecesidadBilingue[] = NECESIDADES,
  avales: readonly AvalNecesidad[] = AVALES_DE_EJEMPLO,
): string[] {
  const errores: string[] = [];
  const ids = new Set<string>();
  for (const n of lista) {
    if (ids.has(n.id)) errores.push(`${n.id}: id repetido`);
    ids.add(n.id);
    if (n.horas !== null && !entero(n.horas)) errores.push(`${n.id}: horas inválidas`);
    if (n.paraCuando !== null && (!FECHA.test(n.paraCuando) || Number.isNaN(Date.parse(n.paraCuando))))
      errores.push(`${n.id}: fecha inválida`);
    if (!buscarRol(n.habilidad)) errores.push(`${n.id}: habilidad desconocida`);
    if ((n.habilidad === "otro") !== (n.habilidadOtra !== undefined)) errores.push(`${n.id}: habilidadOtra solo con "otro"`);
    if (n.circuloId) {
      const c = circuloDe(n);
      if (!c) errores.push(`${n.id}: el círculo ${n.circuloId} no es de la tribu ni transversal con ella`);
      else if (c.tribus.length !== 1 && !c.tribus.includes(n.tribuId)) errores.push(`${n.id}: el círculo transversal no incluye a la tribu`);
    }
    if (n.tope && !entero(n.tope.valor)) errores.push(`${n.id}: máximo por persona inválido`);
    if (n.topeTotal && !entero(n.topeTotal.valor)) errores.push(`${n.id}: máximo total inválido`);
    if (n.tope && n.topeTotal && n.tope.unidad === n.topeTotal.unidad && n.tope.valor > n.topeTotal.valor)
      errores.push(`${n.id}: el máximo por persona supera el total`);
    if (n.tipo === "diseno" && n.estado !== "abierta" && !avalDe(n, avales)) errores.push(`${n.id}: de diseño ${n.estado} sin aval`);
  }
  for (const a of avales) {
    const id = a.sobre.replace(/^necesidad:/, "");
    const n = lista.find((x) => x.id === id);
    if (!n) errores.push(`${a.id}: aval de una necesidad que no existe`);
    else if (a.afirma !== idDeHolon(holonDe(n))) errores.push(`${a.id}: afirma ${a.afirma}, no el holón de ${n.id}`);
  }
  return errores;
}

/** Cobertura: títulos de `busca` de las tribus activas o en formación sin necesidad (para el test). */
export function etiquetasSinNecesidad(): string[] {
  return listarTribusBilingues()
    .filter((t) => t.estado !== "vacante")
    .flatMap((t) => t.busca.filter((e) => !NECESIDADES.some((n) => n.tribuId === t.id && n.titulo.es === e.es)).map((e) => `${t.id}:${e.es}`));
}
