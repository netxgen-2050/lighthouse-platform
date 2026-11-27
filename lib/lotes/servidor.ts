import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/cliente";
import { personas, reservas } from "@/lib/db/schema";
import { listarLotes } from "@/lib/territorios/loteo";
import { ESTADOS_EJEMPLO, estadoDeLote } from "@/lib/territorios/loteo-estados";
import { leerVio, type CompraLote, type EstadosDeLaBase, type LoVisto } from "./compra";
import { OPCIONES_COMPRA, type OpcionCompra } from "./modelo";

/**
 * Las reservas en el servidor (`lotes-en-la-base`, design §2). El libro `reservas` es de solo agregar (la base rechaza
 * UPDATE, DELETE y TRUNCATE) y el estado vigente de un lote es su ÚLTIMO evento. Cada escritura corre en una transacción con
 * un lock por lote: quien primero lo toma gana; ningún rol, pase ni perfil da prioridad. Lo único simulado es el pago.
 */

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Consulta = Db | Tx;

/** Tope de lo que la persona vio al reservar. */
export const MAX_VIO_BYTES = 4 * 1024;

export type MotivoRechazo = "no-disponible" | "ya-reservado" | "no-reservado" | "sin-permiso";

export type Origen = { fuente?: string; medio?: string; campana?: string; camino?: string };

export type Cuerpo =
  | { accion: "reservar"; loteId: string; opcion: OpcionCompra; vio: LoVisto; origen: Origen | null }
  | { accion: "pagar"; loteId: string }
  | { accion: "deshacer"; loteId: string };

export type ValidacionCuerpo = { ok: true; cuerpo: Cuerpo } | { ok: false; motivo: string };

const CAMPOS_ORIGEN = ["fuente", "medio", "campana", "camino"] as const;
const MAX_CAMPO_ORIGEN = 200;

/** Copia solo los campos conocidos del origen (texto corto). `undefined` y `null` son "sin origen"; cualquier otra forma, inválida. */
export function leerOrigen(x: unknown): Origen | null | "invalido" {
  if (x === undefined || x === null) return null;
  if (typeof x !== "object" || Array.isArray(x)) return "invalido";
  const o = x as Record<string, unknown>;
  const r: Origen = {};
  for (const campo of CAMPOS_ORIGEN) {
    const v = o[campo];
    if (v === undefined || v === null) continue;
    if (typeof v !== "string" || v.length > MAX_CAMPO_ORIGEN) return "invalido";
    r[campo] = v;
  }
  return Object.keys(r).length > 0 ? r : null;
}

/** Valida el cuerpo del pedido: acción, `loteId` contra el loteo, opción, forma de `vio` (≤ 4 KB) y origen. */
export function validarCuerpo(cuerpo: unknown): ValidacionCuerpo {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) return { ok: false, motivo: "Cuerpo inválido." };
  const c = cuerpo as Record<string, unknown>;
  if (c.accion !== "reservar" && c.accion !== "pagar" && c.accion !== "deshacer") return { ok: false, motivo: "Acción desconocida." };
  if (typeof c.loteId !== "string" || !listarLotes().some((l) => l.id === c.loteId)) return { ok: false, motivo: "Lote desconocido." };
  const loteId = c.loteId;
  if (c.accion !== "reservar") return { ok: true, cuerpo: { accion: c.accion, loteId } };
  if (typeof c.opcion !== "string" || !(OPCIONES_COMPRA as readonly string[]).includes(c.opcion)) return { ok: false, motivo: "Opción desconocida." };
  const vio = leerVio(c.vio);
  if (!vio) return { ok: false, motivo: "Lo que la persona vio no tiene la forma esperada." };
  if (new TextEncoder().encode(JSON.stringify(vio)).length > MAX_VIO_BYTES) return { ok: false, motivo: "Lo que la persona vio es demasiado grande." };
  const origen = leerOrigen(c.origen);
  if (origen === "invalido") return { ok: false, motivo: "Origen inválido." };
  return { ok: true, cuerpo: { accion: "reservar", loteId, opcion: c.opcion as OpcionCompra, vio, origen } };
}

