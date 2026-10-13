import { NextResponse } from "next/server";
import { sesionDelPedido } from "@/lib/sesion/servidor";
import { armarCuerpo, armarEtiquetas, armarTitulo, esBot, REPO, validarReporte } from "@/lib/reportes/reporte";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Solo quien entró (con una sesión válida) puede crear issues (producción ya no tiene la protección de Vercel).
  const sesion = await sesionDelPedido(req);
  if (sesion.estado !== 200) return NextResponse.json({ ok: false, sesion: false }, { status: sesion.estado });

  let entrada: unknown;
  try {
    entrada = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  // Bots: se responde como si estuviera bien, sin crear nada.
  if (esBot(entrada)) return NextResponse.json({ ok: true, numero: 0 });

  const r = validarReporte(entrada);
  if (!r.ok) return NextResponse.json({ ok: false, errores: r.errores }, { status: 400 });

  const token = process.env.REPORTES_GITHUB_TOKEN;
  if (!token) return NextResponse.json({ ok: false, configurado: false }, { status: 503 });

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
        labels: armarEtiquetas(r.reporte.tipo),
      }),
    });
    if (!res.ok) {
      // Solo el status y el message de GitHub: nunca el token, los headers ni el reporte.
      const motivo = await res
        .json()
        .then((d: { message?: unknown }) => (typeof d?.message === "string" ? d.message : "sin message"))
        .catch(() => "sin message");
      console.error(`[reportes] GitHub rechazó la creación del issue: ${res.status} ${motivo}`);
      return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
    }
    const datos = (await res.json()) as { number?: unknown };
    if (typeof datos.number !== "number") {
      return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
    }
    return NextResponse.json({ ok: true, numero: datos.number });
  } catch {
    return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
  }
}
