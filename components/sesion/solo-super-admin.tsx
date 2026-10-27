"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSesion } from "./contexto";

/** Muestra el contenido solo al super admin; al resto le dice que no tiene acceso. */
export function SoloSuperAdmin({ children }: { children: ReactNode }) {
  const { sesion } = useSesion();
  if (sesion?.rol !== "superadmin") {
    return (
      <div className="mx-auto max-w-xl p-6 sm:p-10">
        <p className="mb-4 w-fit rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
          Prototipo interno · datos de ejemplo
        </p>
        <h1 className="text-2xl font-semibold">No tenés acceso a esta vista</h1>
        <p className="mt-3 text-muted">La administración es solo para el super admin del prototipo.</p>
        <p className="mt-4">
          <Link className="underline" href="/">
            Volver al inicio
          </Link>
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
