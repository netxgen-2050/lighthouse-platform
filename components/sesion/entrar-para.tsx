"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSesion } from "./contexto";

export const CLASE_ENTRAR_PARA =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/**
 * Llamado a entrar que reemplaza una acción que necesita cuenta, en las páginas públicas.
 * Abre el login (Privy); al volver, la persona sigue en la misma página. Mientras se verifica la sesión no muestra nada.
 */
export function EntrarPara({ texto, clase = CLASE_ENTRAR_PARA }: { texto: string; clase?: string }) {
  const { estado, entrar } = useSesion();
  if (estado === "ok" || estado === "cargando") return null;
  return (
    <button type="button" className={clase} onClick={entrar}>
      {texto}
    </button>
  );
}

/**
 * Enlace a una página que necesita cuenta: con sesión es un enlace común; sin sesión, el llamado "Entrá para …".
 * Mientras se verifica la sesión no muestra nada (así nunca aparece una acción que no corresponde).
 */
export function EnlaceConCuenta({
  href,
  textoEntrar,
  clase,
  etiqueta,
  children,
}: {
  href: string;
  textoEntrar: string;
  clase: string;
  /** `aria-label` del enlace con sesión. */
  etiqueta?: string;
  children: ReactNode;
}) {
  const { estado } = useSesion();
  if (estado === "cargando") return null;
  if (estado !== "ok") return <EntrarPara texto={textoEntrar} clase={clase} />;
  return (
    <Link href={href} aria-label={etiqueta} className={clase}>
      {children}
    </Link>
  );
}
