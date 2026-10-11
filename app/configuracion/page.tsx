import type { Metadata } from "next";
import Link from "next/link";
import { ConfiguracionCliente } from "./configuracion-cliente";

export const metadata: Metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <h1 className="text-3xl font-semibold">Configuración</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Tus preferencias se guardan solo en este navegador y se aplican al instante. Todavía no hay cuentas, así que no
        viajan con vos a otro dispositivo.
      </p>
      <ConfiguracionCliente />
    </div>
  );
}
