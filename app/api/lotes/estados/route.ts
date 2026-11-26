import { NextResponse } from "next/server";
import { db } from "@/lib/db/cliente";
import { estadosDeLotes } from "@/lib/lotes/servidor";

export const dynamic = "force-dynamic";

const SIN_CACHE = { "Cache-Control": "no-store" };

/**
 * Los lotes que no están disponibles, para cualquiera (las páginas de lotes ya son visibles sin sesión): los estados de ejemplo
 * más lo que hay en el libro de reservas. Solo ids de lotes y estados: nunca de quién es una reserva (`lotes-en-la-base`).
 */
export async function GET() {
  try {
    return NextResponse.json({ ok: true, estados: await estadosDeLotes(await db()) }, { headers: SIN_CACHE });
  } catch {
    console.error("[lotes] la base no respondió al leer los estados");
    return NextResponse.json({ ok: false }, { status: 503, headers: SIN_CACHE });
  }
}
