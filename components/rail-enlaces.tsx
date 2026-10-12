"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { esActivo } from "@/lib/ruta-activa";

export type ItemRail = {
  href: string;
  etiqueta: string;
  icono: ReactNode;
  /** Estilo de botón principal (Sumarte). */
  destacado?: boolean;
  /** Marca corta debajo de la etiqueta (NetX: "Interno"). */
  marca?: string;
};

export type GrupoRail = {
  id: string;
  titulo: string;
  /** Si es false, el título solo lo leen los lectores de pantalla (el grupo es un botón destacado). */
  tituloVisible: boolean;
  items: ItemRail[];
};

export function RailEnlaces({ grupos }: { grupos: GrupoRail[] }) {
  const ruta = usePathname();
  return (
    <div className="flex flex-col items-stretch">
      {grupos.map((g) => (
        <div
          key={g.id}
          className="mt-2 border-t border-deep-2 pt-2 first:mt-0 first:border-t-0 first:pt-0"
        >
          <p
            id={`rail-grupo-${g.id}`}
            className={`${g.tituloVisible ? "hidden sm:block" : "sr-only"} mb-1 text-center text-[0.625rem] font-bold uppercase tracking-wide text-on-deep-muted`}
          >
            {g.titulo}
          </p>
          <ul aria-labelledby={`rail-grupo-${g.id}`} className="flex flex-col items-stretch gap-1">
            {g.items.map((e) => {
              const activo = esActivo(e.href, ruta);
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={activo ? "page" : undefined}
                    className="flex flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 text-center text-[0.625rem] font-medium leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-xs"
                  >
                    <span
                      className={`flex h-7 w-11 items-center justify-center rounded-full sm:w-12 ${
                        activo
                          ? "bg-on-deep text-deep"
                          : e.destacado
                            ? "bg-gold text-ink"
                            : "hover:bg-deep-2"
                      }`}
                    >
                      {e.icono}
                    </span>
                    <span className={`break-words ${activo ? "font-bold underline underline-offset-2" : ""} ${e.destacado ? "font-bold" : ""}`}>
                      {e.etiqueta}
                    </span>
                    {e.marca && (
                      <span className="rounded-full border border-on-deep-muted px-1 text-[0.5625rem] leading-tight text-on-deep-muted">
                        {e.marca}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
