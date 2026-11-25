import type { CompraLote, EstadosDeLaBase, LoVisto } from "./compra";
import type { OpcionCompra } from "./modelo";

/**
 * ÚNICA puerta del navegador a las reservas y pagos SIMULADOS de la persona (`lotes-en-la-base`): habla con
 * `/api/lotes/reservas` y `/api/lotes/estados`. Nada se guarda en el navegador: la reserva vive en el servidor, para que un lote
 * reservado por alguien se vea reservado para todos. Nadie más llama a esas rutas (lo vigila `reservas-unica.test.ts`).
 *
 * Mis datos (descarga y borrado) NO pasa por acá: usa `/api/mis-datos/actividad`, que trae todos los eventos de la persona.
 */
export type SesionDeReservas = { estado: string; cabeceras: () => Promise<Record<string, string>> };

type Fetch = typeof fetch;

const hayPersona = (sesion: SesionDeReservas) => sesion.estado === "ok";

/** Por qué no se pudo escribir: un motivo del servidor (409) o `error` (sin sesión, sin consentimiento, sin red, la base falló). */
export type MotivoDeFallo = "no-disponible" | "ya-reservado" | "no-reservado" | "error";

export type RespuestaDeEscritura = { ok: true; compras: CompraLote[] } | { ok: false; motivo: MotivoDeFallo };

const MOTIVOS_409: readonly MotivoDeFallo[] = ["no-disponible", "ya-reservado", "no-reservado"];

/**
 * Las compras simuladas de la persona en sesión. Sin sesión no hay compras: una lista vacía. Si el servidor no responde o
 * responde mal, `null` (no se sabe): quien llama deja lo que tenía y nunca lo muestra como "no tenés reservas".
 */
export async function leerReservas(sesion: SesionDeReservas, pedir: Fetch = fetch): Promise<CompraLote[] | null> {
  if (!hayPersona(sesion)) return [];
  try {
    const res = await pedir("/api/lotes/reservas", { headers: await sesion.cabeceras(), cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as { compras?: CompraLote[] };
    return Array.isArray(j.compras) ? j.compras : null;
  } catch {
    return null;
  }
}

async function escribir(sesion: SesionDeReservas, cuerpo: Record<string, unknown>, pedir: Fetch): Promise<RespuestaDeEscritura> {
  if (!hayPersona(sesion)) return { ok: false, motivo: "error" };
  try {
    const res = await pedir("/api/lotes/reservas", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await sesion.cabeceras()) },
      body: JSON.stringify(cuerpo),
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 409) {
      const j = (await res.json().catch(() => null)) as { motivo?: string } | null;
      const motivo = MOTIVOS_409.find((m) => m === j?.motivo);
      return { ok: false, motivo: motivo ?? "error" };
    }
    if (!res.ok) return { ok: false, motivo: "error" };
    const j = (await res.json()) as { compras?: CompraLote[] };
    return Array.isArray(j.compras) ? { ok: true, compras: j.compras } : { ok: false, motivo: "error" };
  } catch {
    return { ok: false, motivo: "error" };
  }
}

export function reservarLote(
  sesion: SesionDeReservas,
  datos: { loteId: string; opcion: OpcionCompra; vio: LoVisto; origen?: Record<string, string> | null },
  pedir: Fetch = fetch,
): Promise<RespuestaDeEscritura> {
  return escribir(sesion, { accion: "reservar", ...datos }, pedir);
}

export const pagarLote = (sesion: SesionDeReservas, loteId: string, pedir: Fetch = fetch) => escribir(sesion, { accion: "pagar", loteId }, pedir);

export const deshacerLote = (sesion: SesionDeReservas, loteId: string, pedir: Fetch = fetch) => escribir(sesion, { accion: "deshacer", loteId }, pedir);

/** Los lotes que la base dice reservados o vendidos (de cualquier persona, sin saber de quién). null si no respondió. */
export async function leerEstados(pedir: Fetch = fetch): Promise<EstadosDeLaBase | null> {
  try {
    const res = await pedir("/api/lotes/estados", { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null;
    const j = (await res.json()) as { estados?: EstadosDeLaBase };
    return j.estados && typeof j.estados === "object" ? j.estados : null;
  } catch {
    return null;
  }
}
