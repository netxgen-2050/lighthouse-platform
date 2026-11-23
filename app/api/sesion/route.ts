import { NextResponse } from "next/server";
import { sesionDelPedido } from "@/lib/sesion/servidor";

export const dynamic = "force-dynamic";

/**
 * Quién sos: verifica el token de Privy o la sesión de Neon Auth y busca a la persona en la base (`personas`, con sus cuentas
 * de login). Quien no está en la base entra como persona común sin que se guarde nada. 401 sin sesión; 403 sin email válido
 * o sin verificar, sin acceso o, con `LH_ACCESO=lista`, fuera de la lista; 503 si falta la base o el proveedor. `idPersona` es
 * la clave de los datos del navegador (`personas.id` cuando la persona existe); `clavesAnteriores`, las que tuvo antes
 * (login-neon-auth, design §4); `personaId` es el id de NetX en la base (null si la persona todavía no existe ahí).
 */
export async function GET(req: Request) {
  const r = await sesionDelPedido(req);
  if (r.estado !== 200) {
    return NextResponse.json({ ok: false }, { status: r.estado, headers: { "Cache-Control": "no-store" } });
  }
  const { persona, idPersona, personaId, clavesAnteriores } = r;
  return NextResponse.json(
    {
      ok: true,
      idPersona,
      clavesAnteriores,
      personaId,
      email: persona.email,
      rol: persona.rol,
      perfil: persona.perfil,
      tribuAdmin: persona.tribuAdmin,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
