import type { Metadata } from "next";
import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { MisDatosCliente } from "./mis-datos-cliente";

export const metadata: Metadata = { title: "Mis datos" };

export default function MisDatosPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">
        Privacidad<TerminoLegal clave="datos" />
      </p>
      <h1 className="text-3xl font-semibold">Mis datos</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Acá ejercés tus derechos sobre tus datos: descargarlos, retirar tu consentimiento o pedir que borren tu cuenta. Lo que
        decimos de tus datos está en la <Link className="underline" href="/privacidad">política de privacidad</Link>.
      </p>
      <MisDatosCliente />
    </div>
  );
}
