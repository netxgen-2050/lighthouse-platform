import type { Metadata } from "next";
import Link from "next/link";
import { CanalesCliente } from "./canales-cliente";

export const metadata: Metadata = { title: "Canales" };

export default function CanalesPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/sumarte">← Sumarte</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Canales</p>
      <h1 className="text-3xl font-semibold">Qué te abre tu lugar en la red</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Tu plan, tu Pase Fundador, tu tribu, tu presencia y tu rol abren o cierran salas, foros, voz y créditos. Acá
        ves cuáles y por qué. Modo demostración: lo leemos de lo que elegiste en Sumarte en este navegador, y nada se
        cobra de verdad.
      </p>
      <CanalesCliente />
    </div>
  );
}
