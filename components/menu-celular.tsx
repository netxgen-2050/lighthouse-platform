"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { esActivoEnSecciones } from "@/lib/ruta-activa";
import type { ItemRail } from "./rail-enlaces";
import { useSesion } from "./sesion/contexto";

/**
 * El menú del celular (menos de 768 px): un botón "Menú" en la barra superior que abre un panel con los mismos destinos
 * principales que el rail. No es un diálogo modal (sin trampa de foco): Escape lo cierra y devuelve el foco al botón,
 * y elegir un destino lo cierra. Admin (solo super admin) se suma al final, como en el rail.
 */
export function MenuCelular({
  items,
  admin,
  etiquetaMenu,
  etiquetaNavegacion,
}: {
  items: ItemRail[];
  admin?: ItemRail;
  etiquetaMenu: string;
  etiquetaNavegacion: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const ruta = usePathname();
  const { estado, sesion } = useSesion();
  const verAdmin = admin && estado === "ok" && sesion?.rol === "superadmin";

  // Cambiar de página cierra el panel.
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus();
    }
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  const todos = verAdmin ? [...items, admin] : items;
  return (
    <div className="mr-auto md:hidden">
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls="menu-celular"
        onClick={() => setAbierto((a) => !a)}
        className="flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        {abierto ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        <span>{etiquetaMenu}</span>
      </button>
      {abierto && (
        <nav
          id="menu-celular"
          aria-label={etiquetaNavegacion}
          className="absolute left-0 top-full w-full border-b border-line bg-surface p-2 shadow-md"
        >
          <ul className="flex flex-col">
            {todos.map((e) => {
              const activo = esActivoEnSecciones(e.href, e.secciones, ruta);
              return (
                <li key={e.href}>
                  <Link
                    href={e.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${activo ? "bg-surface-2 font-bold underline underline-offset-4" : ""}`}
                  >
                    {e.icono}
                    <span>{e.etiqueta}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
