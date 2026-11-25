import { normalizarEmail } from "../personas";
import type { ClienteIdentidad, ResultadoProveedor } from "./puerto";

/** Lo que devuelve Neon Auth al pedir la sesión: el estado HTTP y el cuerpo ya leído (se simula en los tests). */
export type RespuestaSesionNeon = { estado: number; cuerpo: unknown };

/** Lo mínimo que usamos del SDK de Neon Auth en el servidor. */
export type ClienteNeonAuth = {
  sesion(req: Request): Promise<RespuestaSesionNeon>;
};

function aIdentidad(cuerpo: unknown): ResultadoProveedor {
  // Sin sesión, Better Auth responde 200 con `null` (o con `user` vacío).
  if (cuerpo === null || cuerpo === undefined) return null;
  if (typeof cuerpo !== "object") return "invalida";
  const { user } = cuerpo as { user?: unknown };
  if (user === null || user === undefined) return null;
  if (typeof user !== "object") return "invalida";
  const u = user as Record<string, unknown>;
  if (typeof u.id !== "string" || u.id === "" || typeof u.emailVerified !== "boolean") return "invalida";
  if (u.email !== null && u.email !== undefined && typeof u.email !== "string") return "invalida";
  const email = typeof u.email === "string" && u.email !== "" ? normalizarEmail(u.email) : null;
  return {
    proveedor: "neon-auth",
    idExterno: u.id,
    email,
    emailVerificado: u.emailVerified === true && email !== null,
    ...(typeof u.name === "string" && u.name !== "" ? { nombre: u.name } : {}),
  };
}

/**
 * Neon Auth: la sesión viaja en una cookie de nuestro dominio. Sin cookie de Neon Auth no se pregunta nada (`null`, sin
 * red). Si Neon Auth no responde, da un error o responde con otra forma, es `"invalida"` (la persona queda sin sesión).
 */
export function adaptadorNeonAuth(cliente: ClienteNeonAuth): ClienteIdentidad {
  return {
    proveedor: "neon-auth",
    async identidad(req) {
      if (!/neon-auth/i.test(req.headers.get("cookie") ?? "")) return null;
      let respuesta: RespuestaSesionNeon;
      try {
        respuesta = await cliente.sesion(req);
      } catch {
        return "invalida";
      }
      if (respuesta.estado === 401) return null;
      if (respuesta.estado !== 200) return "invalida";
      return aIdentidad(respuesta.cuerpo);
    },
  };
}

/** Cliente real: el kit sin framework del SDK (`Request`/`Response` estándar), con la caché de sesión firmada con nuestro secreto. */
export function crearClienteNeonAuth(baseUrl: string, cookieSecret: string): ClienteNeonAuth {
  return {
    async sesion(req) {
      const { handleAuthProxyRequest } = await import("@neondatabase/auth/server");
      const cabeceras = new Headers();
      const cookie = req.headers.get("cookie");
      if (cookie) cabeceras.set("cookie", cookie);
      const origen = req.headers.get("origin") ?? new URL(req.url).origin;
      cabeceras.set("origin", origen);
      const respuesta = await handleAuthProxyRequest({
        request: new Request(new URL("/api/auth/get-session", origen), { method: "GET", headers: cabeceras }),
        path: "get-session",
        baseUrl,
        cookieSecret,
      });
      let cuerpo: unknown;
      try {
        cuerpo = await respuesta.json();
      } catch {
        cuerpo = "ilegible";
      }
      return { estado: respuesta.status, cuerpo };
    },
  };
}
