"use client";

import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";

/**
 * Un dato de ejemplo en los dos idiomas.
 * - En el idioma de la página: el texto.
 * - Si ese idioma no es el original, debajo va una nota visible ("Translated from Spanish" / "Traducido del inglés"),
 *   en texto, no solo con un ícono o un color.
 * - Si falta la traducción al inglés: nunca vacío; se muestra el español con `lang="es"`, la marca visible "ES" y un
 *   texto solo para lectores de pantalla que dice que solo está en español.
 */
export function TextoBilingue({ valor }: { valor: BilingueConOriginal }) {
  const idioma = useIdioma();
  const comunes = useTextos("comunes");
  const original = valor.original ?? "es";

  if (idioma === "en" && (valor.en === undefined || valor.en.trim() === "")) {
    return (
      <>
        <span lang="es">{valor.es}</span>
        <span
          aria-hidden="true"
          className="ml-1.5 rounded border border-muted px-1 align-middle text-[0.625rem] font-bold leading-tight text-muted"
        >
          ES
        </span>
        <span className="sr-only" lang="en">
          {comunes.soloEnEspanol}
        </span>
      </>
    );
  }

  const texto = idioma === "en" ? valor.en : valor.es;
  return (
    <>
      {texto}
      {original !== idioma && <span className="block text-xs text-muted">{comunes.traducidoDelOriginal}</span>}
    </>
  );
}
