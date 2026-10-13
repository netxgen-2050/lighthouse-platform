"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSesion } from "./contexto";

/** El enlace a NetX de la barra superior: solo lo ve el super admin. */
export function EnlaceNetx({ href, etiqueta, icono }: { href: string; etiqueta: string; icono: ReactNode }) {
  const { estado, sesion } = useSesion();
  if (estado !== "ok" || sesion?.rol !== "superadmin") return null;
  return (
    <Link
      href={href}
      className="flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
    >
      {icono}
      {etiqueta}
      <span className="rounded-full border border-muted px-1.5 text-[0.6875rem] leading-tight text-muted">Interno</span>
    </Link>
  );
}
