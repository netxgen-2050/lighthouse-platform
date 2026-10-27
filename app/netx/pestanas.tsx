"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const PESTANAS_NETX: readonly { href: string; etiqueta: string }[] = [
  { href: "/netx", etiqueta: "Resumen" },
  { href: "/netx/financiamiento", etiqueta: "Modelo de financiamiento" },
  { href: "/netx/simulador", etiqueta: "Simulador" },
  { href: "/netx/comunidad", etiqueta: "Comunidad y embudo" },
];

/** Navegación entre páginas (no pestañas ARIA). Ninguna se esconde según el rol. Activa = igualdad exacta de ruta. */
export function Pestanas() {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones de la Vista NetX" className="mb-5">
      <ul className="flex flex-wrap gap-2">
        {PESTANAS_NETX.map((p) => {
          const activa = ruta === p.href;
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
