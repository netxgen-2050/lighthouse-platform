// Cómo se dicen las horas de un pacto en una línea: "10 h/mes" (fijas) o "entre 0 y 30 h/mes" (variables). Nunca un número
// inventado: un pacto variable no tiene una cifra de horas, tiene un rango.
import { formatearNumero } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { ContenidoPacto } from "./estado";

export function textoHorasDelPacto(c: Pick<ContenidoPacto, "modalidad" | "horas" | "rango">, idioma: Idioma): string {
  const n = (x: number) => formatearNumero(x, idioma);
  if (c.modalidad === "variable") {
    return idioma === "en" ? `between ${n(c.rango.min)} and ${n(c.rango.max)} h/month` : `entre ${n(c.rango.min)} y ${n(c.rango.max)} h/mes`;
  }
  return idioma === "en" ? `${n(c.horas)} h/month` : `${n(c.horas)} h/mes`;
}
