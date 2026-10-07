"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { esActivo } from "@/lib/ruta-activa";

export type ItemRail = { href: string; etiqueta: string; icono: ReactNode };

export function RailEnlaces({ items }: { items: ItemRail[] }) {
  const ruta = usePathname();
  return (
    <ul className="flex flex-col items-stretch gap-1">
      {items.map((e) => {
        const activo = esActivo(e.href, ruta);
        return (
          <li key={e.href}>
            <Link
              href={e.href}
              aria-current={activo ? "page" : undefined}
              className="flex flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 text-center text-[0.625rem] font-medium leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-xs"
            >
              <span
                className={`flex h-7 w-11 items-center justify-center rounded-full sm:w-12 ${activo ? "bg-on-deep text-deep" : "hover:bg-deep-2"}`}
              >
                {e.icono}
              </span>
              <span className={`break-words ${activo ? "font-bold underline underline-offset-2" : ""}`}>
                {e.etiqueta}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
