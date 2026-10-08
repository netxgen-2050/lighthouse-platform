import type { Metadata } from "next";
import Link from "next/link";
import { TerminoEconomico } from "@/components/termino-economico";
import { SemillasCliente } from "./semillas-cliente";

export const metadata: Metadata = { title: "Semillas" };

export default function SemillasPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">
        Semillas
        <TerminoEconomico clave="semillas" /> · por comunidad
      </p>
      <h1 className="text-3xl font-semibold">Lo que sembraste y lo que te abre</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Las semillas no se venden ni se transfieren: son la cuenta de lo que cada quien aportó al proyecto. Todo es
        simulado y queda solo en este navegador.
      </p>
      <SemillasCliente />
    </div>
  );
}
