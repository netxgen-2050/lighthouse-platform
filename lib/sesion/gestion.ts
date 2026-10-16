import { and, asc, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/cliente";
import { cambiosDeRol, personas } from "@/lib/db/schema";
import { normalizarEmail, PERFILES_PRUEBA, ROLES_SESION, type PerfilPrueba, type RolSesion } from "./personas";

/** Gestión de personas y roles (panel de `/netx`). Toda escritura va en una transacción y deja su fila en `cambios_de_rol`. */

export type PersonaGestionada = {
  id: string;
  email: string;
  rol: RolSesion;
  perfil: PerfilPrueba;
  tribuAdmin: "valle" | null;
  acceso: boolean;
};

export type Cambios = { rol?: RolSesion; perfil?: PerfilPrueba; tribuAdmin?: "valle" | null; acceso?: boolean };

export class ErrorDeGestion extends Error {
  constructor(
    readonly estado: 400 | 404 | 409,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Fila = typeof personas.$inferSelect;

const aGestionada = (f: Fila): PersonaGestionada => ({
  id: f.id,
  email: f.email,
  rol: f.rol,
  perfil: f.perfil,
  tribuAdmin: f.tribuAdmin === "valle" ? "valle" : null,
  acceso: f.acceso,
});

/** Un `admin-tribu` administra Valle Solar; los otros roles no administran ninguna tribu. */
function tribuSegunRol(rol: RolSesion, pedida: "valle" | null | undefined): "valle" | null {
  return rol === "admin-tribu" ? (pedida ?? "valle") : null;
}

export function validarCambios(entrada: unknown): Cambios {
  if (typeof entrada !== "object" || entrada === null) throw new ErrorDeGestion(400, "Pedido inválido.");
  const e = entrada as Record<string, unknown>;
  const c: Cambios = {};
  if (e.rol !== undefined) {
    if (!(ROLES_SESION as readonly unknown[]).includes(e.rol)) throw new ErrorDeGestion(400, "Rol inválido.");
    c.rol = e.rol as RolSesion;
  }
  if (e.perfil !== undefined) {
    if (!(PERFILES_PRUEBA as readonly unknown[]).includes(e.perfil)) throw new ErrorDeGestion(400, "Perfil inválido.");
    c.perfil = e.perfil as PerfilPrueba;
  }
  if (e.tribuAdmin !== undefined) {
    if (e.tribuAdmin !== null && e.tribuAdmin !== "valle") throw new ErrorDeGestion(400, "Tribu inválida.");
    c.tribuAdmin = e.tribuAdmin;
  }
  if (e.acceso !== undefined) {
    if (typeof e.acceso !== "boolean") throw new ErrorDeGestion(400, "Acceso inválido.");
    c.acceso = e.acceso;
  }
  return c;
}

export async function listarPersonas(db: Db): Promise<PersonaGestionada[]> {
  return (await db.select().from(personas).orderBy(asc(personas.email))).map(aGestionada);
}

export async function agregarPersona(db: Db, actorId: string, email: unknown, cambios: Cambios): Promise<PersonaGestionada> {
  const limpio = typeof email === "string" ? normalizarEmail(email) : "";
  if (!EMAIL_VALIDO.test(limpio)) throw new ErrorDeGestion(400, "Email inválido.");
  const rol = cambios.rol ?? "persona";
  return db.transaction(async (tx) => {
    const [ya] = await tx.select({ id: personas.id }).from(personas).where(sql`lower(${personas.email}) = ${limpio}`).limit(1);
    if (ya) throw new ErrorDeGestion(409, "Esa persona ya está en la lista.");
    const [fila] = await tx
      .insert(personas)
      .values({
        email: limpio,
        rol,
        perfil: cambios.perfil ?? "usuario",
        tribuAdmin: tribuSegunRol(rol, cambios.tribuAdmin),
        acceso: cambios.acceso ?? true,
      })
      .returning();
    await tx.insert(cambiosDeRol).values({ personaId: fila!.id, cambiadoPor: actorId, campo: "alta", valorAnterior: null, valorNuevo: rol });
    return aGestionada(fila!);
  });
}

/**
 * Cambia rol, perfil, tribu o acceso de una persona. Nunca deja la plataforma sin un super admin con acceso: la regla se
 * verifica dentro de la transacción, con las filas de super admin bloqueadas (dos cambios a la vez no pueden saltarla).
 */
export async function cambiarPersona(db: Db, actorId: string, id: unknown, cambios: Cambios): Promise<PersonaGestionada> {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new ErrorDeGestion(400, "Persona inválida.");
  return db.transaction(async (tx) => {
    // Bloquea a los super admin con acceso antes de decidir.
    const supers = await tx
      .select({ id: personas.id })
      .from(personas)
      .where(and(eq(personas.rol, "superadmin"), eq(personas.acceso, true)))
      .for("update");
    const [actual] = await tx.select().from(personas).where(eq(personas.id, id)).limit(1).for("update");
    if (!actual) throw new ErrorDeGestion(404, "No encontramos a esa persona.");

    const rol = cambios.rol ?? actual.rol;
    const acceso = cambios.acceso ?? actual.acceso;
    const siguiente = {
      rol,
      perfil: cambios.perfil ?? actual.perfil,
      tribuAdmin: tribuSegunRol(rol, cambios.tribuAdmin ?? (actual.tribuAdmin === "valle" ? "valle" : null)),
      acceso,
    };

    const eraSuper = actual.rol === "superadmin" && actual.acceso;
    const seguiraSiendo = siguiente.rol === "superadmin" && siguiente.acceso;
    if (eraSuper && !seguiraSiendo && supers.filter((s) => s.id !== actual.id).length === 0) {
      throw new ErrorDeGestion(409, "No se puede: la plataforma tiene que tener siempre al menos un super admin con acceso.");
    }

    const diferencias: { campo: string; antes: string; despues: string }[] = [];
    if (siguiente.rol !== actual.rol) diferencias.push({ campo: "rol", antes: actual.rol, despues: siguiente.rol });
    if (siguiente.perfil !== actual.perfil) diferencias.push({ campo: "perfil", antes: actual.perfil, despues: siguiente.perfil });
    if (siguiente.tribuAdmin !== (actual.tribuAdmin ?? null)) {
      diferencias.push({ campo: "tribu_admin", antes: actual.tribuAdmin ?? "ninguna", despues: siguiente.tribuAdmin ?? "ninguna" });
    }
    if (siguiente.acceso !== actual.acceso) diferencias.push({ campo: "acceso", antes: String(actual.acceso), despues: String(siguiente.acceso) });
    if (diferencias.length === 0) return aGestionada(actual);

    const [fila] = await tx.update(personas).set({ ...siguiente, cambiadaAt: new Date() }).where(eq(personas.id, id)).returning();
    await tx.insert(cambiosDeRol).values(
      diferencias.map((d) => ({ personaId: id, cambiadoPor: actorId, campo: d.campo, valorAnterior: d.antes, valorNuevo: d.despues })),
    );
    return aGestionada(fila!);
  });
}
