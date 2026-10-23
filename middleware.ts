import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_IDIOMA, VIGENCIA_COOKIE } from "@/lib/idioma/cookie";
import { resolverIdioma } from "@/lib/idioma/middleware";

/**
 * Solo idioma (ADR-004): `?lang=` fija la cookie y se quita de la dirección, y `/congreso` pasa a `/congreso/en` cuando el
 * idioma del pedido es inglés. No mira sesión ni permisos. Si algo falla, deja pasar el pedido: nunca una página de error
 * por el idioma.
 */
export function middleware(request: NextRequest) {
  try {
    const r = resolverIdioma(
      request.nextUrl,
      request.cookies.get(COOKIE_IDIOMA)?.value,
      request.headers.get("accept-language"),
    );
    if (!r.redirigir) return NextResponse.next();
    const respuesta = NextResponse.redirect(r.redirigir, 307);
    for (const [nombre, valor] of Object.entries(r.cabeceras ?? {})) respuesta.headers.set(nombre, valor);
    if (r.cookie) {
      respuesta.cookies.set(COOKIE_IDIOMA, r.cookie, { path: "/", sameSite: "lax", maxAge: VIGENCIA_COOKIE });
    }
    return respuesta;
  } catch {
    return NextResponse.next();
  }
}

// Sin los recursos de Next, las rutas de la API ni los archivos con extensión.
export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
