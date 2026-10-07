import type { Metadata } from "next";
import Link from "next/link";
import { SumarteCliente } from "./sumarte-cliente";

export const metadata: Metadata = { title: "Sumarte" };

export default function SumartePage() {
  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Sumarte</p>
      <h1 className="text-3xl font-semibold">Elegí cómo sumarte</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Explorar es gratis. La membresía te abre las salas y los pactos. El Pase Fundador financia el Fondo Común del
        Lighthouse y te da voz y créditos. Cifras de ejemplo. Nada se cobra de verdad: todo lo que elijas acá es
        simulado y queda solo en este navegador.
      </p>
      <SumarteCliente />
    </div>
  );
}
