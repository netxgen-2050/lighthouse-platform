import type { Metadata } from "next";
import Link from "next/link";
import { FogonCliente } from "./fogon-cliente";

export const metadata: Metadata = { title: "Fogón" };

export default function FogonPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Fogón de decisiones</p>
      <h1 className="text-3xl font-semibold">Lo que se está decidiendo</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Cada decisión muestra dónde se decide, con qué regla y en qué norma se apoya. La plataforma facilita; la
        validez la da el reglamento, el contrato o el estatuto. Los votos son simulados y quedan solo en este
        navegador.
      </p>
      <FogonCliente />
    </div>
  );
}
