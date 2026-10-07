import { NextResponse } from "next/server";
import { armarCuerpo, armarEtiquetas, armarTitulo, esBot, REPO, validarReporte } from "@/lib/reportes/reporte";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
    if (!res.ok) return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
    const datos = (await res.json()) as { number?: unknown };
    if (typeof datos.number !== "number") {
      return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
    }
    return NextResponse.json({ ok: true, numero: datos.number });
  } catch {
    return NextResponse.json({ ok: false, configurado: true }, { status: 502 });
  }
}
