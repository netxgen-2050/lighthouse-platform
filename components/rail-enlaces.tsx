"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { ayudaDeRuta, puedeRuta } from "@/lib/permisos/niveles";
import { esActivo } from "@/lib/ruta-activa";
import { useSesion } from "./sesion/contexto";

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

const CLASE_ITEM =
  "flex flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 text-center text-[0.625rem] font-medium leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-xs";
const CLASE_PASTILLA =
  "rounded-full border border-on-deep-muted px-1 text-[0.5625rem] leading-tight text-on-deep-muted";

export function RailEnlaces({ grupos }: { grupos: GrupoRail[] }) {
  const ruta = usePathname();
  const { estado, nivel, nivelListo } = useSesion();
  // Mientras se verifica la sesión (o se lee el nivel) no se muestran destinos deshabilitados: la mayoría de las veces hay sesión guardada.
  const verificando = estado === "cargando" || (estado === "ok" && !nivelListo);
  const nivelActual = estado === "ok" ? nivel : "sin-cuenta";
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
              const deshabilitado = !verificando && !puedeRuta(nivelActual, e.href);
              if (deshabilitado) {
                // No es clicable: se anuncia como no disponible y, al lado, un enlace visible a Sumarte dice qué hacer.
                return (
                  <li key={e.href} className="flex flex-col items-stretch">
                    <span role="link" aria-disabled="true" className={`${CLASE_ITEM} cursor-not-allowed`}>
                      <span className="flex h-7 w-11 items-center justify-center rounded-full sm:w-12">
                        <Lock aria-hidden="true" size={18} />
                      </span>
                      <span className="break-words">{e.etiqueta}</span>
                    </span>
                    <Link
                      href={`/sumarte?volver=${encodeURIComponent(e.href)}`}
                      className={`${CLASE_PASTILLA} mx-auto w-fit max-w-full text-center underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold`}
                      aria-label={`${ayudaDeRuta(e.href)}: ${e.etiqueta}`}
                    >
                      {ayudaDeRuta(e.href)}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={e.href}>
                  <Link href={e.href} aria-current={activo ? "page" : undefined} className={CLASE_ITEM}>
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
                    {e.marca && <span className={CLASE_PASTILLA}>{e.marca}</span>}
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
