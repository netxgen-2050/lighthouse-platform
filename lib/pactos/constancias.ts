// Constancias de los pactos (forma de EAS, ADR-012 y ADR-018), solo en este navegador.
// Lista de solo agregar: una constancia no se edita; retirar es agregar un `revoca` que apunta a la propuesta.
// Las fechas y los ids de persona vienen de afuera: nada acá llama a Date.now().
import { buscarNecesidad, holonDe, idDeHolon, type Tope } from "@/lib/tribus/necesidades";
import { HORAS_PUNTUAL, RANGO_VARIABLE } from "./datos";
import type { ContenidoPacto } from "./estado";
import { mesValido } from "./mes";

export type EsquemaPacto =
  | "pacto-propone"
  | "pacto-acepta"
  | "pacto-no-acepta"
  | "revoca"
  | "pacto-propone-horas"
  | "pacto-confirma-horas";

export type ConstanciaPacto = {
  /** `p<n>-<esquema>`, n = el número más alto existente + 1. */
  id: string;
  esquema: EsquemaPacto;
  /** "persona:<idPersona>" | "tribu:<id>" | "comunidad:lighthouse". */
  afirma: string;
  /** idPersona de quien apretó el botón (la persona misma, o quien respondió por la tribu). */
  por: string;
  /** `pacto:<comunidad>:<idPersona de la persona del pacto>`. Nunca se parte con `split(":")`: el id puede tener dos puntos. */
  sobre: string;
  version: number;
  apuntaA: string | null;
  cuando: string;
  revocable: boolean;
  datos: Record<string, string>;
};

export const COMUNIDAD_LIGHTHOUSE_ID = "lighthouse";
export const PERSONA_BORRADA = "persona-borrada";
export const MAX_MOTIVO = 500;

const ESQUEMAS: readonly string[] = [
  "pacto-propone",
  "pacto-acepta",
  "pacto-no-acepta",
  "revoca",
  "pacto-propone-horas",
  "pacto-confirma-horas",
];

/** Los esquemas que se pueden retirar con un `revoca`. */
const REVOCABLES: readonly string[] = ["pacto-propone", "pacto-acepta", "pacto-propone-horas", "pacto-confirma-horas"];
const PREFIJO_SOBRE = "pacto:";

export type Nueva = {
  esquema: EsquemaPacto;
  afirma: string;
  por: string;
  sobre: string;
  version: number;
  apuntaA?: string | null;
  datos?: Record<string, string>;
};

/** Lo mínimo de la sesión para saber quién puede responder. */
export type QuienResponde = { idPersona: string; esSuperAdmin: boolean; tribuLider: string | null };

export function sobreDe(comunidad: string, idPersona: string): string {
  return `${PREFIJO_SOBRE}${comunidad}:${idPersona}`;
}

/** La comunidad de un `sobre`. Las comunidades no llevan dos puntos; el id de la persona sí puede. */
export function comunidadDeSobre(sobre: string): string | null {
  if (!sobre.startsWith(PREFIJO_SOBRE)) return null;
  const resto = sobre.slice(PREFIJO_SOBRE.length);
  const i = resto.indexOf(":");
  return i > 0 ? resto.slice(0, i) : null;
}

const PREFIJO_PUNTUAL = "puntual:";

/** `puntual:<necesidadId>:<idPersona>`: la postulación de una persona a una necesidad (pacto-puntual, design §3). */
export function sobrePuntual(necesidadId: string, idPersona: string): string {
  return `${PREFIJO_PUNTUAL}${necesidadId}:${idPersona}`;
}

/** La necesidad de un `sobre` puntual. Los ids de necesidad no llevan dos puntos; el de la persona sí puede. */
export function necesidadDeSobre(sobre: string): string | null {
  if (!sobre.startsWith(PREFIJO_PUNTUAL)) return null;
  const resto = sobre.slice(PREFIJO_PUNTUAL.length);
  const i = resto.indexOf(":");
  return i > 0 ? resto.slice(0, i) : null;
}

/** ¿Este `sobre` es un pacto o una postulación de esa persona? Compara el string completo, sin partirlo. */
export function sobreEsDe(sobre: string, idPersona: string): boolean {
  const comunidad = comunidadDeSobre(sobre);
  if (comunidad !== null && sobre === sobreDe(comunidad, idPersona)) return true;
  const necesidad = necesidadDeSobre(sobre);
  return necesidad !== null && sobre === sobrePuntual(necesidad, idPersona);
}

