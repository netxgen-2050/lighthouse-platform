import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { SelloTribu } from "@/components/sello-tribu";
import { listarTribus } from "@/lib/tribus/datos";
import { TEXTO_ESTADO } from "@/lib/tribus/tipos";

export const metadata: Metadata = { title: "Tribus del Lighthouse" };

export default function TribusPage() {
  const tribus = listarTribus();
  return (
    <main className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">Tribus del Lighthouse</h1>
      <p className="mt-2 mb-4 text-stone-700">Doce barrios, una tribu en cada uno. Encontrá la tuya.</p>
      <AvisoEjemplo />
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tribus.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tribus/${t.id}`}
              className="flex h-full gap-3 rounded-xl border border-stone-400 p-4 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              <SelloTribu iniciales={t.iniciales} estado={t.estado} />
              <span className="grid gap-1">
                <span className="font-semibold">{t.nombre}</span>
                <span className="text-sm text-stone-700">Barrio {t.barrio} · {t.foco}</span>
                {t.subtitulo && <span className="text-sm text-stone-600">{t.subtitulo}</span>}
                <span className="text-sm font-medium">Estado: {TEXTO_ESTADO[t.estado]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
