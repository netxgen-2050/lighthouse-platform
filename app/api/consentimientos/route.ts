import { NextResponse } from "next/server";
import { db } from "@/lib/db/cliente";
import { estadoConsentimiento, filasDePersona, registrar, validarPedido } from "@/lib/privacidad/servidor";
import { entornoDeSesion } from "@/lib/sesion/entorno";
import { moldeDeEscritura } from "@/lib/sesion/molde-escritura";
import { sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

// Un pedido real pesa unos cientos de bytes: 2 KB sobran y cortan los cuerpos abusivos.
const MAX_BYTES = 2 * 1024;
const SIN_CACHE ={ "Cache-Control": "no-store" };

/**
 * El consentimiento de la persona en sesión, guardado en el libro `consentimientos` (consentimiento-en-la-base). `GET` devuelve
 * el estado vigente (con `?filas=1`, también todas las filas de la persona, para la descarga de Mis datos); `POST` registra
 * `acepta` o `retira`. 401 sin sesión, 403 sin acceso, 422 si el pedido no vale, 503 si la base falla (la persona sigue anónima).
 * Esta ruta y `/api/sesion` son las únicas que escriben o leen sin exigir un consentimiento vigente.
 */
export async function GET(req: Request) {
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
  try {
    const base = await db();
    const estado = await estadoConsentimiento(base, s.personaId);
    const conFilas = new URL(req.url).searchParams.get("filas") === "1";
    // Una persona que todavía no existe en la base (no aceptó nunca) no tiene filas: es una lista vacía, no "sin dato".
    const filas = conFilas ? (s.personaId ? await filasDePersona(base, s.personaId) : []) : undefined;
    return NextResponse.json({ ok: true, estado, ...(filas ? { filas } : {}) }, { headers: SIN_CACHE });
  } catch {
    console.error("[consentimientos] la base no respondió al leer el estado");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}

export async function POST(req: Request) {
  const molde = moldeDeEscritura(req);
  if (molde) return molde;
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
  // Tamaño: primero lo declarado y después los bytes realmente leídos (el encabezado puede faltar o mentir).
  const declarado = Number(req.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Pedido demasiado grande." }, { status: 413, headers: SIN_CACHE });
  }
  let cuerpo: unknown;
  try {
    const crudo = await req.text();
    if (new TextEncoder().encode(crudo).length > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Pedido demasiado grande." }, { status: 413, headers: SIN_CACHE });
    }
    cuerpo = JSON.parse(crudo);
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 422, headers: SIN_CACHE });
  }
  const v = validarPedido(cuerpo);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.motivo }, { status: 422, headers: SIN_CACHE });
  try {
    const r = await registrar(await db(), s.verificada, entornoDeSesion(), v.pedido);
    if (!r.ok) {
      return r.motivo === "sin-acceso"
        ? NextResponse.json({ ok: false }, { status: 403, headers: SIN_CACHE })
        : NextResponse.json({ ok: false, consentimiento: false }, { status: 403, headers: SIN_CACHE });
    }
    return NextResponse.json({ ok: true, estado: r.estado }, { headers: SIN_CACHE });
  } catch {
    // Sin el detalle del error: puede traer datos de la consulta.
    console.error("[consentimientos] falló el registro en la base");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}
