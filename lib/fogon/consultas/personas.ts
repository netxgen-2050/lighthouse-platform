import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { Persona } from "./tipos";

/**
 * El nombre con que se muestra una persona del padrón de ejemplo ("Persona de ejemplo 3" / "Sample person 3", "Vos" / "You")
 * en el idioma de la página. Un nombre que no es de ejemplo se muestra tal cual.
 */
export function nombreDePersona(persona: Persona, idioma: Idioma): string {
  const t = textos("fogonConsultas", idioma).personas;
  if (persona.id === "vos") return t.vos;
  const n = /^p(\d+)$/.exec(persona.id)?.[1];
  return n && persona.nombre.startsWith("Persona de ejemplo") ? t.ejemplo(n) : persona.nombre;
}
