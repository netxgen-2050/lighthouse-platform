import { and, asc, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, type Db } from "@/lib/db/cliente";
import { consentimientos, cuentas, personas } from "@/lib/db/schema";
import { normalizarEmail } from "@/lib/sesion/personas";
import type { Verificada } from "@/lib/sesion/verificar";
import { VERSION_POLITICA } from "./consentimiento";
import {
  CANALES_CONSENTIMIENTO,
  ESTADO_SIN_REGISTRO,
  type CanalRegistrado,
  type EleccionNovedades,
  type EstadoServidor,
  type FilaPublica,
} from "./estado";

/**
 * El consentimiento en el servidor (`consentimiento-en-la-base`, design §1 y §2): el libro `consentimientos` es de solo agregar
 * (la base rechaza UPDATE, DELETE y TRUNCATE) y el estado vigente es la última fila por tipo. Las escrituras van con el cliente
 * `neon-serverless` de `lib/db/cliente.ts` (el HTTP no tiene transacciones interactivas, que acá hacen falta por el lock).
 */

/** Cuánto antes del envío puede haberse dado la aceptación previa (design §2). */
export const VIGENCIA_ACEPTACION_MS = 5 * 60 * 1000;

/** Dos pedidos iguales dentro de esta ventana cuentan como uno (doble clic, reintento). */
const VENTANA_IDEMPOTENCIA_SEG = 10;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type Consulta = Db | Tx;
type FilaPersona = typeof personas.$inferSelect;
type Tipo = (typeof consentimientos.$inferSelect)["tipo"];

export type Pedido = {
  accion: "acepta" | "retira";
  canal: CanalRegistrado;
  version: string;
  aceptadoEnCliente: Date | null;
  novedades: EleccionNovedades;
};

export type ValidacionPedido = { ok: true; pedido: Pedido } | { ok: false; motivo: string };

function fechaValida(v: unknown): Date | null {
  if (typeof v !== "string" || v.length === 0 || v.length > 40) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? new Date(t) : null;
}

/**
 * Valida el cuerpo del pedido (design §2): versión vigente, canal conocido y, si trae una aceptación previa, que se haya dado
 * entre 0 y 5 minutos antes del envío, **medidos con el reloj del navegador contra sí mismo** (`enviadoEnCliente −
 * aceptadoEnCliente`): un reloj corrido no deja afuera a nadie. No mira la hora del servidor.
 */
export function validarPedido(cuerpo: unknown): ValidacionPedido {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) return { ok: false, motivo: "Cuerpo inválido." };
  const c = cuerpo as Record<string, unknown>;
  if (c.accion !== "acepta" && c.accion !== "retira") return { ok: false, motivo: "Acción desconocida." };
  if (typeof c.canal !== "string" || !(CANALES_CONSENTIMIENTO as readonly string[]).includes(c.canal)) return { ok: false, motivo: "Canal desconocido." };
  if (c.version !== VERSION_POLITICA) return { ok: false, motivo: "La versión de la política no es la vigente." };
  let novedades: EleccionNovedades = "sin-cambio";
  if (c.novedades !== undefined) {
    if (c.novedades !== "acepta" && c.novedades !== "retira" && c.novedades !== "sin-cambio") return { ok: false, motivo: "Novedades inválidas." };
    novedades = c.novedades;
  }
  let aceptadoEnCliente: Date | null = null;
  if (c.aceptadoEnCliente !== undefined) {
    aceptadoEnCliente = fechaValida(c.aceptadoEnCliente);
    const enviado = fechaValida(c.enviadoEnCliente);
    if (!aceptadoEnCliente || !enviado) return { ok: false, motivo: "La hora de la aceptación es inválida." };
    const diferencia = enviado.getTime() - aceptadoEnCliente.getTime();
    if (diferencia < 0 || diferencia > VIGENCIA_ACEPTACION_MS) return { ok: false, motivo: "La aceptación previa venció o está en el futuro." };
  }
  return { ok: true, pedido: { accion: c.accion, canal: c.canal as CanalRegistrado, version: c.version, aceptadoEnCliente, novedades } };
}

type Ultima = { evento: "acepta" | "retira"; version: string; canal: CanalRegistrado | null; registradoAt: Date; edadSeg: number };
type Ultimas = { politica: Ultima | null; terminos: Ultima | null; novedades: Ultima | null };

