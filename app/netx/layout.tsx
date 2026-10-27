import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Pestanas } from "./pestanas";

// Que una dirección compartida no termine en los buscadores (ADR-015).
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Sin SoloSuperAdmin: la Vista NetX es para toda persona con sesión (la Puerta del layout raíz decide con la capacidad
// `vista-netx`). Las operaciones del super admin están en /admin.
export default function NetxLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-6 sm:p-10">
      <p className="mb-2 text-sm">
        <Link className="underline" href="/">
          ← Inicio
        </Link>
      </p>
      <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Prototipo interno · datos de ejemplo
      </p>
      <Pestanas />
      {children}
    </div>
  );
}
