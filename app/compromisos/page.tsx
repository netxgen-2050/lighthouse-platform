import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { Formulario } from "./formulario";

export const metadata: Metadata = { title: "Compromisos" };

export default function CompromisosPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">Compromisos</h1>
      <p className="mt-2 mb-4 text-muted">
        Publicá qué ofrecés o qué necesitás y el medio de intercambio (tiempo, bienes, plata o trueque). Los montos son orientativos; ningún pago es real.
      </p>
      <div className="grid gap-2">
        <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          Modo demostración: lo que registres queda solo en este navegador.
        </p>
        <AvisoEjemplo />
      </div>
      <Formulario />
    </div>
  );
}
