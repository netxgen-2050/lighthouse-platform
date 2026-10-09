import type { Metadata } from "next";
import Link from "next/link";
import { AvisoEjemplo } from "@/components/aviso-ejemplo";
import { Recorrido } from "../recorrido";

export const metadata: Metadata = { title: "Mi recorrido" };

/** Enlace viejo: abre Mi recorrido con la pestaña Bitácora. */
export default function BitacoraPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="text-sm font-medium text-muted">Tu panel</p>
      <h1 className="text-3xl font-semibold">Mi recorrido</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Lo que sigue y lo que ya hiciste, en un solo lugar.
      </p>
      <AvisoEjemplo />
      <div className="mt-6">
        <Recorrido pestanaInicial="bitacora" />
      </div>
    </div>
  );
}