async function ultimaDe(q: Consulta, personaId: string, tipo: Tipo): Promise<Ultima | null> {
  const [f] = await q
    .select({
      evento: consentimientos.evento,
      version: consentimientos.version,
      canal: consentimientos.canal,
      registradoAt: consentimientos.registradoAt,
      edadSeg: sql<number>`extract(epoch from (clock_timestamp() - ${consentimientos.registradoAt}))`,
    })
    .from(consentimientos)
    .where(and(eq(consentimientos.personaId, personaId), eq(consentimientos.tipo, tipo)))
    .orderBy(desc(consentimientos.registradoAt))
    .limit(1);
  return f ? { ...f, edadSeg: Number(f.edadSeg) } : null;
}

async function ultimas(q: Consulta, personaId: string): Promise<Ultimas> {
  return {
    politica: await ultimaDe(q, personaId, "politica"),
    terminos: await ultimaDe(q, personaId, "terminos"),
    novedades: await ultimaDe(q, personaId, "novedades"),
  };
}

function aEstado(u: Ultimas): EstadoServidor {
  const { politica: p, terminos: t, novedades: n } = u;
  const vigente = p?.evento === "acepta" && t?.evento === "acepta" && p.version === VERSION_POLITICA && t.version === VERSION_POLITICA;
  const retirado = p?.evento === "retira" || t?.evento === "retira";
  return {
    general: vigente ? "vigente" : retirado ? "retirado" : "pendiente",
    version: p?.version ?? null,
    registradoAt: p?.registradoAt.toISOString() ?? null,
    canal: p?.canal ?? null,
    novedades: n?.evento === "acepta",
    novedadesRegistro: n ? { evento: n.evento, version: n.version, registradoAt: n.registradoAt.toISOString(), canal: n.canal } : null,
  };
}

/** El estado vigente de la persona (última fila por tipo). Sin persona todavía (o sin filas) es `pendiente`. */
export async function estadoConsentimiento(bd: Consulta, personaId: string | null): Promise<EstadoServidor> {
  if (!personaId) return ESTADO_SIN_REGISTRO;
  return aEstado(await ultimas(bd, personaId));
}

/** Todas las filas de la persona (también los retiros), para la descarga de Mis datos. */
export async function filasDePersona(bd: Consulta, personaId: string): Promise<FilaPublica[]> {
  const filas = await bd.select().from(consentimientos).where(eq(consentimientos.personaId, personaId)).orderBy(asc(consentimientos.registradoAt));
  return filas.map((f) => ({
    tipo: f.tipo,
    evento: f.evento,
    version: f.version,
    canal: f.canal,
    idioma: f.idioma,
    registradoAt: f.registradoAt.toISOString(),
    aceptadoEnCliente: f.aceptadoEnCliente?.toISOString() ?? null,
  }));
}

type Resolucion =
  | { tipo: "existe"; persona: FilaPersona; vincular: boolean }
  | { tipo: "nueva" }
  | { tipo: "rechazo" };

/**
 * Quién es la persona de la sesión, **solo leyendo** (mismas reglas que `personaDeLaSesion`): por cuenta `(proveedor, id_externo)`;
 * si no, por email verificado; si no, es nueva. Con una cuenta distinta del mismo proveedor ya vinculada a esa persona, o sin
 * acceso, es un rechazo (en el log sin el email).
 */
async function buscar(q: Consulta, v: Verificada, log: (m: string) => void): Promise<Resolucion> {
  const { identidad, prueba } = v;
  if (!prueba) {
    const [fila] = await q
      .select({ persona: personas })
      .from(cuentas)
      .innerJoin(personas, eq(personas.id, cuentas.personaId))
      .where(and(eq(cuentas.proveedor, identidad.proveedor), eq(cuentas.idExterno, identidad.idExterno)))
      .limit(1);
    if (fila) return fila.persona.acceso ? { tipo: "existe", persona: fila.persona, vincular: false } : { tipo: "rechazo" };
  }
  if (identidad.email && identidad.emailVerificado) {
    const [existente] = await q
      .select()
      .from(personas)
      .where(sql`lower(${personas.email}) = ${normalizarEmail(identidad.email)}`)
      .limit(1);
    if (existente) {
      if (!existente.acceso) return { tipo: "rechazo" };
      if (prueba) return { tipo: "existe", persona: existente, vincular: false };
      const [yaTiene] = await q
        .select({ id: cuentas.id })
        .from(cuentas)
        .where(and(eq(cuentas.personaId, existente.id), eq(cuentas.proveedor, identidad.proveedor)))
        .limit(1);
      if (yaTiene) {
        log("otra cuenta del mismo proveedor con el email de una persona ya vinculada: no se mezclan identidades");
        return { tipo: "rechazo" };
      }
      return { tipo: "existe", persona: existente, vincular: true };
    }
  }
  return { tipo: "nueva" };
}

