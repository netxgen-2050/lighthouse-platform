import { NextResponse } from "next/server";
import { db } from "@/lib/db/cliente";
import { agregarPersona, cambiarPersona, ErrorDeGestion, listarPersonas, validarCambios } from "@/lib/sesion/gestion";
import { sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store" };

/** Solo el super admin (verificado acá, en el servidor, contra la base) entra; devuelve su id o la respuesta de rechazo. */
async function exigirSuperAdmin(req: Request): Promise<{ actorId: string } | { rechazo: NextResponse }> {
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return { rechazo: NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE }) };
  if (s.persona.rol !== "superadmin" || !s.personaId) {
    return { rechazo: NextResponse.json({ ok: false, error: "Solo el super admin puede hacer esto." }, { status: 403, headers: SIN_CACHE }) };
  }
  return { actorId: s.personaId };
}

async function cuerpo(req: Request): Promise<Record<string, unknown>> {
  try {
    const j: unknown = JSON.parse(await req.text());
    if (typeof j === "object" && j !== null && !Array.isArray(j)) return j as Record<string, unknown>;
  } catch {
    /* cae al error de abajo */
  }
  throw new ErrorDeGestion(400, "Cuerpo inválido.");
}

function respuestaDeError(e: unknown) {
  if (e instanceof ErrorDeGestion) return NextResponse.json({ ok: false, error: e.message }, { status: e.estado, headers: SIN_CACHE });
  console.error("[personas] falló la operación en la base");
  return NextResponse.json({ ok: false, error: "No se pudo completar." }, { status: 503, headers: SIN_CACHE });
}

export async function GET(req: Request) {
  const a = await exigirSuperAdmin(req);
  if ("rechazo" in a) return a.rechazo;
  try {
    return NextResponse.json({ ok: true, personas: await listarPersonas(await db()) }, { headers: SIN_CACHE });
  } catch (e) {
    return respuestaDeError(e);
  }
}

export async function POST(req: Request) {
  const a = await exigirSuperAdmin(req);
  if ("rechazo" in a) return a.rechazo;
  try {
    const c = await cuerpo(req);
    const { email, ...resto } = c;
    const persona = await agregarPersona(await db(), a.actorId, email, validarCambios(resto));
    return NextResponse.json({ ok: true, persona }, { status: 201, headers: SIN_CACHE });
  } catch (e) {
    return respuestaDeError(e);
  }
}

export async function PATCH(req: Request) {
  const a = await exigirSuperAdmin(req);
  if ("rechazo" in a) return a.rechazo;
  try {
    const c = await cuerpo(req);
    const { id, ...resto } = c;
    const persona = await cambiarPersona(await db(), a.actorId, id, validarCambios(resto));
    return NextResponse.json({ ok: true, persona }, { headers: SIN_CACHE });
  } catch (e) {
    return respuestaDeError(e);
  }
}