export function afirmaPersona(idPersona: string): string {
  return `persona:${idPersona}`;
}

/** Quién afirma cuando responde una comunidad. */
export function afirmaComunidad(comunidad: string): string {
  return comunidad === COMUNIDAD_LIGHTHOUSE_ID ? "comunidad:lighthouse" : `tribu:${comunidad}`;
}

/** El id de la persona que propone (lo que sigue a `persona:`), o null si no la afirma una persona. */
export function personaDeAfirma(afirma: string): string | null {
  return afirma.startsWith("persona:") && afirma.length > "persona:".length ? afirma.slice("persona:".length) : null;
}

/** El número más alto que ya usó algún id `p<n>-…` (0 si no hay). Así un id nunca se repite aunque la lista se achique. */
function numeroMasAlto(lista: readonly ConstanciaPacto[]): number {
  let max = 0;
  for (const c of lista) {
    const m = /^p(\d+)-/.exec(c.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

/** Agrega una constancia al final. No toca las anteriores. */
export function agregar(lista: readonly ConstanciaPacto[], nueva: Nueva, cuando: string): ConstanciaPacto[] {
  const c: ConstanciaPacto = {
    id: `p${Math.max(numeroMasAlto(lista), lista.length) + 1}-${nueva.esquema}`,
    esquema: nueva.esquema,
    afirma: nueva.afirma,
    por: nueva.por,
    sobre: nueva.sobre,
    version: nueva.version,
    apuntaA: nueva.apuntaA ?? null,
    cuando,
    revocable: REVOCABLES.includes(nueva.esquema),
    datos: nueva.datos ?? {},
  };
  return [...lista, c];
}

/** Una constancia está revocada si existe un `revoca` que apunta a ella. Se calcula; nunca se guarda. */
export function estaRevocada(lista: readonly ConstanciaPacto[], id: string): boolean {
  return lista.some((c) => c.esquema === "revoca" && c.apuntaA === id);
}

/**
 * Revoca una constancia agregando una nueva que la apunta. Si no existe, ya está revocada, no es revocable
 * o es ella misma una revocación, devuelve la lista igual.
 */
export function revocar(lista: readonly ConstanciaPacto[], id: string, por: string, cuando: string): ConstanciaPacto[] {
  const original = lista.find((c) => c.id === id);
  if (!original || original.esquema === "revoca" || !original.revocable || estaRevocada(lista, id)) return [...lista];
  return agregar(
    lista,
    { esquema: "revoca", afirma: original.afirma, por, sobre: original.sobre, version: original.version, apuntaA: id },
    cuando,
  );
}

/** La primera respuesta (aceptación o no aceptación) a una propuesta, o null si sigue sin respuesta. */
export function respuestaDe(lista: readonly ConstanciaPacto[], propuestaId: string): ConstanciaPacto | null {
  return lista.find((c) => (c.esquema === "pacto-acepta" || c.esquema === "pacto-no-acepta") && c.apuntaA === propuestaId) ?? null;
}

/* ---------- Horas de una tarea (pacto-puntual-verificacion, design §1) ---------- */

/** Las horas de una constancia de horas: entero de 1 a 200, o null. */
export function horasDeConstancia(c: ConstanciaPacto): number | null {
  const n = Number(c.datos.horas);
  return c.datos.horas !== undefined && c.datos.horas.trim() !== "" && Number.isInteger(n) && n >= HORAS_PUNTUAL.min && n <= HORAS_PUNTUAL.max ? n : null;
}

/** Las horas de un mes de un pacto variable: entero de 0 a 80, en pasos de 2 (0 es un dato), o null. */
export function horasDelMes(c: ConstanciaPacto): number | null {
  const n = Number(c.datos.horas);
  if (c.datos.horas === undefined || c.datos.horas.trim() === "" || !Number.isInteger(n)) return null;
  return n >= RANGO_VARIABLE.min && n <= RANGO_VARIABLE.max && n % RANGO_VARIABLE.paso === 0 ? n : null;
}

function indiceDe(lista: readonly ConstanciaPacto[], c: ConstanciaPacto): number {
  return lista.findIndex((x) => x.id === c.id);
}

/** ¿Es una propuesta de horas bien formada, de la persona, sobre su postulación pre-admitida (no revocada)? */
export function propuestaDeHorasValida(lista: readonly ConstanciaPacto[], h: ConstanciaPacto): boolean {
  if (h.esquema !== "pacto-propone-horas" || horasDeConstancia(h) === null || personaDeAfirma(h.afirma) === null) return false;
  const necesidad = necesidadDeSobre(h.sobre);
  if (!necesidad || h.apuntaA === null) return false;
  const post = preadmitidasDe(lista, necesidad).find((p) => p.id === h.apuntaA);
  return post !== undefined && post.sobre === h.sobre && post.afirma === h.afirma;
}

/**
 * ¿Esta respuesta cuenta para esa propuesta de horas? Afirma el holón que pre-admitió (recalculado desde la necesidad), no la da
 * la misma persona (J11), apunta a la propuesta de horas y no está revocada. Una confirmación copia las horas que vio el holón.
 */
function respuestaDeHorasValida(lista: readonly ConstanciaPacto[], h: ConstanciaPacto, r: ConstanciaPacto): boolean {
  if (r.apuntaA !== h.id || r.sobre !== h.sobre || estaRevocada(lista, r.id)) return false;
  const post = h.apuntaA === null ? undefined : lista.find((p) => p.id === h.apuntaA);
  if (!post || r.afirma !== contraparteDe(post) || r.por === personaDeAfirma(h.afirma)) return false;
  if (r.esquema === "pacto-confirma-horas") return r.datos.horas === h.datos.horas;
  return r.esquema === "pacto-no-acepta" && (r.datos.motivo ?? "").trim().length > 0;
}

/**
 * La respuesta (confirmación o pedido de revisar) que cuenta para una propuesta de horas: la primera válida que está
 * ANTES de cualquier `revoca` de la propuesta (gana la respuesta, como en `pactos-dos-partes` §3). null si no hay.
 */
export function respuestaDeHoras(lista: readonly ConstanciaPacto[], h: ConstanciaPacto): ConstanciaPacto | null {
  if (!propuestaDeHorasValida(lista, h)) return null;
  const limite = lista.findIndex((c) => c.esquema === "revoca" && c.apuntaA === h.id);
  const hasta = limite < 0 ? lista.length : limite;
  for (let i = 0; i < hasta; i++) {
    const c = lista[i];
    if ((c.esquema === "pacto-confirma-horas" || c.esquema === "pacto-no-acepta") && respuestaDeHorasValida(lista, h, c)) return c;
  }
  return null;
}

/** ¿Retirada? Hay un `revoca` y ninguna respuesta que cuente llegó antes. */
export function propuestaDeHorasRetirada(lista: readonly ConstanciaPacto[], h: ConstanciaPacto): boolean {
  return lista.some((c) => c.esquema === "revoca" && c.apuntaA === h.id) && respuestaDeHoras(lista, h) === null;
}

/** Las propuestas de horas vivas (válidas y no retiradas) de una necesidad, de la más vieja a la más nueva. */
export function propuestasDeHorasDe(lista: readonly ConstanciaPacto[], necesidadId: string): ConstanciaPacto[] {
  return lista.filter(
    (h) => h.esquema === "pacto-propone-horas" && necesidadDeSobre(h.sobre) === necesidadId && propuestaDeHorasValida(lista, h) && !propuestaDeHorasRetirada(lista, h),
  );
}

/**
 * ¿Cuenta esta confirmación? (a) apunta a una propuesta de horas de esa persona sobre su postulación pre-admitida; (b) afirma
 * el holón que pre-admitió; (c) no la da la persona misma; (d) copia las horas de la propuesta; (e) no está revocada; y es la
 * respuesta que cuenta de esa propuesta (una sola, anterior a cualquier retiro).
 */
export function confirmacionValida(lista: readonly ConstanciaPacto[], conf: ConstanciaPacto): boolean {
  if (conf.esquema !== "pacto-confirma-horas") return false;
  const h = lista.find((c) => c.id === conf.apuntaA);
  if (!h) return false;
  return respuestaDeHoras(lista, h)?.id === conf.id;
}

/** Las confirmaciones que cuentan de una necesidad, en orden de verificación (`cuando`; a igual `cuando`, el orden del registro). */
export function confirmacionesDe(lista: readonly ConstanciaPacto[], necesidadId: string): ConstanciaPacto[] {
  return lista
    .filter((c) => c.esquema === "pacto-confirma-horas" && necesidadDeSobre(c.sobre) === necesidadId && confirmacionValida(lista, c))
    .map((c) => ({ c, i: indiceDe(lista, c) }))
    .sort((a, b) => Date.parse(a.c.cuando) - Date.parse(b.c.cuando) || a.i - b.i)
    .map((x) => x.c);
}

function esPropuestaPendiente(lista: readonly ConstanciaPacto[], c: ConstanciaPacto): boolean {
  return (
    c.esquema === "pacto-propone" &&
    personaDeAfirma(c.afirma) !== null &&
    !estaRevocada(lista, c.id) &&
    respuestaDe(lista, c.id) === null
  );
}

/** ¿Esta propuesta sigue esperando respuesta? (existe, no está revocada y nadie respondió). */
export function estaPendiente(lista: readonly ConstanciaPacto[], propuestaId: string): boolean {
  const c = lista.find((x) => x.id === propuestaId);
  return c !== undefined && esPropuestaPendiente(lista, c);
}

/** Propuestas de personas, sin revocar y sin respuesta, de las comunidades dadas. */
export function pendientes(lista: readonly ConstanciaPacto[], comunidades: readonly string[]): ConstanciaPacto[] {
  return lista.filter((c) => {
    if (!esPropuestaPendiente(lista, c)) return false;
    const comunidad = comunidadDeSobre(c.sobre);
    return comunidad !== null && comunidades.includes(comunidad);
  });
}

/**
 * Las comunidades donde la sesión responde: la tribu que lidera y, si es super admin, el Lighthouse.
 * Es el ÚNICO lugar que traduce la sesión en comunidades (design §10).
 */
export function comunidadesQueResponde(sesion: QuienResponde): string[] {
  const salida: string[] = [];
  if (sesion.tribuLider) salida.push(sesion.tribuLider);
  if (sesion.esSuperAdmin && !salida.includes(COMUNIDAD_LIGHTHOUSE_ID)) salida.push(COMUNIDAD_LIGHTHOUSE_ID);
  return salida;
}

/** ¿La propuesta es de quien lidera esa tribu? (design §10: la marca la pone quien propone). */
export function proponeLider(c: ConstanciaPacto): boolean {
  return c.datos.proponeLider === "1";
}

/**
 * ¿Puede esta sesión responder la propuesta? Nunca la propia. La responde quien lidera esa tribu, el super admin en el
 * Lighthouse y, solo si la propone quien lidera la tribu, también el super admin.
 */
export function puedeResponder(sesion: QuienResponde, comunidad: string, propuesta: ConstanciaPacto): boolean {
  if (propuesta.esquema !== "pacto-propone") return false;
  const autor = personaDeAfirma(propuesta.afirma);
  if (autor === null || autor === sesion.idPersona) return false;
  if (comunidadDeSobre(propuesta.sobre) !== comunidad) return false;
  if (comunidadesQueResponde(sesion).includes(comunidad)) return true;
  return sesion.esSuperAdmin && proponeLider(propuesta);
}

/** Las propuestas pendientes que esta sesión ve en su pantalla (las que puede responder y su propio pacto). */
export function pendientesParaVer(lista: readonly ConstanciaPacto[], sesion: QuienResponde): ConstanciaPacto[] {
  const propias = comunidadesQueResponde(sesion);
  return lista.filter((c) => {
    if (!esPropuestaPendiente(lista, c)) return false;
    const comunidad = comunidadDeSobre(c.sobre);
    if (comunidad === null) return false;
    return propias.includes(comunidad) || (sesion.esSuperAdmin && proponeLider(c));
  });
}

function textoCorto(x: unknown, max: number): string {
  return typeof x === "string" ? x.slice(0, max) : "";
}

/** Lee lo guardado; una entrada mal formada se ignora y el resto se lee. */
export function leerConstancias(crudo: string | null): ConstanciaPacto[] {
  if (!crudo) return [];
  try {
    const o: unknown = JSON.parse(crudo);
    if (!Array.isArray(o)) return [];
    const salida: ConstanciaPacto[] = [];
    for (const x of o) {
      if (typeof x !== "object" || x === null) continue;
      const r = x as Record<string, unknown>;
      if (
        typeof r.id !== "string" ||
        typeof r.esquema !== "string" ||
        !ESQUEMAS.includes(r.esquema) ||
        typeof r.afirma !== "string" ||
        typeof r.por !== "string" ||
        typeof r.sobre !== "string" ||
        typeof r.cuando !== "string" ||
        typeof r.version !== "number" ||
        !Number.isInteger(r.version) ||
        r.version < 0
      ) {
        continue;
      }
      const datos: Record<string, string> = {};
      if (typeof r.datos === "object" && r.datos !== null && !Array.isArray(r.datos)) {
        for (const [k, v] of Object.entries(r.datos)) {
          if (k !== "__proto__" && typeof v === "string") datos[k] = textoCorto(v, 1000);
        }
      }
      const esquema = r.esquema as EsquemaPacto;
      if (esquema === "pacto-propone-horas" || esquema === "pacto-confirma-horas") {
        if (comunidadDeSobre(r.sobre) !== null) {
          // Horas de un mes de un pacto variable (pactos-horas-variables): enteras de 0 a 80, en pasos de 2, y el mes AAAA-MM obligatorio.
          if (horasDelMes({ datos } as ConstanciaPacto) === null || !mesValido(datos.mes)) continue;
        } else {
          // Horas de una tarea: enteras de 1 a 200; el mes, si está, es AAAA-MM. Lo mal formado se ignora.
          if (horasDeConstancia({ datos } as ConstanciaPacto) === null) continue;
          if (datos.mes !== undefined && !mesValido(datos.mes)) continue;
        }
      }
      salida.push({
        id: r.id,
        esquema,
        afirma: r.afirma,
        por: r.por,
        sobre: r.sobre,
        version: r.version,
        apuntaA: typeof r.apuntaA === "string" ? r.apuntaA : null,
        cuando: r.cuando,
        revocable: typeof r.revocable === "boolean" ? r.revocable : REVOCABLES.includes(esquema),
        datos,
      });
    }
    return salida;
  } catch {
    return [];
  }
}

/** Lo que lleva `datos` de una propuesta: el contenido, el tipo y quién propone (nombre o iniciales; nunca el email). */
export function datosDePropuesta(entrada: {
  tipo: "nuevo" | "cambio";
  contenido: ContenidoPacto;
  /** Cambio: la versión vigente, para que quien responde vea "de ... a ...". */
  vigente?: Pick<ContenidoPacto, "modalidad" | "horas" | "rango">;
  nombre: string;
  iniciales: string;
  proponeLider: boolean;
  migrada?: boolean;
}): Record<string, string> {
  const datos: Record<string, string> = {
    tipo: entrada.tipo,
    rol: entrada.contenido.rol,
    rolOtro: entrada.contenido.rolOtro,
    descripcion: entrada.contenido.descripcion,
    horas: String(entrada.contenido.horas),
    modalidad: entrada.contenido.modalidad,
  };
  if (entrada.contenido.modalidad === "variable") {
    datos.rangoMin = String(entrada.contenido.rango.min);
    datos.rangoMax = String(entrada.contenido.rango.max);
    if (entrada.contenido.compromisoMeses !== null) datos.compromisoMeses = String(entrada.contenido.compromisoMeses);
  }
  if (entrada.vigente) {
    datos.modalidadVigente = entrada.vigente.modalidad;
    datos.horasVigentes = String(entrada.vigente.horas);
    if (entrada.vigente.modalidad === "variable") {
      datos.rangoVigenteMin = String(entrada.vigente.rango.min);
      datos.rangoVigenteMax = String(entrada.vigente.rango.max);
    }
  }
  const nombre = entrada.nombre.trim().slice(0, 80);
  if (nombre) datos.nombre = nombre;
  else if (entrada.iniciales.trim()) datos.iniciales = entrada.iniciales.trim().slice(0, 4);
  if (entrada.proponeLider) datos.proponeLider = "1";
  if (entrada.migrada) datos.migrada = "1";
  return datos;
}

/**
 * El holón de una postulación, RECALCULADO desde la necesidad de su `sobre` (nunca de `datos.holon`, que escribe la propia
 * persona): así nadie puede saltarse a quien administra un círculo transversal. null si la necesidad no existe.
 */
export function holonIdDePostulacion(c: ConstanciaPacto): string | null {
  const id = necesidadDeSobre(c.sobre);
  const n = id ? buscarNecesidad(id) : undefined;
  return n ? idDeHolon(holonDe(n)) : null;
}

/**
 * Quién tiene que afirmar la aceptación de una propuesta: en un pacto de tiempo, la comunidad; en una postulación a una
 * tarea (`datos.tipo === "puntual"`), el holón de la necesidad recalculado desde el `sobre` (p. ej. `circulo:valle-3`),
 * no el `datos.holon` que escribió la persona.
 */
export function contraparteDe(propuesta: ConstanciaPacto): string | null {
  if (propuesta.datos.tipo === "puntual") return holonIdDePostulacion(propuesta);
  const comunidad = comunidadDeSobre(propuesta.sobre);
  return comunidad === null ? null : afirmaComunidad(comunidad);
}

/** ¿Esta propuesta es una postulación a una tarea? */
export function esPostulacion(c: ConstanciaPacto): boolean {
  return c.esquema === "pacto-propone" && c.datos.tipo === "puntual" && necesidadDeSobre(c.sobre) !== null;
}

/** ¿La respuesta es válida? La afirma la contraparte y no la da la misma persona que propuso. */
export function respuestaValida(propuesta: ConstanciaPacto, r: ConstanciaPacto): boolean {
  return r.afirma === contraparteDe(propuesta) && r.por !== personaDeAfirma(propuesta.afirma) && r.sobre === propuesta.sobre;
}

/**
 * Las postulaciones de esa necesidad que el holón pre-admitió: propuestas puntuales sin revocar con una aceptación válida
 * (de su holón, sin revocar y de otra persona), una por persona. Una tarea la pueden tomar varias personas.
 */
export function preadmitidasDe(lista: readonly ConstanciaPacto[], necesidadId: string): ConstanciaPacto[] {
  const porPersona = new Map<string, ConstanciaPacto>();
  for (const p of lista) {
    if (!esPostulacion(p) || necesidadDeSobre(p.sobre) !== necesidadId || estaRevocada(lista, p.id)) continue;
    const r = respuestaDe(lista, p.id);
    if (!r || r.esquema !== "pacto-acepta" || estaRevocada(lista, r.id) || !respuestaValida(p, r)) continue;
    porPersona.set(p.sobre, p);
  }
  return [...porPersona.values()];
}

/** Lo que lleva `datos` de una postulación: la necesidad, el holón, lo que la persona completó y los máximos que vio el holón. Nunca el email. */
export function datosDePostulacion(entrada: {
  comunidad: string;
  necesidad: string;
  holon: string;
  relacion: "miembro" | "aspirante";
  rol: string;
  rolOtro: string;
  descripcion: string;
  horas: number;
  fecha: string;
  tope: Tope | null;
  topeTotal: Tope | null;
  nombre: string;
  iniciales: string;
  proponeLider: boolean;
}): Record<string, string> {
  const datos: Record<string, string> = {
    tipo: "puntual",
    comunidad: entrada.comunidad,
    necesidad: entrada.necesidad,
    holon: entrada.holon,
    relacion: entrada.relacion,
    rol: entrada.rol,
    rolOtro: entrada.rolOtro,
    descripcion: entrada.descripcion,
    horas: String(entrada.horas),
    fecha: entrada.fecha,
    topeUnidad: entrada.tope?.unidad ?? "",
    topeValor: entrada.tope ? String(entrada.tope.valor) : "",
    topeTotalUnidad: entrada.topeTotal?.unidad ?? "",
    topeTotalValor: entrada.topeTotal ? String(entrada.topeTotal.valor) : "",
  };
  const nombre = entrada.nombre.trim().slice(0, 80);
  if (nombre) datos.nombre = nombre;
  else if (entrada.iniciales.trim()) datos.iniciales = entrada.iniciales.trim().slice(0, 4);
  if (entrada.proponeLider) datos.proponeLider = "1";
  return datos;
}

/** Lee un máximo (por persona o total) de los `datos` de una postulación; null si falta o no es un entero positivo. */
export function topeDeDatos(unidad: string | undefined, valor: string | undefined): Tope | null {
  const n = Number(valor);
  if ((unidad !== "horas" && unidad !== "semillas") || !Number.isInteger(n) || n <= 0) return null;
  return { unidad, valor: n };
}
