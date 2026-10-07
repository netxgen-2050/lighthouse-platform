import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { listarTribus } from "@/lib/tribus/datos";
import { Formulario } from "./formulario";

export const metadata: Metadata = { title: "Compromisos" };

export default function CompromisosPage() {
  const tribus = listarTribus().map((t) => ({ id: t.id, nombre: t.nombre }));
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <h1 className="text-3xl font-semibold">Compromisos</h1>
      <p className="mt-2 mb-4 text-muted">
        Registrá qué ofrecés y qué necesitás, en tiempo o en bienes.
      </p>
      <div className="grid gap-2">
        <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          Modo demostración: lo que registres queda solo en este navegador.
        </p>
        <AvisoEjemplo />
      </div>
      <Formulario tribus={tribus} />
    </div>
  );
}
