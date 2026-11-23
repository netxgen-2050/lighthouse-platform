"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { itemActivo } from "@/lib/ruta-activa";

export type ItemRail = {
  href: string;
  etiqueta: string;
  icono: ReactNode;
  /** Rutas que también marcan el ítem como actual (Explorar abarca varias secciones). */
  secciones?: readonly string[];
};

/** Un destino marcado solo con color no se entiende: el actual lleva además negrita y subrayado. */
export const CLASE_ITEM =
  "flex flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 text-center text-xs font-medium leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
export const CLASE_PASTILLA =
  "rounded-full border border-on-deep-muted px-1 text-[0.5625rem] leading-tight text-on-deep-muted";

/** Los destinos principales del rail, sin títulos de grupo. Con la sesión o sin ella se ven todos habilitados. */
export function RailEnlaces({ items }: { items: ItemRail[] }) {
  const ruta = usePathname();
  const marcado = itemActivo(items, ruta);
  return (
    <ul className="flex flex-col items-stretch gap-1">
      {items.map((e) => {
        const activo = marcado === e;
        return (
          <li key={e.href}>
            <Link href={e.href} aria-current={activo ? "page" : undefined} className={CLASE_ITEM}>
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full ${activo ? "bg-on-deep text-deep" : "hover:bg-deep-2"}`}
              >
                {e.icono}
              </span>
              <span className={`break-words ${activo ? "font-bold underline underline-offset-2" : ""}`}>{e.etiqueta}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
