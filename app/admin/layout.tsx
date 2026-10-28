import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { SoloSuperAdmin } from "@/components/sesion/solo-super-admin";
import { exigirSuperAdmin } from "@/lib/sesion/pagina";
import { PestanasAdmin } from "./pestanas";

// El título es el mismo en las tres pestañas a propósito: el de cada página (por ejemplo "Pendientes") viajaría en la
// respuesta 403 de quien no es super admin, y esa respuesta no puede traer nada de la administración.
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
// Lee cookies: nada de /admin se guarda en caché ni se genera en el build.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await exigirSuperAdmin();
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
      <p className="text-sm font-medium text-muted">Administración · solo super admin</p>
      <PestanasAdmin />
      <SoloSuperAdmin>{children}</SoloSuperAdmin>
    </div>
  );
}
