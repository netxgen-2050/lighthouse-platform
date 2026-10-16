import { NextResponse } from "next/server";
import { sesionDelPedido } from "@/lib/sesion/servidor";
import { limiteSinCuenta, origenPermitido } from "@/lib/reportes/limite";
import { armarCuerpo, armarEtiquetas, armarTitulo, esBot, REPO, validarReporte } from "@/lib/reportes/reporte";

export const dynamic = "force-dynamic";

/** Tamaño máximo del cuerpo: el peor caso legítimo ronda los 8.200 caracteres. */
const MAX_BYTES = 64 * 1024;

export async function POST(req: Request) {
  // Solo pedidos desde nuestras páginas: con otro Content-Type el navegador de un sitio ajeno
  // podría enviarlo sin preguntar; con un Origin de otro host, tampoco.
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Tipo de contenido no admitido." }, { status: 415 });
  }
  if (!origenPermitido(req.headers)) {
    return NextResponse.json({ ok: false, error: "Origen no permitido." }, { status: 403 });
  }

  // Tamaño: primero lo declarado y después los bytes realmente leídos (el encabezado puede faltar o mentir).
  const declarado = Number(req.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Pedido demasiado grande." }, { status: 413 });
  }
  let crudo: string;
  try {
    crudo = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }
  if (new TextEncoder().encode(crudo).length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Pedido demasiado grande." }, { status: 413 });
  }
  let entrada: unknown;
  try {
    entrada = JSON.parse(crudo);
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  // Bots: se responde como si estuviera bien, sin crear nada y sin contar para el límite.
  if (esBot(entrada)) return NextResponse.json({ ok: true, numero: 0 });

  // El modo lo decide el servidor: solo una sesión válida (200) es "con cuenta".
  const sesion = await sesionDelPedido(req);
  const sinCuenta = sesion.estado !== 200;

  // Si el pedido trae credenciales de sesión pero el servidor no las acepta (token vencido, error al leerlas),
  // la persona cree estar con cuenta y no vio el aviso de publicación: no se crea nada y el diálogo pasa al
  // modo sin cuenta para que lo lea y reenvíe. Sin credenciales, es un reporte sin cuenta como cualquier otro.
  if (sinCuenta && (req.headers.get("authorization") || req.headers.get("x-lh-prueba"))) {
    return NextResponse.json({ ok: false, sesion: false }, { status: 401 });
  }

  const r = validarReporte(entrada, { sinCuenta });
  if (!r.ok) return NextResponse.json({ ok: false, errores: r.errores }, { status: 400 });

  // El límite cuenta solo pedidos válidos sin cuenta, y se registra antes de llamar a GitHub.
  let clave = "";
  const ahora = Date.now();
  if (sinCuenta) {
    clave = limiteSinCuenta.claveDeIp(req.headers);
    const limite = limiteSinCuenta.intentar(clave, ahora);
    if (!limite.permitido) {
      console.error("[reportes] límite sin cuenta alcanzado");
      return NextResponse.json(
        { ok: false, reintentarEnSegundos: limite.reintentarEnSegundos },
        { status: 429, headers: { "Retry-After": String(limite.reintentarEnSegundos) } },
      );
    }
  }
  // Lo que no llegó a GitHub no consume cupo.
  const fallo = (status: number, cuerpo: Record<string, unknown>) => {
    if (sinCuenta) limiteSinCuenta.descontar(clave, ahora);
    return NextResponse.json(cuerpo, { status });
  };

  const token = process.env.REPORTES_GITHUB_TOKEN;
  if (!token) return fallo(503, { ok: false, configurado: false });

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "lighthouse-platform-reportes",
      },
      body: JSON.stringify({
        title: armarTitulo(r.reporte),
        body: armarCuerpo(r.reporte),
        labels: armarEtiquetas(r.reporte.tipo, {
          privacidad: r.reporte.privacidad === true,
          sinCuenta,
        }),
      }),
    });
    if (!res.ok) {
      // Solo el status y el message de GitHub: nunca el token, los headers ni el reporte.
      const motivo = await res
        .json()
        .then((d: { message?: unknown }) => (typeof d?.message === "string" ? d.message : "sin message"))
        .catch(() => "sin message");
      console.error(`[reportes] GitHub rechazó la creación del issue: ${res.status} ${motivo}`);
      return fallo(502, { ok: false, configurado: true });
    }
    const datos = (await res.json()) as { number?: unknown };
    if (typeof datos.number !== "number") return fallo(502, { ok: false, configurado: true });
    return NextResponse.json({ ok: true, numero: datos.number });
  } catch {
    return fallo(502, { ok: false, configurado: true });
  }
}
