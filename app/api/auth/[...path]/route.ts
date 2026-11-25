import { NextResponse } from "next/server";
import { neonAuthConfigurado } from "@/lib/sesion/proveedores/neon-config";

export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ path: string[] }> };
type Manejador = (req: Request, ctx: Contexto) => Promise<Response>;

let avisado = false;

function noDisponible(): Response {
  // Se avisa una vez en el log, sin valores de las variables.
  if (!avisado) {
    avisado = true;
    console.error("[auth] faltan NEON_AUTH_BASE_URL o NEON_AUTH_COOKIE_SECRET (32 caracteres o más): el login de Neon Auth no está disponible");
  }
  return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

/**
 * Manejador del SDK de Neon Auth: el navegador habla con `/api/auth/*` y este proxy lo reenvía al Auth de la rama de Neon,
 * poniendo la sesión en una cookie de nuestro dominio. Sin sus dos variables responde 503 y la persona sigue sin sesión.
 */
async function reenviar(metodo: "GET" | "POST" | "PUT" | "DELETE" | "PATCH", req: Request, ctx: Contexto): Promise<Response> {
  const config = neonAuthConfigurado();
  if (!config) return noDisponible();
  try {
    // El SDK se carga recién acá: sin Neon Auth configurado ni se evalúa.
    const { createNeonAuth } = await import("@neondatabase/auth/next/server");
    const auth = createNeonAuth({ baseUrl: config.baseUrl, cookies: { secret: config.secreto } });
    const manejador = auth.handler()[metodo] as Manejador;
    return await manejador(req, ctx);
  } catch {
    console.error("[auth] el manejador de Neon Auth falló");
    return NextResponse.json({ ok: false }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

export const GET = (req: Request, ctx: Contexto) => reenviar("GET", req, ctx);
export const POST = (req: Request, ctx: Contexto) => reenviar("POST", req, ctx);
