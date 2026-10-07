import type { Metadata } from "next";
import Link from "next/link";
import { Entrevista } from "./entrevista";

export const metadata: Metadata = { title: "Tu perfil · Entrevista" };

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="text-sm font-medium text-muted">Encontrarse · entrevista</p>
      <h1 className="text-3xl font-semibold">Contale al agente quién sos</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Una conversación en lugar de un formulario. Cada respuesta se convierte en un dato de tu
        perfil que vos confirmás o corregís. En esta versión la propuesta es tu propia respuesta,
        resumida.
      </p>
      <Entrevista />
    </div>
  );
}
