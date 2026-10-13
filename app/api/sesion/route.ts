import { PrivyClient } from "@privy-io/server-auth";
import { NextResponse } from "next/server";
import { entornoDeSesion } from "@/lib/sesion/entorno";
import { parsearPersonas } from "@/lib/sesion/personas";
import { resolverSesion } from "@/lib/sesion/verificar";

export const dynamic = "force-dynamic";

function personasDelEntorno() {
  return parsearPersonas(process.env.LH_PERSONAS, (m) => console.warn(`[sesion] ${m}`));
}

function crearCliente() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const secreto = process.env.PRIVY_APP_SECRET;
  return appId && secreto ? new PrivyClient(appId, secreto) : null;
}

/** Quién sos: verifica el token de Privy y busca el email en `LH_PERSONAS`. 401 sin sesión, 403 fuera de la lista. */
export async function GET(req: Request) {
  const personas = personasDelEntorno();
  const r = await resolverSesion(
    { authorization: req.headers.get("authorization"), prueba: req.headers.get("x-lh-prueba") },
    personas,
    entornoDeSesion(),
    crearCliente,
  );
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
