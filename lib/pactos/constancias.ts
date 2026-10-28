// Constancias de los pactos (forma de EAS, ADR-012 y ADR-018), solo en este navegador.
// Lista de solo agregar: una constancia no se edita; retirar es agregar un `revoca` que apunta a la propuesta.
// Las fechas y los ids de persona vienen de afuera: nada acá llama a Date.now().
import type { ContenidoPacto } from "./estado";

export type EsquemaPacto = "pacto-propone" | "pacto-acepta" | "pacto-no-acepta" | "revoca";

export type ConstanciaPacto = {
  /** `p<n>-<esquema>`, n = largo de la lista + 1. */
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

const ESQUEMAS: readonly string[] = ["pacto-propone", "pacto-acepta", "pacto-no-acepta", "revoca"];
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

/** ¿Este `sobre` es un pacto de esa persona? Compara el string completo, sin partirlo. */
export function sobreEsDe(sobre: string, idPersona: string): boolean {
  const comunidad = comunidadDeSobre(sobre);
  return comunidad !== null && sobre === sobreDe(comunidad, idPersona);
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

/** Agrega una constancia al final. No toca las anteriores. */
export function agregar(lista: readonly ConstanciaPacto[], nueva: Nueva, cuando: string): ConstanciaPacto[] {
  const c: ConstanciaPacto = {
    id: `p${lista.length + 1}-${nueva.esquema}`,
    esquema: nueva.esquema,
    afirma: nueva.afirma,
    por: nueva.por,
    sobre: nueva.sobre,
    version: nueva.version,
    apuntaA: nueva.apuntaA ?? null,
    cuando,
    revocable: nueva.esquema === "pacto-propone" || nueva.esquema === "pacto-acepta",
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

function esPropuestaPendiente(lista: readonly ConstanciaPacto[], c: ConstanciaPacto): boolean {
  return (
    c.esquema === "pacto-propone" &&
    personaDeAfirma(c.afirma) !== null &&
    !estaRevocada(lista, c.id) &&
    respuestaDe(lista, c.id) === null
  );
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
      salida.push({
        id: r.id,
        esquema,
        afirma: r.afirma,
        por: r.por,
        sobre: r.sobre,
        version: r.version,
        apuntaA: typeof r.apuntaA === "string" ? r.apuntaA : null,
        cuando: r.cuando,
        revocable: typeof r.revocable === "boolean" ? r.revocable : esquema === "pacto-propone" || esquema === "pacto-acepta",
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
  horasVigentes?: number;
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
  };
  if (entrada.horasVigentes !== undefined) datos.horasVigentes = String(entrada.horasVigentes);
  const nombre = entrada.nombre.trim().slice(0, 80);
  if (nombre) datos.nombre = nombre;
  else if (entrada.iniciales.trim()) datos.iniciales = entrada.iniciales.trim().slice(0, 4);
  if (entrada.proponeLider) datos.proponeLider = "1";
  if (entrada.migrada) datos.migrada = "1";
  return datos;
}
