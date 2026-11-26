import { NextResponse } from "next/server";
import { db } from "@/lib/db/cliente";
import { borrarActividadDeReservas, eventosDePersona, origenDePersona } from "@/lib/lotes/servidor";
import { moldeDeEscritura } from "@/lib/sesion/molde-escritura";
import { sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store" };

/**
 * La actividad de la persona en sesión, para Mis datos (`lotes-en-la-base`). Pide sesión pero NO un consentimiento vigente (ADR-032):
 * ver y borrar lo propio es un derecho que no puede depender de aceptar de nuevo una política vencida (Ley 25.326, arts. 14 y 16).
 * `GET` devuelve todos sus eventos de reserva (también `deshace`; si lo liberó el equipo, sin el id de quien fue) y su origen.
 * `DELETE` agrega `deshace` de los lotes que tiene vigentes y pone su origen en null, en una transacción; el libro conserva todo.
 * Sin persona en la base (nunca aceptó) no hay nada: listas vacías y el DELETE no escribe.
 */
export async function GET(req: Request) {
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
  if (!s.personaId) return NextResponse.json({ ok: true, reservas: [], origen: null }, { headers: SIN_CACHE });
  try {
    const bd = await db();
    return NextResponse.json(
      { ok: true, reservas: await eventosDePersona(bd, s.personaId), origen: await origenDePersona(bd, s.personaId) },
      { headers: SIN_CACHE },
    );
  } catch {
    console.error("[mis-datos] la base no respondió al leer la actividad");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}

export async function DELETE(req: Request) {
  // Con la sesión en una cookie, el chequeo de `Origin` es lo que impide que otra página dispare el borrado.
  const molde = moldeDeEscritura(req);
  if (molde) return molde;
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return NextResponse.json({ ok: false }, { status: s.estado, headers: SIN_CACHE });
  if (!s.personaId) return NextResponse.json({ ok: true }, { headers: SIN_CACHE });
  try {
    await borrarActividadDeReservas(await db(), s.personaId);
    return NextResponse.json({ ok: true }, { headers: SIN_CACHE });
  } catch {
    console.error("[mis-datos] falló el borrado de la actividad en la base");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}
