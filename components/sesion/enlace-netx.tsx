"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { puedeCapacidad } from "@/lib/permisos/niveles";
import { useSesion } from "./contexto";

/** El enlace a NetX de la barra superior: lo ve toda persona con sesión (Vista NetX, para el equipo). */
export function EnlaceNetx({ href, etiqueta, icono }: { href: string; etiqueta: string; icono: ReactNode }) {
  const { estado, nivel } = useSesion();
  const t = useTextos("marco");
  if (estado !== "ok" || !puedeCapacidad(nivel, "vista-netx")) return null;
  return (
    <Link
      href={href}
      className="flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
    >
      {icono}
      {etiqueta}
      <span className="rounded-full border border-muted px-1.5 text-[0.6875rem] leading-tight text-muted">{t.barra.interno}</span>
    </Link>
  );
}
