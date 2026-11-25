export type LoginElegido = "privy" | "neon-auth";

/** Qué login abre el paso en este entorno: `neon-auth` solo si la variable lo dice; cualquier otro valor (o ninguno), `privy`. */
export function loginElegido(valor: string | undefined = process.env.NEXT_PUBLIC_LH_LOGIN): LoginElegido {
  return valor?.trim() === "neon-auth" ? "neon-auth" : "privy";
}

export const ERROR_CODIGO = "El código no es correcto o venció. Pedí uno nuevo.";
export const ERROR_GENERAL = "No pudimos iniciar sesión. Probá de nuevo.";
export const ERROR_NO_DISPONIBLE = "El login no está disponible en este momento.";

/**
 * El cliente del SDK de Neon Auth tira (`AuthError`/`AuthApiError`) cuando el servidor responde con error: el estado HTTP viene
 * en `status` o, si no, en el mensaje ("HTTP 503 Service Unavailable"). Sin ninguno de los dos (sin red, otra excepción), 0.
 */
export function estadoDeExcepcion(e: unknown): number {
  if (typeof e === "object" && e !== null) {
    const { status, message } = e as { status?: unknown; message?: unknown };
    if (typeof status === "number" && Number.isFinite(status)) return status;
    if (typeof message === "string") {
      const m = /\bHTTP (\d{3})\b/.exec(message);
      if (m) return Number(m[1]);
    }
  }
  return 0;
}

/**
 * Mensaje para la persona según lo que respondió Neon Auth (a través de nuestro manejador). `etapa`: al pedir el código, un
 * 4xx no dice nada del código; al escribirlo, un 400/401/403/422 es un código equivocado o vencido. Sin estado (sin red) o
 * 5xx, error general; 503 del manejador, "no disponible".
 */
export function mensajeDeError(estado: number | undefined, etapa: "pedir" | "entrar"): string {
  if (estado === 503) return ERROR_NO_DISPONIBLE;
  if (etapa === "entrar" && (estado === 400 || estado === 401 || estado === 403 || estado === 422)) return ERROR_CODIGO;
  return ERROR_GENERAL;
}
