"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendientes } from "@/lib/admin/usar-pendientes";

export const PESTANAS_ADMIN: readonly { href: string; etiqueta: string; contador?: boolean }[] = [
  { href: "/admin", etiqueta: "Pendientes", contador: true },
  { href: "/admin/personas", etiqueta: "Personas y roles" },
  { href: "/admin/comunidades", etiqueta: "Comunidades" },
];

/** Navegación entre páginas (no pestañas ARIA). La activa se marca por igualdad exacta, con negrita y subrayado. */
export function PestanasAdmin() {
  const ruta = usePathname();
  const pendientes = usePendientes();
  return (
    <nav aria-label="Secciones de la administración" className="mt-3 mb-5">
      <ul className="flex flex-wrap gap-2">
        {PESTANAS_ADMIN.map((p) => {
          const activa = ruta === p.href;
          const contador = p.contador ? (pendientes === undefined ? "" : ` · ${pendientes === null ? "sin dato" : pendientes}`) : "";
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                aria-current={activa ? "page" : undefined}
                className={`block rounded-full border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  activa ? "border-deep bg-surface-2 font-bold underline underline-offset-4" : "border-faint hover:bg-surface-2"
                }`}
              >
                {p.etiqueta}
                {contador}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
