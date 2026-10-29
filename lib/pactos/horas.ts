// Marcar la tarea hecha, retirarla y que el holón verifique las horas (openspec/changes/pacto-puntual-verificacion, design §1).
// Todo puro: las listas se releen antes de llamar y las fechas vienen de afuera.
import { repartirConTopeTotal, type Tope } from "@/lib/tribus/necesidades";
import { HORAS_PUNTUAL, HOUR_REF_USD } from "./datos";
import {
  MAX_MOTIVO,
  afirmaPersona,
  agregar,
  confirmacionesDe,
  contraparteDe,
  horasDeConstancia,
  necesidadDeSobre,
  personaDeAfirma,
  preadmitidasDe,
  propuestaDeHorasRetirada,
  propuestaDeHorasValida,
  respuestaDeHoras,
  revocar,
  topeDeDatos,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import { holonDePostulacion, loAdministraHifa, puedeResponderPostulacion } from "./postulacion";

/**
 * La propuesta de horas viva (válida, sin retirar y sin un "no acepta" que cuente) de una postulación pre-admitida, la más
 * nueva; o null. Tras "Pedir revisar" la persona puede volver a marcar hecha.
 */
export function horasDePostulacion(lista: readonly ConstanciaPacto[], postulacionId: string): ConstanciaPacto | null {
  const hs = lista.filter(
    (h) =>
      h.apuntaA === postulacionId &&
      propuestaDeHorasValida(lista, h) &&
      !propuestaDeHorasRetirada(lista, h) &&
      respuestaDeHoras(lista, h)?.esquema !== "pacto-no-acepta",
  );
  return hs.length > 0 ? hs[hs.length - 1] : null;
}

/**
 * La propuesta de horas que la pantalla de la persona debe mirar al conciliar: la viva si hay; si no, la última válida y no
 * retirada (la que el holón respondió con "no acepta", para aplicarle el pedido de revisar). Una propuesta nueva tapa a la vieja.
 */
export function horasParaConciliar(lista: readonly ConstanciaPacto[], postulacionId: string): ConstanciaPacto | null {
  const viva = horasDePostulacion(lista, postulacionId);
  if (viva) return viva;
  const hs = lista.filter((h) => h.apuntaA === postulacionId && propuestaDeHorasValida(lista, h) && !propuestaDeHorasRetirada(lista, h));
  return hs.length > 0 ? hs[hs.length - 1] : null;
}

export type ResultadoMarcar = "ok" | "horas-invalidas" | "no-preadmitida" | "ya-marcada";

/** La persona marca hecha su tarea con las horas reales. Solo con la postulación pre-admitida y sin otra propuesta de horas viva. */
export function marcarHecha(
  lista: readonly ConstanciaPacto[],
  pedido: { idPersona: string; necesidadId: string; sobre: string; horas: number },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: ResultadoMarcar; id?: string } {
  const igual = [...lista];
  if (!Number.isInteger(pedido.horas) || pedido.horas < HORAS_PUNTUAL.min || pedido.horas > HORAS_PUNTUAL.max) return { lista: igual, resultado: "horas-invalidas" };
  const post = preadmitidasDe(lista, pedido.necesidadId).find((p) => p.sobre === pedido.sobre && p.afirma === afirmaPersona(pedido.idPersona));
  if (!post) return { lista: igual, resultado: "no-preadmitida" };
  const viva = horasDePostulacion(lista, post.id);
  if (viva) return { lista: igual, resultado: "ya-marcada" };
  const nueva = agregar(
    lista,
    {
      esquema: "pacto-propone-horas",
      afirma: afirmaPersona(pedido.idPersona),
      por: pedido.idPersona,
      sobre: post.sobre,
      version: post.version,
      apuntaA: post.id,
      datos: { horas: String(pedido.horas) },
    },
    cuando,
  );
  return { lista: nueva, resultado: "ok", id: nueva[nueva.length - 1].id };
}

/** Retira lo marcado como hecho, solo si el holón todavía no respondió (relee: si ya hay respuesta, no escribe el `revoca`). */
export function retirarHecha(
  lista: readonly ConstanciaPacto[],
  pedido: { idPersona: string; propuestaHorasId: string },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: "ok" | "ya-respondida" | "no-es-tuya" } {
  const igual = [...lista];
  const h = lista.find((c) => c.id === pedido.propuestaHorasId);
  if (!h || h.esquema !== "pacto-propone-horas" || personaDeAfirma(h.afirma) !== pedido.idPersona) return { lista: igual, resultado: "no-es-tuya" };
  if (respuestaDeHoras(lista, h) !== null) return { lista: igual, resultado: "ya-respondida" };
  return { lista: revocar(lista, h.id, pedido.idPersona, cuando), resultado: "ok" };
}

/** Las propuestas de horas vivas (válidas, sin retirar) que todavía esperan respuesta. */
export function horasEsperando(lista: readonly ConstanciaPacto[]): ConstanciaPacto[] {
  return lista.filter(
    (h) =>
      h.esquema === "pacto-propone-horas" && propuestaDeHorasValida(lista, h) && !propuestaDeHorasRetirada(lista, h) && respuestaDeHoras(lista, h) === null,
  );
}

/** Las que esperan respuesta y cuyo pacto esta sesión puede responder. Nadie confirma sus propias horas. */
export function horasPendientes(lista: readonly ConstanciaPacto[], sesion: QuienResponde): ConstanciaPacto[] {
  return horasEsperando(lista).filter((h) => {
    const post = lista.find((p) => p.id === h.apuntaA);
    return post !== undefined && puedeResponderPostulacion(sesion, post);
  });
}

export type ResultadoHoras = "ok" | "ya-respondida" | "sin-permiso" | "sin-motivo";

/**
 * Verifica o pide revisar unas horas sobre la lista RELEÍDA. Una sola respuesta por propuesta de horas. En un círculo
 * transversal (lo administra Hifa, simulada) responde el super admin de respaldo y la constancia lo dice.
 */
export function responderHoras(
  lista: readonly ConstanciaPacto[],
  pedido: { propuestaHorasId: string; verifica: boolean; motivo?: string; sesion: QuienResponde },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: ResultadoHoras } {
  const igual = [...lista];
  const h = lista.find((c) => c.id === pedido.propuestaHorasId);
  if (!h || h.esquema !== "pacto-propone-horas" || !propuestaDeHorasValida(lista, h) || propuestaDeHorasRetirada(lista, h) || respuestaDeHoras(lista, h) !== null) {
    return { lista: igual, resultado: "ya-respondida" };
  }
  const post = lista.find((p) => p.id === h.apuntaA);
  if (!post || !puedeResponderPostulacion(pedido.sesion, post)) return { lista: igual, resultado: "sin-permiso" };
  const motivo = (pedido.motivo ?? "").trim();
  if (!pedido.verifica && motivo.length === 0) return { lista: igual, resultado: "sin-motivo" };
  const holon = holonDePostulacion(post);
  const datos: Record<string, string> = pedido.verifica ? { horas: h.datos.horas } : { motivo: motivo.slice(0, MAX_MOTIVO) };
  if (holon && loAdministraHifa(holon)) datos.respaldoDeHifa = "1";
  return {
    lista: agregar(
      lista,
      {
        esquema: pedido.verifica ? "pacto-confirma-horas" : "pacto-no-acepta",
        afirma: contraparteDe(post) ?? "",
        por: pedido.sesion.idPersona,
        sobre: h.sobre,
        version: h.version,
        apuntaA: h.id,
        datos,
      },
      cuando,
    ),
    resultado: "ok",
  };
}

/** Lo ya repartido de una tarea: horas con Semillas y Semillas de las verificaciones anteriores a una confirmación. */
export type YaRepartido = { horasConSemillas: number; semillas: number };

/**
 * Lo que repartieron las verificaciones ANTERIORES (por `cuando`) a `confirmacionId` en esa necesidad, con el máximo por
 * persona de la postulación de cada una y el máximo total dado. Sale del registro compartido, no del estado local.
 * Con `confirmacionId` null, lo repartido por todas (para mostrar cuánto queda).
 */
export function repartidoAntesDe(
  lista: readonly ConstanciaPacto[],
  necesidadId: string,
  confirmacionId: string | null,
  topeTotal: Tope | null,
): YaRepartido {
  let resto: Tope | null = topeTotal;
  const ya: YaRepartido = { horasConSemillas: 0, semillas: 0 };
  for (const conf of confirmacionesDe(lista, necesidadId)) {
    if (conf.id === confirmacionId) break;
    const h = lista.find((c) => c.id === conf.apuntaA);
    const post = h ? lista.find((p) => p.id === h.apuntaA) : undefined;
    const horas = h ? horasDeConstancia(h) : null;
    if (!post || horas === null) continue;
    const tope = topeDeDatos(post.datos.topeUnidad, post.datos.topeValor);
    const r = repartirConTopeTotal([{ persona: post.id, horas }], tope, resto, HOUR_REF_USD);
    ya.horasConSemillas += r.horasConSemillas;
    ya.semillas += r.semillas;
    if (topeTotal) {
      const gastado = topeTotal.unidad === "horas" ? ya.horasConSemillas : ya.semillas;
      resto = { unidad: topeTotal.unidad, valor: Math.max(0, topeTotal.valor - gastado) };
    }
  }
  return ya;
}

/** Lo que queda del máximo total (en su unidad) después de lo ya repartido; null si la tarea no tiene máximo total. */
export function restoDelTotal(topeTotal: Tope | null, ya: YaRepartido): number | null {
  if (!topeTotal) return null;
  return Math.max(0, topeTotal.valor - (topeTotal.unidad === "horas" ? ya.horasConSemillas : ya.semillas));
}

/** Un máximo como texto neutro ("10 h" o "60 Semillas"; "Semillas" no se traduce). */
export function textoDeTope(unidad: "horas" | "semillas", valor: number): string {
  return unidad === "horas" ? `${valor} h` : `${valor} Semillas`;
}

/** El necesidadId de una propuesta de horas. */
export function necesidadDeHoras(h: ConstanciaPacto): string | null {
  return necesidadDeSobre(h.sobre);
}
