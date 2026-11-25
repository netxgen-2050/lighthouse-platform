import { NextResponse } from "next/server";
import { origenPermitido } from "@/lib/reportes/limite";

/**
 * Molde de ADR-006 para lo que escribe: tipo de contenido JSON y `Origin` propio. Con la sesión de Neon Auth en una cookie, el
 * navegador la manda solo también desde otro sitio; sin este molde, esa página ajena podría escribir a nombre de la persona.
 * Devuelve la respuesta de rechazo, o null si el pedido pasa.
 */
export function moldeDeEscritura(req: Request): NextResponse | null {
  const sinCache = { "Cache-Control": "no-store" };
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Tipo de contenido no admitido." }, { status: 415, headers: sinCache });
  }
  if (!origenPermitido(req.headers)) {
    return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403, headers: sinCache });
  }
  return null;
}
