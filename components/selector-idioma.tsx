"use client";

import { Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { useCambiarIdioma, useIdiomaDePlataforma } from "@/lib/idioma/cliente";
import { rutaParaIdioma } from "@/lib/idioma/rutas";
import type { Idioma } from "@/lib/idioma/tipos";

const OPCIONES: { idioma: Idioma; corto: string; largo: string }[] = [
  { idioma: "es", corto: "ES", largo: "Español" },
  { idioma: "en", corto: "EN", largo: "English" },
];

/** La query de la dirección sin `lang` (que el enlace pone de nuevo). */
function restoDeLaQuery(search: string): string {
  const params = new URLSearchParams(search);
  params.delete("lang");
  return params.toString();
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/**
 * Selector ES / EN, para todos (con y sin cuenta). Desde ux-celular ya no está fijo en la barra superior: vive en el menú del
 * avatar, en el menú "Más opciones" sin sesión, en la hoja Más (lista de filas de 44 px) y en Configuración. Son dos enlaces con `?lang=` (funcionan sin
 * JavaScript y en otra pestaña). Con un clic normal cambia el idioma sin recargar la página; con Ctrl, Cmd o clic medio
 * queda el enlace. El actual lleva `aria-current` y se distingue con fondo, negrita y tilde, no solo con color. El nombre del
 * grupo está en los dos idiomas a propósito: quien no entiende uno tiene que poder encontrarlo.
 */
export function SelectorIdioma() {
  const idioma = useIdiomaDePlataforma();
  const ruta = usePathname();
  const cambiar = useCambiarIdioma();
  // Los demás parámetros de la dirección (`?sel=`…) se conservan en el enlace. Se leen tras hidratar: el servidor no los
  // conoce aquí y `useSearchParams` obligaría a toda página del marco a esperar al navegador.
  const [resto, setResto] = useState("");
  useEffect(() => {
    // Lectura de la dirección del navegador tras hidratar.
    setResto(restoDeLaQuery(window.location.search));
  }, [ruta]);

  function enlace(destino: Idioma): string {
    const params = new URLSearchParams(resto);
    params.set("lang", destino);
    return `${ruta}?${params.toString()}`;
  }

  function elegir(e: MouseEvent<HTMLAnchorElement>, destino: Idioma) {
    // Con Ctrl, Cmd, Shift, Alt o clic medio queda el comportamiento normal del enlace.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // El Congreso tiene una dirección por idioma (ADR-003): se pasa a la del idioma elegido, con la query y el ancla.
    const direccion = rutaParaIdioma(ruta, destino);
    const nueva = direccion !== ruta ? `${direccion}${window.location.search}${window.location.hash}` : undefined;
    cambiar(destino, nueva);
  }

  return (
    <div
      role="group"
      aria-label="Idioma · Language"
      // Otras partes de la página cambian la query sin cambiar la ruta (`history.replaceState`): se relee al acercarse.
      onPointerEnter={() => setResto(restoDeLaQuery(window.location.search))}
      onFocus={() => setResto(restoDeLaQuery(window.location.search))}
      className="flex flex-col gap-1 text-base"
    >
      {OPCIONES.map((o) => {
        const actual = o.idioma === idioma;
        return (
          <a
            key={o.idioma}
            href={enlace(o.idioma)}
            lang={o.idioma}
            hrefLang={o.idioma}
            aria-current={actual ? "true" : undefined}
            onClick={(e) => elegir(e, o.idioma)}
            className={`flex min-h-11 items-center justify-between gap-2 rounded-[var(--radius-s)] px-3 ${FOCO} ${
              actual ? "bg-surface-2 font-bold" : "hover:bg-surface-2"
            }`}
          >
            <span aria-hidden="true">{o.largo}</span>
            {actual && <Check aria-hidden="true" size={18} />}
            <span className="sr-only">
              {o.corto} · {o.largo}
            </span>
          </a>
        );
      })}
    </div>
  );
}
