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

/** Un destino marcado solo con color no se entiende: el actual lleva además la píldora detrás del ícono y negrita. */
export const CLASE_ITEM =
  "group flex flex-col items-center gap-1 rounded-[var(--radius-s)] px-0.5 py-1.5 text-center text-xs font-medium leading-tight text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
export const CLASE_PASTILLA =
  "rounded-full border border-line px-1 text-[0.5625rem] leading-tight text-muted";
/** Píldora detrás del ícono: activa en `deep` con el ícono en `on-deep`; en reposo, `surface-2` solo al pasar el mouse. */
export const claseIcono = (activo: boolean) =>
  `flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-[var(--dur)] ${
    activo ? "bg-deep text-on-deep" : "group-hover:bg-surface-2"
  }`;
export const claseEtiqueta = (activo: boolean) => `break-words ${activo ? "font-bold text-ink" : ""}`;

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
              <span className={claseIcono(activo)}>{e.icono}</span>
              <span className={claseEtiqueta(activo)}>{e.etiqueta}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