/** Toma el lock del lote hasta el final de la transacción. 64 bits, para no compartir espacio con otros locks. */
async function bloquear(tx: Tx, loteId: string): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`reserva:${loteId}`}, 0))`);
}

async function ultimoEvento(q: Consulta, loteId: string) {
  const [f] = await q
    .select({ evento: reservas.evento, personaId: reservas.personaId })
    .from(reservas)
    .where(eq(reservas.loteId, loteId))
    .orderBy(desc(reservas.registradoAt))
    .limit(1);
  return f ?? null;
}

/** Cada fila se escribe con la hora real del servidor, ya con el lock tomado: el orden del libro es el orden en que se tomó el lock. */
const AHORA = sql`clock_timestamp()`;

/** La primera visita de la persona se guarda una sola vez (`update … where origen is null`). */
export async function copiarOrigenSiVacio(tx: Tx, personaId: string, origen: Origen | null): Promise<void> {
  if (!origen) return;
  await tx.update(personas).set({ origen }).where(and(eq(personas.id, personaId), isNull(personas.origen)));
}

export type ResultadoEscritura = { ok: true } | { ok: false; motivo: MotivoRechazo };

/** Reserva el lote, ya dentro de una transacción. Solo si su estado de ejemplo es `disponible` y no hay reserva ni pago vigente. */
export async function reservarEn(tx: Tx, personaId: string, c: Extract<Cuerpo, { accion: "reservar" }>): Promise<ResultadoEscritura> {
  if (estadoDeLote(c.loteId) !== "disponible") return { ok: false, motivo: "no-disponible" };
  await bloquear(tx, c.loteId);
  const ultimo = await ultimoEvento(tx, c.loteId);
  if (ultimo && ultimo.evento !== "deshace") return { ok: false, motivo: "ya-reservado" };
  await tx.insert(reservas).values({
    personaId,
    hechoPor: personaId,
    loteId: c.loteId,
    evento: "reserva",
    opcion: c.opcion,
    vio: c.vio,
    origen: c.origen,
    registradoAt: AHORA,
  });
  await copiarOrigenSiVacio(tx, personaId, c.origen);
  return { ok: true };
}

/** Simula el pago de lo que la persona tiene reservado. */
export async function pagarEn(tx: Tx, personaId: string, loteId: string): Promise<ResultadoEscritura> {
  await bloquear(tx, loteId);
  const ultimo = await ultimoEvento(tx, loteId);
  if (!ultimo || ultimo.evento !== "reserva" || ultimo.personaId !== personaId) return { ok: false, motivo: "no-reservado" };
  await tx.insert(reservas).values({ personaId, hechoPor: personaId, loteId, evento: "paga", registradoAt: AHORA });
  return { ok: true };
}

/**
 * Deshace la reserva o el pago vigente. Sin nada vigente es un no-op. Lo ajeno solo lo libera un super admin: la fila lleva el
 * titular leído bajo el lock en `persona_id` y quien pide en `hecho_por`.
 */
export async function deshacerEn(tx: Tx, quien: { personaId: string; esSuperAdmin: boolean }, loteId: string): Promise<ResultadoEscritura> {
  await bloquear(tx, loteId);
  const ultimo = await ultimoEvento(tx, loteId);
  if (!ultimo || ultimo.evento === "deshace") return { ok: true };
  if (ultimo.personaId !== quien.personaId && !quien.esSuperAdmin) return { ok: false, motivo: "sin-permiso" };
  await tx.insert(reservas).values({ personaId: ultimo.personaId, hechoPor: quien.personaId, loteId, evento: "deshace", registradoAt: AHORA });
  return { ok: true };
}

export const reservar = (bd: Db, personaId: string, c: Extract<Cuerpo, { accion: "reservar" }>) => bd.transaction((tx) => reservarEn(tx, personaId, c));
export const pagar = (bd: Db, personaId: string, loteId: string) => bd.transaction((tx) => pagarEn(tx, personaId, loteId));
export const deshacer = (bd: Db, quien: { personaId: string; esSuperAdmin: boolean }, loteId: string) =>
  bd.transaction((tx) => deshacerEn(tx, quien, loteId));

/** Los lotes que no están disponibles: los de ejemplo más el último evento de cada lote del libro. Sin ninguna identidad. */
export async function estadosDeLotes(bd: Consulta): Promise<EstadosDeLaBase> {
  const ultimos = await bd
    .selectDistinctOn([reservas.loteId], { loteId: reservas.loteId, evento: reservas.evento })
    .from(reservas)
    .orderBy(reservas.loteId, desc(reservas.registradoAt));
  const estados: Record<string, "reservado" | "vendido"> = { ...ESTADOS_EJEMPLO } as Record<string, "reservado" | "vendido">;
  for (const u of ultimos) {
    if (estadoDeLote(u.loteId) !== "disponible") continue;
    if (u.evento === "reserva") estados[u.loteId] = "reservado";
    else if (u.evento === "paga") estados[u.loteId] = "vendido";
  }
  return estados;
}

/** Las compras vigentes de la persona, con la forma de `CompraLote[]`. */
export async function comprasDePersona(bd: Consulta, personaId: string): Promise<CompraLote[]> {
  const suyos = await bd.selectDistinct({ loteId: reservas.loteId }).from(reservas).where(eq(reservas.personaId, personaId));
  if (suyos.length === 0) return [];
  const filas = await bd
    .select()
    .from(reservas)
    .where(
      inArray(
        reservas.loteId,
        suyos.map((s) => s.loteId),
      ),
    )
    .orderBy(asc(reservas.registradoAt));
  type Vigente = { personaId: string; reserva: typeof reservas.$inferSelect; paga: typeof reservas.$inferSelect | null };
  const vigentes = new Map<string, Vigente>();
  for (const f of filas) {
    if (f.evento === "reserva") vigentes.set(f.loteId, { personaId: f.personaId, reserva: f, paga: null });
    else if (f.evento === "paga") {
      const v = vigentes.get(f.loteId);
      if (v) v.paga = f;
    } else vigentes.delete(f.loteId);
  }
  return [...vigentes.values()]
    .filter((v) => v.personaId === personaId)
    .map((v) => ({
      loteId: v.reserva.loteId,
      opcion: v.reserva.opcion ?? "solo-lote",
      paso: v.paga ? ("pagado" as const) : ("reservado" as const),
      reservadoEl: v.reserva.registradoAt.toISOString(),
      ...(v.paga ? { pagadoEl: v.paga.registradoAt.toISOString() } : {}),
      vio: leerVio(v.reserva.vio) ?? { precio: null, aporte: null, expensa: null, version: "sin dato" },
    }));
}

export type EventoDePersona = {
  loteId: string;
  evento: "reserva" | "paga" | "deshace";
  opcion: OpcionCompra | null;
  vio: unknown;
  origen: unknown;
  registradoAt: string;
  /** Verdadero si la fila la agregó otra persona (el equipo, al liberar): nunca se exporta el id de quien fue. */
  liberadoPorElEquipo: boolean;
};

/** Todos los eventos de reserva de la persona (también `deshace`), para la descarga de Mis datos. */
export async function eventosDePersona(bd: Consulta, personaId: string): Promise<EventoDePersona[]> {
  const filas = await bd.select().from(reservas).where(eq(reservas.personaId, personaId)).orderBy(asc(reservas.registradoAt));
  return filas.map((f) => ({
    loteId: f.loteId,
    evento: f.evento,
    opcion: f.opcion,
    vio: f.vio,
    origen: f.origen,
    registradoAt: f.registradoAt.toISOString(),
    liberadoPorElEquipo: f.hechoPor !== f.personaId,
  }));
}

/** La primera visita guardada de la persona, o null. */
export async function origenDePersona(bd: Consulta, personaId: string): Promise<unknown> {
  const [f] = await bd.select({ origen: personas.origen }).from(personas).where(eq(personas.id, personaId)).limit(1);
  return f?.origen ?? null;
}

/**
 * Borrado de Mis datos (reservas): en una transacción, `deshace` de cada lote que la persona tiene vigente y su `origen` en
 * null. Toma el lock de cada lote en orden de `lote_id` y relee el último evento bajo el lock (si en el medio pagó o deshizo
 * desde otra pestaña, se respeta lo último). El libro conserva todo lo anterior.
 */
export async function borrarActividadDeReservas(bd: Db, personaId: string): Promise<void> {
  await bd.transaction(async (tx) => {
    const suyos = await tx.selectDistinct({ loteId: reservas.loteId }).from(reservas).where(eq(reservas.personaId, personaId)).orderBy(asc(reservas.loteId));
    for (const { loteId } of suyos) await deshacerEn(tx, { personaId, esSuperAdmin: false }, loteId);
    await tx.update(personas).set({ origen: null }).where(eq(personas.id, personaId));
  });
}
