"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { alcanza, type Nivel } from "@/lib/permisos/niveles";
import { useSesion } from "./contexto";

export const CLASE_ENTRAR_PARA =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Dirección de Sumarte que, al sumarse, vuelve a la página donde estaba la persona. */
export function hrefSumarte(volver: string, para?: Nivel): string {
  return `/sumarte?volver=${encodeURIComponent(volver)}${para ? `&para=${para}` : ""}`;
}

/** ¿Hay que mostrar el llamado a sumarse? No mientras se verifica la sesión ni cuando el nivel ya alcanza. */
function haceFaltaSumarse(estado: string, nivel: Nivel, nivelListo: boolean, minimo: Nivel): boolean {
  if (estado === "cargando") return false;
  if (estado === "ok") return nivelListo && !alcanza(nivel, minimo);
  return true;
}

/**
 * Llamado "Sumate para…" que reemplaza una acción que el nivel actual no habilita. Lleva a Sumarte y, al sumarse,
 * la persona vuelve a esta misma página. Mientras se verifica la sesión no muestra nada.
 */
export function EntrarPara({
  texto,
  clase = CLASE_ENTRAR_PARA,
  nivelMinimo = "explorador",
}: {
  texto: string;
  clase?: string;
  /** Nivel que habilita la acción (por defecto, tener cuenta como Explorador). */
  nivelMinimo?: Nivel;
}) {
  const { estado, nivel, nivelListo } = useSesion();
  const ruta = usePathname();
  const router = useRouter();
  if (!haceFaltaSumarse(estado, nivel, nivelListo, nivelMinimo)) return null;
  return (
    <Link
      href={hrefSumarte(ruta, nivelMinimo)}
      className={clase}
      onClick={(ev) => {
        // La página puede haber cambiado su dirección sin navegar (por ejemplo la finca elegida en el mapa, `?sel=`):
        // se vuelve a la dirección de ese momento, con su query.
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
        ev.preventDefault();
        router.push(hrefSumarte(`${window.location.pathname}${window.location.search}`, nivelMinimo));
      }}
    >
      {texto}
    </Link>
  );
}

/**
 * Enlace a una página que necesita un nivel: si el nivel alcanza es un enlace común; si no, el llamado "Sumate para …".
 * Mientras se verifica la sesión no muestra nada (así nunca aparece una acción que no corresponde).
 */
export function EnlaceConCuenta({
  href,
  textoEntrar,
  clase,
  etiqueta,
  nivelMinimo = "explorador",
  children,
}: {
  href: string;
  textoEntrar: string;
  clase: string;
  /** `aria-label` del enlace cuando el nivel alcanza. */
  etiqueta?: string;
  nivelMinimo?: Nivel;
  children: ReactNode;
}) {
  const { estado, nivel, nivelListo } = useSesion();
  if (estado === "cargando" || (estado === "ok" && !nivelListo)) return null;
  if (haceFaltaSumarse(estado, nivel, nivelListo, nivelMinimo)) {
    return <EntrarPara texto={textoEntrar} clase={clase} nivelMinimo={nivelMinimo} />;
  }
  return (
    <Link href={href} aria-label={etiqueta} className={clase}>
      {children}
    </Link>
  );
}
