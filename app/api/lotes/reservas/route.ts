import { NextResponse } from "next/server";
import { db } from "@/lib/db/cliente";
import { exigirConsentimiento } from "@/lib/privacidad/servidor";
import { comprasDePersona, deshacer, pagar, reservar, validarCuerpo, type ResultadoEscritura } from "@/lib/lotes/servidor";
import { moldeDeEscritura } from "@/lib/sesion/molde-escritura";
import { sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

// Un pedido real pesa unos cientos de bytes (con lo que la persona vio, menos de 4 KB): se corta con un margen.
const MAX_BYTES = 4 * 1024 + 512;
const SIN_CACHE = { "Cache-Control": "no-store" };

/**
 * Las reservas y pagos simulados de la persona en sesión (`lotes-en-la-base`). Pide sesión (401) y un consentimiento vigente
 * (403 `{ consentimiento: false }`). `GET` devuelve sus compras vigentes; `POST` reserva, paga o deshace un lote y devuelve las
 * compras nuevas, o 409 con el motivo. Un super admin puede deshacer (liberar) lo de otra persona. 503 sin el detalle si la base falla.
 */
export async function GET(req: Request) {
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
  try {
    const bd = await db();
    const c = await exigirConsentimiento(s, bd);
    if (c instanceof Response) return c;
    return NextResponse.json({ ok: true, compras: await comprasDePersona(bd, c.personaId) }, { headers: SIN_CACHE });
  } catch {
    console.error("[lotes] la base no respondió al leer las reservas");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}

export async function POST(req: Request) {
  const molde = moldeDeEscritura(req);
  if (molde) return molde;
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
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
  const v = validarCuerpo(cuerpo);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.motivo }, { status: 422, headers: SIN_CACHE });
  try {
    const bd = await db();
    const c = await exigirConsentimiento(s, bd);
    if (c instanceof Response) return c;
    const pedido = v.cuerpo;
    let r: ResultadoEscritura;
    if (pedido.accion === "reservar") r = await reservar(bd, c.personaId, pedido);
    else if (pedido.accion === "pagar") r = await pagar(bd, c.personaId, pedido.loteId);
    else r = await deshacer(bd, { personaId: c.personaId, esSuperAdmin: s.persona.rol === "superadmin" }, pedido.loteId);
    if (!r.ok) {
      return r.motivo === "sin-permiso"
        ? NextResponse.json({ ok: false }, { status: 403, headers: SIN_CACHE })
        : NextResponse.json({ ok: false, motivo: r.motivo }, { status: 409, headers: SIN_CACHE });
    }
    return NextResponse.json({ ok: true, compras: await comprasDePersona(bd, c.personaId) }, { headers: SIN_CACHE });
  } catch {
    // Sin el detalle del error: puede traer datos de la consulta.
    console.error("[lotes] falló la escritura de la reserva en la base");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}
