import type { Metadata } from "next";
import Link from "next/link";
import { PerfilCliente } from "./perfil-cliente";

export const metadata: Metadata = { title: "Tu perfil" };

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">← Inicio</Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <p className="text-sm font-medium text-muted">Mi lugar · perfil</p>
      <h1 className="text-3xl font-semibold">Tu perfil</h1>
      <p className="mt-2 mb-6 max-w-2xl text-muted">
        Quién sos, qué sabés hacer y cómo te gusta decidir. Sirve para que una comunidad te conozca antes de sumarte.
      </p>
      <PerfilCliente />
    </div>
  );
}