function respuesta403(): Response {
  return NextResponse.json({ consentimiento: false }, { status: 403, headers: { "Cache-Control": "no-store" } });
}

/**
 * Toda ruta que escribe a nombre de una persona la llama primero (ADR-005, `consentimiento-alta` design §7.2). Devuelve
 * `{ ok: true, personaId }` si la persona tiene política y términos aceptados en la versión vigente; si no, la respuesta 403 con
 * `{ consentimiento: false }`. **Solo lee**: nunca vincula una cuenta ni crea filas (eso lo hacen `/api/sesion` y `registrar`).
 */
export async function exigirConsentimiento(
  sesion: { verificada: Verificada },
  base?: Db,
  log: (m: string) => void = (m) => console.warn(`[consentimiento] ${m}`),
): Promise<{ ok: true; personaId: string } | Response> {
  const bd = base ?? (await db());
  const r = await buscar(bd, sesion.verificada, log);
  if (r.tipo !== "existe") return respuesta403();
  const estado = await estadoConsentimiento(bd, r.persona.id);
  return estado.general === "vigente" ? { ok: true, personaId: r.persona.id } : respuesta403();
}

export type ResultadoRegistro = { ok: true; estado: EstadoServidor; personaId: string | null } | { ok: false; motivo: "sin-acceso" | "sin-consentimiento" };

export type OpcionesRegistro = {
  log?: (m: string) => void;
  /** Solo para tests: corre justo después de insertar a la persona nueva, dentro de la transacción (para forzar un error). */
  alInsertarPersona?: () => void | Promise<void>;
};

function codigoDe(e: unknown): string | undefined {
  const o = e as { code?: unknown; cause?: unknown } | null;
  if (typeof o?.code === "string") return o.code;
  return o?.cause ? codigoDe(o.cause) : undefined;
}

/** Qué fila de novedades corresponde escribir (design §1: la regla "no pisa" se calcula acá con la última fila). */
function novedadesAEscribir(eleccion: EleccionNovedades, canal: CanalRegistrado, ultima: Ultima | null): "acepta" | "retira" | null {
  if (eleccion === "sin-cambio") return null;
  if (eleccion === "acepta") return ultima?.evento === "acepta" ? null : "acepta";
  // Sin marcar: es la primera decisión si no hay ninguna; después solo la persona, desde Mis datos, puede dar de baja.
  if (ultima === null) return "retira";
  return canal === "mis-datos" && ultima.evento === "acepta" ? "retira" : null;
}

/**
 * Registra el pedido en **una transacción** (design §1): lock por identidad, persona nueva con su fila de `cuentas` (solo con
 * `acepta`; con el modo de prueba, sin `cuentas`), vínculo de la cuenta si la persona ya existía sin ella, idempotencia y las
 * filas en orden (retiro: novedades, política, términos). Un choque por único con otra pestaña se reintenta una vez.
 */
export async function registrar(
  bd: Db,
  verificada: Verificada,
  entorno: { LH_ACCESO?: string },
  pedido: Pedido,
  opciones: OpcionesRegistro = {},
): Promise<ResultadoRegistro> {
  for (let intento = 0; ; intento++) {
    try {
      return await bd.transaction((tx) => registrarEn(tx, verificada, entorno, pedido, opciones));
    } catch (e) {
      if (intento === 0 && codigoDe(e) === "23505") continue;
      throw e;
    }
  }
}

