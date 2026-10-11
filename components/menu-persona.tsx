"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { UserRound } from "lucide-react";
import { CLAVES } from "@/lib/demo/claves";
import { cargarPerfil, iniciales } from "@/lib/perfil/modelo";
import { esActivo } from "@/lib/ruta-activa";

export type ItemMenu = { href: string; etiqueta: string; icono: ReactNode };

/** Iniciales del perfil guardado en este navegador; sin nombre, cadena vacía (se muestra el ícono genérico). */
function inicialesGuardadas(): string {
  try {
    const perfil = cargarPerfil(
      window.localStorage.getItem(CLAVES.perfilDatos),
      window.localStorage.getItem(CLAVES.perfil),
    );
    return iniciales(perfil.nombre);
  } catch {
    return "";
  }
}

/** Avatar de la persona (iniciales del perfil o ícono genérico) con el menú Perfil / Pasaporte / Mi recorrido / Configuración. */
export function MenuPersona({ items }: { items: ItemMenu[] }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [rutaAbierta, setRutaAbierta] = useState(ruta);
  const [siglas, setSiglas] = useState("");
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  // Al navegar, el menú se cierra (se ajusta durante el render, sin efecto).
  if (rutaAbierta !== ruta) {
    setRutaAbierta(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar; se repite al cambiar de página (el perfil pudo cambiar).
    setSiglas(inicialesGuardadas());
  }, [ruta]);

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
    <div ref={raiz} className="relative">
      <button
        ref={boton}
        type="button"
        aria-label="Menú de la persona"
        aria-expanded={abierto}
        aria-controls="menu-persona"
        aria-current={enMenu ? "page" : undefined}
        onClick={() => setAbierto((a) => !a)}
        className={`flex size-9 items-center justify-center rounded-full border text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
          enMenu ? "border-deep bg-deep text-on-deep" : "border-faint hover:bg-surface-2"
        }`}
      >
        {siglas ? <span aria-hidden="true">{siglas}</span> : <UserRound aria-hidden="true" size={20} />}
      </button>
      {abierto && (
        <div
          id="menu-persona"
          className="absolute right-0 top-full z-50 mt-2 w-52 max-w-[calc(100vw-1rem)] rounded-xl border border-line bg-surface p-2 text-sm text-ink shadow-lg"
        >
          <ul className="flex flex-col gap-1">
            {items.map((i) => {
              const activo = esActivo(i.href, ruta);
              return (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                      activo ? "font-bold underline underline-offset-2" : ""
                    }`}
                  >
                    {i.icono}
                    {i.etiqueta}
                  </Link>
                </li>
              );
            })}
            <li className="border-t border-line pt-1">
              <button
                type="button"
                disabled
                aria-describedby="salir-nota"
                className="w-full rounded-lg px-2 py-2 text-left opacity-70"
              >
                Salir
              </button>
              <p id="salir-nota" className="px-2 text-xs text-muted">
                Llega con el login.
              </p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
