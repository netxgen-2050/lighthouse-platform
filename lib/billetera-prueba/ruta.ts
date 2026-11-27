import { NextResponse } from "next/server";
import { ErrorDeCandide, puertoCandide, type FirmaWebAuthn, type PuertoCandide } from "@/lib/integraciones/candide";
import { moldeDeEscritura } from "@/lib/sesion/molde-escritura";
import { sesionDelPedido } from "@/lib/sesion/servidor";
import { pruebaHabilitada } from "./habilitada";
import { llaveDeHex, type LlavePublica } from "./passkey";
import { sanear } from "./sanear";

const SIN_CACHE = { "Cache-Control": "no-store" };

type Contexto = { puerto: PuertoCandide; cuerpo: Record<string, unknown>; llave: LlavePublica | null; url: URL };

const json = (cuerpo: unknown, estado: number) => NextResponse.json(cuerpo, { status: estado, headers: SIN_CACHE });

const ESTADO_DE_ERROR: Record<ErrorDeCandide["tipo"], number> = {
  politica: 400,
  entrada: 400,
  estado: 409,
  "sin-configurar": 503,
  candide: 502,
};

/** La firma de la passkey tal como la manda el navegador: tres textos base64url de largo razonable. */
export function firmaDeCuerpo(v: unknown): FirmaWebAuthn | null {
  if (typeof v !== "object" || v === null) return null;
  const { authenticatorData, clientDataJSON, signature } = v as Record<string, unknown>;
  const ok = (t: unknown): t is string => typeof t === "string" && t.length > 0 && t.length <= 4096 && /^[A-Za-z0-9_-]+={0,2}$/.test(t);
  if (!ok(authenticatorData) || !ok(clientDataJSON) || !ok(signature)) return null;
  return { authenticatorData, clientDataJSON, signature };
}

async function leerCuerpo(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const j: unknown = JSON.parse(await req.text());
    if (typeof j === "object" && j !== null && !Array.isArray(j)) return j as Record<string, unknown>;
  } catch {
    /* cae a null */
  }
  return null;
}

/**
 * Cerca común de las rutas de la prueba, en este orden: 404 si no está habilitada (como si no existieran), molde de escritura,
 * super admin verificado en el servidor (401/403), cuerpo y llave pública validados (400). Recién ahí se llama al puerto.
 * Nada se guarda en caché y ningún error lleva URL ni clave.
 */
export async function rutaDeLaPrueba(
  req: Request,
  opciones: { metodo: "GET" | "POST"; conLlave: boolean },
  accion: (c: Contexto) => Promise<Record<string, unknown>>,
): Promise<NextResponse> {
  if (!pruebaHabilitada()) return new NextResponse(null, { status: 404, headers: SIN_CACHE });
  if (opciones.metodo === "POST") {
    const molde = moldeDeEscritura(req);
    if (molde) return molde;
  }
  const s = await sesionDelPedido(req);
  if (s.estado !== 200) return json({ ok: false }, s.estado);
  if (s.persona.rol !== "superadmin") return json({ ok: false, error: "Solo el super admin puede hacer esto." }, 403);

  let cuerpo: Record<string, unknown> = {};
  if (opciones.metodo === "POST") {
    const c = await leerCuerpo(req);
    if (!c) return json({ ok: false, error: "Cuerpo inválido." }, 400);
    cuerpo = c;
  }
  let llave: LlavePublica | null = null;
  if (opciones.conLlave) {
    llave = llaveDeHex(cuerpo);
    if (!llave) return json({ ok: false, error: "Llave pública inválida" }, 400);
  }
  try {
    const r = await accion({ puerto: puertoCandide(), cuerpo, llave, url: new URL(req.url) });
    return json({ ok: true, ...r }, 200);
  } catch (e) {
    if (e instanceof ErrorDeCandide) return json({ ok: false, error: e.message, tipo: e.tipo }, ESTADO_DE_ERROR[e.tipo]);
    console.error(`[billetera-prueba] ${sanear(e)}`);
    return json({ ok: false, error: "No se pudo completar." }, 500);
  }
}
