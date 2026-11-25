"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { usePendientes } from "@/lib/admin/usar-pendientes";
import { useTextos } from "@/lib/idioma/cliente";
import { esActivo } from "@/lib/ruta-activa";
import { CLASE_ITEM, CLASE_PASTILLA } from "./rail-enlaces";
import { useSesion } from "./sesion/contexto";

/**
 * El ítem "Admin" del rail, con el contador de pendientes. No dibuja nada (ni bloqueado ni con candado) salvo para el super
 * admin con la sesión ya verificada. Es presentación: `/admin` responde 403 en el servidor aunque alguien lo dibuje a mano.
 */
export function RailAdmin({ href, etiqueta, titulo, icono }: { href: string; etiqueta: string; titulo: string; icono: ReactNode }) {
  const { estado, sesion } = useSesion();
  const ruta = usePathname();
  const pendientes = usePendientes();
  const t = useTextos("marco");
  if (estado !== "ok" || sesion?.rol !== "superadmin") return null;

  const activo = esActivo(href, ruta);
  const visible = pendientes === null ? "sin dato" : pendientes !== undefined && pendientes > 0 ? String(pendientes) : null;
  const nombre =
    pendientes === null
      ? `${etiqueta}, ${t.rail.pendientesSinDato}`
      : pendientes !== undefined && pendientes > 0
        ? `${etiqueta}, ${pendientes} ${t.rail.pendientes}`
        : etiqueta;
  return (
    <div className="mt-2 border-t border-deep-2 pt-2">
      <p id="rail-grupo-interno" className="mb-1 hidden text-center text-[0.625rem] font-bold uppercase tracking-wide text-on-deep-muted sm:block">
        {titulo}
      </p>
      <ul aria-labelledby="rail-grupo-interno" className="flex flex-col items-stretch gap-1">
        <li>
          <Link href={href} aria-current={activo ? "page" : undefined} aria-label={nombre} className={CLASE_ITEM}>
            <span
              className={`flex h-7 w-11 items-center justify-center rounded-full sm:w-12 ${activo ? "bg-on-deep text-deep" : "hover:bg-deep-2"}`}
            >
              {icono}
            </span>
            <span className={`break-words ${activo ? "font-bold underline underline-offset-2" : ""}`}>{etiqueta}</span>
            {visible && <span className={CLASE_PASTILLA}>{visible}</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
}
