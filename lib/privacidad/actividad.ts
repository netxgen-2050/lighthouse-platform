import type { Cabeceras } from "./consentimiento";

/**
 * Lo que el servidor guarda de la persona fuera del consentimiento (`/api/mis-datos/actividad`, `lotes-en-la-base`): sus eventos
 * de reserva y su origen. Es la ÚNICA llamada de la descarga de Mis datos para esta parte, y el borrado va antes del retiro.
 */
export type ActividadDelServidor = { reservas: unknown[]; origen: unknown };

type Fetch = typeof fetch;

/** La actividad de la persona. null si el servidor no respondió (la descarga la deja como "sin dato"). */
export async function pedirActividad(cabeceras: Cabeceras, pedir: Fetch = fetch): Promise<ActividadDelServidor | null> {
  try {
    const res = await pedir("/api/mis-datos/actividad", { headers: await cabeceras(), cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as { reservas?: unknown; origen?: unknown };
    return Array.isArray(j.reservas) ? { reservas: j.reservas, origen: j.origen ?? null } : null;
  } catch {
    return null;
  }
}

/** Libera los lotes de la persona y borra su origen en el servidor (el libro conserva las filas). false si no se pudo. */
export async function borrarActividadEnServidor(cabeceras: Cabeceras, pedir: Fetch = fetch): Promise<boolean> {
  try {
    const res = await pedir("/api/mis-datos/actividad", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...(await cabeceras()) },
      body: "{}",
      cache: "no-store",
      credentials: "same-origin",
    });
    return res.ok;
  } catch {
    return false;
  }
}
