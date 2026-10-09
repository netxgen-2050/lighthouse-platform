import type { Metadata } from "next";
import Link from "next/link";
import { BandejaCliente } from "./bandeja-cliente";

export const metadata: Metadata = { title: "Bandeja" };

export default function BandejaPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-3xl font-semibold">Tu bandeja</h1>
      <p className="mt-2 mb-6 text-muted">
        Acá aparece lo que te pasa en la plataforma: respuestas de las comunidades, rondas que se abren y avisos.
      </p>
      <BandejaCliente />
    </div>
  );
}
