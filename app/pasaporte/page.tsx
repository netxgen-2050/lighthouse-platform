import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { PasaporteCliente } from "./pasaporte-cliente";

export const metadata: Metadata = { title: "Pasaporte" };

export default function PasaportePage() {
  return (
    <div className="mx-auto max-w-6xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">
        Pasaporte<TerminoLegal clave="pasaporte" />
      </p>
      <h1 className="text-3xl font-semibold">Tu pasaporte</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Como un pasaporte con sellos: cada sello certifica algo y abre puertas concretas. Ves cuáles tenés, cuáles
        están en trámite y cómo conseguir el resto. Es una simulación: no se verifica ningún documento ni se cobra
        nada, y todo queda solo en este navegador.
      </p>
      <PasaporteCliente />
    </div>
  );
}
