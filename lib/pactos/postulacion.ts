// Quién puede postularse a una necesidad y quién la responde (openspec/changes/pacto-puntual, design §2). Todo puro.
import { todosLosCirculos } from "@/lib/gobernanza/datos";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { COMUNIDAD_LIGHTHOUSE, estadoDe, type Membresias } from "@/lib/membresia/estado";
import { buscarTribu } from "@/lib/tribus/datos";
import { administradorDe, buscarNecesidad, holonDe, idDeHolon, tomable, type Holon, type Necesidad } from "@/lib/tribus/necesidades";
import { aceptaFormato } from "./formatos";
import {
  MAX_MOTIVO,
  afirmaPersona,
  agregar,
  comunidadesQueResponde,
  contraparteDe,
  esPostulacion,
  holonIdDePostulacion,
  estaPendiente,
  estaRevocada,
  personaDeAfirma,
  proponeLider,
  respuestaDe,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";

export type Relacion = "miembro" | "aspirante";

/** El holón que nombra un id como `circulo:valle-3`, `tribu:valle` o `comunidad:lighthouse`; null si no existe. */
export function holonDeId(id: string): Holon | null {
  if (id === idDeHolon({ tipo: "comun" })) return { tipo: "comun" };
  if (id.startsWith("tribu:") && id.length > "tribu:".length) return { tipo: "tribu", id: id.slice("tribu:".length) };
  if (id.startsWith("circulo:")) {
    const c = todosLosCirculos().find((x) => x.id === id.slice("circulo:".length));
    return c ? { tipo: "circulo", id: c.id, transversal: c.tribus.length !== 1 } : null;
  }
  return null;
}

/** El holón de una postulación, recalculado desde su necesidad (no de lo que escribió la persona). */
export function holonDePostulacion(c: ConstanciaPacto): Holon | null {
  const id = holonIdDePostulacion(c);
  return id ? holonDeId(id) : null;
}

/** Las tribus cuya membresía cuenta para ese holón: la tribu, la del círculo, las que participan en un transversal; ninguna para el común. */
export function tribusDelHolon(h: Holon): string[] {
  if (h.tipo === "comun") return [];
  if (h.tipo === "tribu") return [h.id];
  return todosLosCirculos().find((c) => c.id === h.id)?.tribus ?? [];
}

/**
 * Relación de la persona con el holón. En el prototipo los círculos no tienen integrantes propios: sale de la membresía
 * en su tribu (o en alguna de las que participan). Miembro (aceptada) gana sobre aspirante (pedido de adhesión). Para el
 * común, la membresía en el Lighthouse.
 */
export function relacionConHolon(m: Membresias, h: Holon): Relacion | null {
  const comunidades = h.tipo === "comun" ? [COMUNIDAD_LIGHTHOUSE] : tribusDelHolon(h);
  let mejor: Relacion | null = null;
  for (const c of comunidades) {
    const e = estadoDe(m, c);
    if (e === "miembro") return "miembro";
    if (e === "pedido") mejor = "aspirante";
  }
  return mejor;
}

/**
 * La comunidad cuyo administrador responde. Una tribu o un círculo de una tribu: quien lidera esa tribu. Un círculo
 * transversal (lo administra Hifa, simulado, con el super admin de respaldo) o el común: el super admin (`lighthouse`).
 * Cuando los círculos tengan integrantes, solo cambia esta función.
 */
export function comunidadQueResponde(h: Holon): string {
  if (h.tipo === "comun" || administradorDe(h).tipo === "hifa") return COMUNIDAD_LIGHTHOUSE;
  const tribus = tribusDelHolon(h);
  return tribus.length === 1 ? tribus[0] : COMUNIDAD_LIGHTHOUSE;
}

/** ¿Lo administra Hifa (círculo transversal)? En el prototipo es simulado y experimental. */
export function loAdministraHifa(h: Holon): boolean {
  return administradorDe(h).tipo === "hifa";
}

/** ¿Puede esta sesión responder la postulación? Nunca la propia; la de quien administra el holón la responde el super admin. */
export function puedeResponderPostulacion(sesion: QuienResponde, propuesta: ConstanciaPacto): boolean {
  if (!esPostulacion(propuesta)) return false;
  const autor = personaDeAfirma(propuesta.afirma);
  if (autor === null || autor === sesion.idPersona) return false;
  const holon = holonDePostulacion(propuesta);
  if (!holon) return false;
  if (comunidadesQueResponde(sesion).includes(comunidadQueResponde(holon))) return true;
  return sesion.esSuperAdmin && proponeLider(propuesta);
}

function esPendiente(lista: readonly ConstanciaPacto[], c: ConstanciaPacto): boolean {
  return esPostulacion(c) && !estaRevocada(lista, c.id) && respuestaDe(lista, c.id) === null;
}

/** Las postulaciones pendientes que esta sesión ve en su pantalla: las que puede responder y las suyas (sin botones). */
export function postulacionesParaVer(lista: readonly ConstanciaPacto[], sesion: QuienResponde): ConstanciaPacto[] {
  const propias = comunidadesQueResponde(sesion);
  return lista.filter((c) => {
    if (!esPendiente(lista, c)) return false;
    const holon = holonDePostulacion(c);
    if (!holon) return false;
    return propias.includes(comunidadQueResponde(holon)) || (sesion.esSuperAdmin && proponeLider(c));
  });
}

/** Las postulaciones pendientes de una tribu (y de sus círculos) que la sesión puede responder: lo que cuenta la ficha. */
export function postulacionesDeLaTribu(lista: readonly ConstanciaPacto[], sesion: QuienResponde, tribu: string): ConstanciaPacto[] {
  return postulacionesParaVer(lista, sesion).filter((c) => {
    const holon = holonDePostulacion(c);
    return holon !== null && puedeResponderPostulacion(sesion, c) && tribusDelHolon(holon).includes(tribu);
  });
}

/** Nombre propio del holón (no se traduce, salvo el de un círculo, que tiene versión en inglés) y de qué tipo es. */
export function nombreDeHolon(h: Holon, idioma: Idioma): { nombre: string; tipo: Holon["tipo"] } {
  if (h.tipo === "comun") return { nombre: "Lighthouse", tipo: "comun" };
  if (h.tipo === "tribu") return { nombre: buscarTribu(h.id, idioma)?.nombre ?? h.id, tipo: "tribu" };
  const c = todosLosCirculos().find((x) => x.id === h.id);
  return { nombre: c ? textoEn(c.nombre, idioma) : h.id, tipo: "circulo" };
}

/** ¿Se puede abrir una postulación a esa necesidad desde esa comunidad? (la URL de `/pactos` y el botón de la ficha). */
export type AperturaPostulacion =
  | { tipo: "crear"; necesidad: Necesidad; relacion: Relacion }
  | { tipo: "sin-relacion"; tribu: string }
  | { tipo: "no-se-puede" };

export function aperturaDePostulacion(m: Membresias, comunidad: string, necesidadId: string): AperturaPostulacion {
  const n = buscarNecesidad(necesidadId, "es");
  if (!n || n.tribuId !== comunidad || !aceptaFormato(comunidad, "puntual") || !tomable(n)) return { tipo: "no-se-puede" };
  const relacion = relacionConHolon(m, holonDe(n));
  return relacion ? { tipo: "crear", necesidad: n, relacion } : { tipo: "sin-relacion", tribu: n.tribuId };
}

export type ResultadoRespuesta = "ok" | "ya-respondida" | "sin-permiso" | "sin-motivo";

/**
 * Pre-admite o no pre-admite una postulación sobre la lista RELEÍDA. Si esa misma postulación ya tiene respuesta, está
 * retirada o la sesión no puede responderla, no escribe. Pre-admitir a una persona no toca las postulaciones de las demás.
 */
export function responderPostulacion(
  lista: readonly ConstanciaPacto[],
  pedido: { propuestaId: string; acepta: boolean; motivo?: string; sesion: QuienResponde },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: ResultadoRespuesta } {
  const igual = [...lista];
  const propuesta = lista.find((c) => c.id === pedido.propuestaId);
  if (!propuesta || !esPostulacion(propuesta) || !estaPendiente(lista, propuesta.id)) return { lista: igual, resultado: "ya-respondida" };
  if (!puedeResponderPostulacion(pedido.sesion, propuesta)) return { lista: igual, resultado: "sin-permiso" };
  const motivo = (pedido.motivo ?? "").trim();
  if (!pedido.acepta && motivo.length === 0) return { lista: igual, resultado: "sin-motivo" };
  const holon = holonDePostulacion(propuesta);
  const datos: Record<string, string> = pedido.acepta ? {} : { motivo: motivo.slice(0, MAX_MOTIVO) };
  // Si el holón lo administra Hifa (simulada), responde el super admin de respaldo y la constancia lo dice.
  if (holon && loAdministraHifa(holon)) datos.respaldoDeHifa = "1";
  return {
    lista: agregar(
      lista,
      {
        esquema: pedido.acepta ? "pacto-acepta" : "pacto-no-acepta",
        afirma: contraparteDe(propuesta) ?? "",
        por: pedido.sesion.idPersona,
        sobre: propuesta.sobre,
        version: propuesta.version,
        apuntaA: propuesta.id,
        datos,
      },
      cuando,
    ),
    resultado: "ok",
  };
}

/** Las postulaciones que una persona tiene escritas en el registro (sin revocar), de la más vieja a la más nueva. */
export function postulacionesDe(lista: readonly ConstanciaPacto[], idPersona: string): ConstanciaPacto[] {
  return lista.filter((c) => esPostulacion(c) && c.afirma === afirmaPersona(idPersona) && !estaRevocada(lista, c.id));
}