async function registrarEn(tx: Tx, verificada: Verificada, entorno: { LH_ACCESO?: string }, pedido: Pedido, opciones: OpcionesRegistro): Promise<ResultadoRegistro> {
  const log = opciones.log ?? ((m: string) => console.warn(`[consentimiento] ${m}`));
  const { identidad, prueba } = verificada;
  const claveLock = prueba ? `consentimiento:prueba:${normalizarEmail(identidad.email ?? "")}` : `consentimiento:${identidad.proveedor}:${identidad.idExterno}`;
  await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${claveLock}, 0))`);

  const r = await buscar(tx, verificada, log);
  if (r.tipo === "rechazo") return { ok: false, motivo: "sin-acceso" };

  let personaId: string;
  if (r.tipo === "nueva") {
    // Una persona nueva nace con su primer `acepta` (ADR-005): sin aceptar no se guarda nada.
    if (pedido.accion !== "acepta") return { ok: true, estado: ESTADO_SIN_REGISTRO, personaId: null };
    const email = normalizarEmail(identidad.email ?? "");
    if (entorno.LH_ACCESO?.trim().toLowerCase() === "lista" || !EMAIL_VALIDO.test(email) || !identidad.emailVerificado) return { ok: false, motivo: "sin-acceso" };
    const [nueva] = await tx.insert(personas).values({ email }).returning({ id: personas.id });
    personaId = nueva!.id;
    if (!prueba) await tx.insert(cuentas).values({ personaId, proveedor: identidad.proveedor, idExterno: identidad.idExterno, emailVerificado: email });
    await opciones.alInsertarPersona?.();
  } else {
    personaId = r.persona.id;
    if (r.vincular) {
      // Sin objetivo: cubre los dos únicos si otra pestaña ganó la carrera; después se relee para saber de quién es la cuenta.
      await tx
        .insert(cuentas)
        .values({ personaId, proveedor: identidad.proveedor, idExterno: identidad.idExterno, emailVerificado: normalizarEmail(identidad.email ?? "") })
        .onConflictDoNothing();
      const [fila] = await tx
        .select({ personaId: cuentas.personaId })
        .from(cuentas)
        .where(and(eq(cuentas.proveedor, identidad.proveedor), eq(cuentas.idExterno, identidad.idExterno)))
        .limit(1);
      if (!fila || fila.personaId !== personaId) {
        log("otra cuenta del mismo proveedor ganó la carrera al vincular: no se mezclan identidades");
        return { ok: false, motivo: "sin-acceso" };
      }
    }
  }

  const antes = await ultimas(tx, personaId);
  const filas: { tipo: keyof Ultimas; evento: "acepta" | "retira" }[] = [];
  // Una fila igual a la última del mismo tipo y escrita hace segundos no se repite.
  const repetida = (tipo: keyof Ultimas, evento: "acepta" | "retira") => {
    const u = antes[tipo];
    return u !== null && u.evento === evento && u.version === pedido.version && u.edadSeg < VENTANA_IDEMPOTENCIA_SEG;
  };

  if (pedido.accion === "acepta") {
    const yaVigente = aEstado(antes).general === "vigente";
    // Desde Mis datos solo se cambian las novedades: no se acepta el general a escondidas.
    if (!yaVigente && pedido.canal === "mis-datos") return { ok: false, motivo: "sin-consentimiento" };
    if (!yaVigente) {
      for (const tipo of ["politica", "terminos"] as const) if (!repetida(tipo, "acepta")) filas.push({ tipo, evento: "acepta" });
    }
    const nov = novedadesAEscribir(pedido.novedades, pedido.canal, antes.novedades);
    if (nov && !repetida("novedades", nov)) filas.push({ tipo: "novedades", evento: nov });
  } else {
    if (antes.novedades?.evento === "acepta" && !repetida("novedades", "retira")) filas.push({ tipo: "novedades", evento: "retira" });
    for (const tipo of ["politica", "terminos"] as const) {
      if (antes[tipo]?.evento === "acepta" && !repetida(tipo, "retira")) filas.push({ tipo, evento: "retira" });
    }
  }

  // Una a una y con la hora real del servidor, para que el orden de las filas quede en el libro.
  for (const f of filas) {
    await tx.insert(consentimientos).values({
      personaId,
      tipo: f.tipo,
      evento: f.evento,
      version: pedido.version,
      canal: pedido.canal,
      registradoAt: sql`clock_timestamp()`,
      aceptadoEnCliente: f.evento === "acepta" ? pedido.aceptadoEnCliente : null,
    });
  }
  return { ok: true, estado: await estadoConsentimiento(tx, personaId), personaId };
}
