"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { Idioma } from "@/lib/congreso/idioma";
import { guardarPreferenciaIdioma } from "@/lib/congreso/preferencia-idioma";

const OPCIONES: { idioma: Idioma; href: string; corto: string; largo: string }[] = [
  { idioma: "es", href: "/congreso", corto: "ES", largo: "Español" },
  { idioma: "en", href: "/congreso/en", corto: "EN", largo: "English" },
];

/**
 * Selector ES / EN de la barra del evento: dos enlaces (se pueden abrir en otra pestaña y el lector de pantalla
 * anuncia que navegan). El actual lleva `aria-current` y se distingue con subrayado y peso, no solo con color.
 * Al elegir, guarda la preferencia y pasa a la otra versión conservando la query y el ancla (`#tribus`).
 */
export function SelectorIdioma({ idioma }: { idioma: Idioma }) {
  const router = useRouter();

  function elegir(e: MouseEvent<HTMLAnchorElement>, destino: Idioma, href: string) {
    // Con Ctrl, Cmd, Shift o clic medio queda el comportamiento normal del enlace (otra pestaña, sin guardar).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    guardarPreferenciaIdioma(destino);
    if (destino === idioma) return;
    router.push(`${href}${window.location.search}${window.location.hash}`);
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
