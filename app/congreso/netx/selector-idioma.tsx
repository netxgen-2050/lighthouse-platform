"use client";

import type { MouseEvent } from "react";
import type { Idioma } from "@/lib/congreso/idioma";
import { useCambiarIdioma } from "@/lib/idioma/cliente";

const OPCIONES: { idioma: Idioma; href: string; corto: string; largo: string }[] = [
  { idioma: "es", href: "/congreso", corto: "ES", largo: "Español" },
  { idioma: "en", href: "/congreso/en", corto: "EN", largo: "English" },
];

/**
 * Selector ES / EN de la barra del evento: dos enlaces (se pueden abrir en otra pestaña y el lector de pantalla
 * anuncia que navegan). El actual lleva `aria-current` y se distingue con subrayado y peso, no solo con color.
 * Al elegir, fija el idioma de toda la plataforma (el mismo que el selector de la barra superior) y pasa a la otra
 * versión conservando la query y el ancla (`#tribus`).
 */
export function SelectorIdioma({ idioma }: { idioma: Idioma }) {
  const cambiar = useCambiarIdioma();

  function elegir(e: MouseEvent<HTMLAnchorElement>, destino: Idioma, href: string) {
    // Con Ctrl, Cmd, Shift o clic medio queda el comportamiento normal del enlace (otra pestaña, sin guardar).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    // Aunque la versión sea la misma, la plataforma pasa a este idioma (por ejemplo, /congreso/en con la plataforma en español).
    cambiar(destino, destino === idioma ? undefined : `${href}${window.location.search}${window.location.hash}`);
  }

  return (
    <div className="ev-selector-idioma" role="group" aria-label="Idioma · Language">
      {OPCIONES.map((o) => (
        <a
          key={o.idioma}
          href={o.href}
          lang={o.idioma}
          hrefLang={o.idioma}
          aria-current={o.idioma === idioma ? "true" : undefined}
          onClick={(e) => elegir(e, o.idioma, o.href)}
        >
          <span aria-hidden="true">{o.corto}</span>
          <span className="ev-solo-lectores">
            {o.corto} · {o.largo}
          </span>
        </a>
      ))}
    </div>
  );
}
