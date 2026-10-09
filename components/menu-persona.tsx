"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { UserRound } from "lucide-react";
import { esActivo } from "@/lib/ruta-activa";

export type ItemMenu = { href: string; etiqueta: string; icono: ReactNode };

/** Avatar de la persona (ícono genérico: todavía no hay cuentas) con el menú Perfil / Pasaporte / Mi recorrido. */
export function MenuPersona({ items }: { items: ItemMenu[] }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaAbierta, setRutaAbierta] = useState(ruta);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Al navegar, el menú se cierra (se ajusta durante el render, sin efecto).
  if (rutaAbierta !== ruta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const alClicAfuera = (ev: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(ev.target as Node)) setAbierto(false);
    };
    // Si el foco sale del menú con Tab, el panel se cierra para no tapar el contenido.
    const alSalirFoco = (ev: FocusEvent) => {
      const destino = ev.relatedTarget as Node | null;
      if (destino && raiz.current && !raiz.current.contains(destino)) setAbierto(false);
    };
    const nodo = raiz.current;
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("mousedown", alClicAfuera);
    nodo?.addEventListener("focusout", alSalirFoco);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("mousedown", alClicAfuera);
      nodo?.removeEventListener("focusout", alSalirFoco);
    };
  }, [abierto]);

  const enMenu = items.some((i) => esActivo(i.href, ruta));

  return (
    <div ref={raiz} className="mx-auto mb-1">
      <button
        ref={boton}
        type="button"
        aria-label="Menú de la persona"
        aria-expanded={abierto}
        aria-controls="menu-persona"
        aria-current={enMenu ? "page" : undefined}
        onClick={() => setAbierto((a) => !a)}
        className={`flex h-9 w-12 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
          enMenu ? "bg-on-deep text-deep" : "hover:bg-deep-2"
        }`}
      >
        <UserRound aria-hidden="true" size={20} />
      </button>
      {abierto && (
        <div
          id="menu-persona"
          className="fixed bottom-3 left-[4.25rem] z-50 w-52 rounded-xl border border-deep-2 bg-deep p-2 text-sm text-on-deep shadow-lg sm:left-[5.25rem]"
        >
          <ul className="flex flex-col gap-1">
            {items.map((i) => {
              const activo = esActivo(i.href, ruta);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      activo ? "font-bold underline underline-offset-2" : ""
                    }`}
                  >
                    {i.icono}
                    {i.etiqueta}
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-deep-2 pt-1">
              <button
                type="button"
                disabled
                aria-describedby="salir-nota"
                className="w-full rounded-lg px-2 py-2 text-left opacity-70"
              >
                Salir
              </button>
              <p id="salir-nota" className="px-2 text-xs text-on-deep-muted">
                Llega con el login.
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
