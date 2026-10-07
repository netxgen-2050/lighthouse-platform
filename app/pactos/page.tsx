import type { Metadata } from "next";
import Link from "next/link";
import { PactosCliente } from "./pactos-cliente";

export const metadata: Metadata = { title: "Pactos" };

export default function PactosPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Pactos · Valle Solar</p>
      <h1 className="text-3xl font-semibold">Tus pactos con la tribu</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Un pacto por cada forma de aportar. El agente lo redacta desde una plantilla y la tribu lo revisa. Todo es
        simulado: no se cobra nada y lo que elijas queda solo en este navegador.
      </p>
      <PactosCliente />
    </div>
  );
}
