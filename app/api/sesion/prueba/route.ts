import { NextResponse } from "next/server";
import { entornoDeSesion } from "@/lib/sesion/entorno";
import { modoPruebaActivo, parsearPersonas } from "@/lib/sesion/personas";

export const dynamic = "force-dynamic";

/**
 * Para la pantalla de entrada: si el modo de prueba está activo (LH_AUTH_PRUEBA=1 y no es producción de Vercel),
 * lista los emails para "Entrar como…". Si no, responde `{ activo: false }` sin ningún email.
 */
export async function GET() {
  const cabeceras = { "Cache-Control": "no-store" };
  if (!modoPruebaActivo(entornoDeSesion())) return NextResponse.json({ activo: false, emails: [] }, { headers: cabeceras });
  const emails = parsearPersonas(process.env.LH_PERSONAS).map((p) => p.email);
  return NextResponse.json({ activo: true, emails }, { headers: cabeceras });
}
