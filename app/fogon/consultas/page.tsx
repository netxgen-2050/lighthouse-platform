import type { Metadata } from "next";
import Link from "next/link";
import { ListaConsultas } from "./lista-consultas";

export const metadata: Metadata = { title: "Consultas del Fogón" };

export default function ConsultasPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/fogon">← Fogón</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Fogón · voto cuadrático</p>
      <h1 className="text-3xl font-semibold">Consultas</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Cada persona reparte 100 créditos de voz entre las opciones: poner n votos en una opción cuesta n² créditos, así
        se mide cuánto le importa algo a cada quien. El resultado es consultivo. Tu reparto queda solo en este navegador.
      </p>
      <ListaConsultas />
    </div>
  );
}
