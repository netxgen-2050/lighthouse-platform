import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_IDIOMA, VIGENCIA_COOKIE } from "@/lib/idioma/cookie";
import { resolverIdioma } from "@/lib/idioma/middleware";
import { intercambiarVerificador, PARAMETRO_VERIFICADOR } from "@/lib/sesion/proveedores/neon-auth-oauth";

/**
 * Idioma (ADR-004): `?lang=` fija la cookie y se quita de la dirección, y `/congreso` pasa a `/congreso/en` cuando el
 * idioma del pedido es inglés. Y la vuelta de Google con Neon Auth: cambia el verificador por la sesión (login-neon-auth).
 * No mira permisos. Si algo falla, deja pasar el pedido: nunca una página de error por el idioma ni por el login.
 */
export async function middleware(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.has(PARAMETRO_VERIFICADOR)) {
      const vuelta = await intercambiarVerificador(request);
      if (vuelta) {
        const cabeceras = new Headers();
        for (const cookie of vuelta.cookies) cabeceras.append("Set-Cookie", cookie);
        return NextResponse.redirect(vuelta.redirigir, { headers: cabeceras });
      }
    }
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
