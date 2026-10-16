import { and, count, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/cliente";
import { cuentas, personas } from "@/lib/db/schema";
import { normalizarEmail, type Persona } from "./personas";
import type { Verificada } from "./verificar";

export type PersonaDeLaSesion =
  | { estado: 200; persona: Persona; personaId: string | null; idPersona: string }
  | { estado: 403 };

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FilaPersona = typeof personas.$inferSelect;

export function aPersona(f: FilaPersona): Persona {
  return {
    email: f.email,
    rol: f.rol,
    perfil: f.perfil,
    tribuAdmin: f.tribuAdmin === "valle" ? "valle" : null,
  };
}

const yaCargadas = new WeakSet<object>();

/**
 * `LH_PERSONAS` solo carga la tabla cuando está vacía (después manda la base). Va en una transacción; las cuentas se
 * vinculan en el primer login de cada persona.
 */
export async function cargaInicial(db: Db, deLaVariable: Persona[]): Promise<void> {
  if (deLaVariable.length === 0 || yaCargadas.has(db)) return;
  const [{ total }] = await db.select({ total: count() }).from(personas);
  if (total === 0) {
    await db.transaction(async (tx) => {
      await tx
        .insert(personas)
        .values(deLaVariable.map((p) => ({ email: normalizarEmail(p.email), rol: p.rol, perfil: p.perfil, tribuAdmin: p.tribuAdmin })))
        .onConflictDoNothing();
    });
  }
  yaCargadas.add(db);
}

/**
 * Quién es la persona de una identidad verificada, en este orden: por cuenta `(proveedor, id_externo)`; si no hay, por
 * email verificado en `personas` (y se vincula la cuenta); si no hay persona, es una persona nueva y NO se guarda nada
 * (nace con su primer consentimiento, ADR-005). Nunca se vincula una segunda cuenta del mismo proveedor ni por un email
 * sin verificar. Los 403 por vínculo no ponen el email en el log.
 */
export async function personaDeLaSesion(
  db: Db,
  verificada: Verificada,
  entorno: { LH_ACCESO?: string },
  log: (mensaje: string) => void = (m) => console.warn(`[sesion] ${m}`),
): Promise<PersonaDeLaSesion> {
  const { identidad, prueba } = verificada;
  const idPersona = identidad.idExterno;
  const ok = (f: FilaPersona): PersonaDeLaSesion =>
    f.acceso ? { estado: 200, persona: aPersona(f), personaId: f.id, idPersona } : { estado: 403 };

  // 1. Por cuenta (el modo de prueba no tiene cuentas).
  if (!prueba) {
    const [fila] = await db
      .select({ persona: personas })
      .from(cuentas)
      .innerJoin(personas, eq(personas.id, cuentas.personaId))
      .where(and(eq(cuentas.proveedor, identidad.proveedor), eq(cuentas.idExterno, identidad.idExterno)))
      .limit(1);
    if (fila) return ok(fila.persona);
  }

  // 2. Por email verificado.
  const email = identidad.email;
  if (email && identidad.emailVerificado) {
    const [existente] = await db
      .select()
      .from(personas)
      .where(sql`lower(${personas.email}) = ${normalizarEmail(email)}`)
      .limit(1);
    if (existente) {
      if (prueba) return ok(existente);
      if (!existente.acceso) return { estado: 403 };
      return vincular(db, existente, identidad, ok, log);
    }
  }

  // 3. Persona nueva: no se guarda nada. Con lista cerrada, quien no está en la tabla no entra.
  const limpio = email ? normalizarEmail(email) : "";
  if (entorno.LH_ACCESO?.trim().toLowerCase() === "lista" || !EMAIL_VALIDO.test(limpio)) return { estado: 403 };
  return { estado: 200, persona: { email: limpio, rol: "persona", perfil: "usuario", tribuAdmin: null }, personaId: null, idPersona };
}

async function vincular(
  db: Db,
  existente: FilaPersona,
  identidad: Verificada["identidad"],
  ok: (f: FilaPersona) => PersonaDeLaSesion,
  log: (mensaje: string) => void,
): Promise<PersonaDeLaSesion> {
  const rechazo = (): PersonaDeLaSesion => {
    log("otra cuenta del mismo proveedor con el email de una persona ya vinculada: no se vincula");
    return { estado: 403 };
  };
  return db.transaction(async (tx) => {
    const [yaTiene] = await tx
      .select({ id: cuentas.id })
      .from(cuentas)
      .where(and(eq(cuentas.personaId, existente.id), eq(cuentas.proveedor, identidad.proveedor)))
      .limit(1);
    if (yaTiene) return rechazo();
    // Sin objetivo: cubre los dos únicos (la cuenta y la persona+proveedor) si otra pestaña ganó la carrera.
    await tx
      .insert(cuentas)
      .values({ personaId: existente.id, proveedor: identidad.proveedor, idExterno: identidad.idExterno, emailVerificado: normalizarEmail(identidad.email ?? "") })
      .onConflictDoNothing();
    // Relectura por (proveedor, id_externo): si no aparece o es de otra persona, ganó otra cuenta del mismo proveedor.
    const [fila] = await tx
      .select({ personaId: cuentas.personaId })
      .from(cuentas)
      .where(and(eq(cuentas.proveedor, identidad.proveedor), eq(cuentas.idExterno, identidad.idExterno)))
      .limit(1);
    if (!fila || fila.personaId !== existente.id) return rechazo();
    return ok(existente);
  });
}
