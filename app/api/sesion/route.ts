import { NextResponse } from "next/server";
import { personasDelEntorno, sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

/** Quién sos: verifica el token de Privy y busca el email en `LH_PERSONAS`. 401 sin sesión, 403 fuera de la lista. */
export async function GET(req: Request) {
  const personas = personasDelEntorno();
  const r = await sesionDelPedido(req);
  if (r.estado !== 200) {
    return NextResponse.json({ ok: false }, { status: r.estado, headers: { "Cache-Control": "no-store" } });
  }
  const { persona, idPersona } = r;
  return NextResponse.json(
    {
      ok: true,
      idPersona,
      email: persona.email,
      rol: persona.rol,
      perfil: persona.perfil,
      tribuAdmin: persona.tribuAdmin,
      // Solo el super admin recibe la lista completa (panel "Personas y roles").
      personas: persona.rol === "superadmin" ? personas : undefined,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
