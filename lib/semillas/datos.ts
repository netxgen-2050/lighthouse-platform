// Datos de ejemplo copiados de `V.semillas` del mock-up v6 (docs/referencia/netx-tribus-mockup-v6.html).
// Cada texto que escribe la plataforma tiene su inglés (borrador, pendiente de revisión nativa).
import type { Idioma } from "@/lib/idioma/tipos";

export const META_SEMBRADOR = 120;
/** Meses que cuenta el mock-up para el medidor de Sembrador/a activo/a. */
export const MESES = 3;

/** Compañeros de la comunidad a reconocer (los dos primeros de `peers` del mock-up). Son datos de ejemplo. */
export const COMPANEROS = [
  { nombre: "Martina", rol: "Huerta" },
  { nombre: "Joaquín", rol: "Carpintería" },
] as const;

/** Criterios de la ronda, de 1 a 5, con su explicación. La clave `cultura` es la del criterio "Aporte al grupo". */
export const DIMENSIONES = [
  ["rol", "Rol", "Cómo cumple con las responsabilidades de su trabajo."],
  [
    "cultura",
    "Aporte al grupo",
    "Su apertura, su energía y cómo sus comportamientos se alinean con la cultura del grupo.",
  ],
] as const;

export const PREGUNTA_PORQUE = "¿Por qué le das esta puntuación?";
export const MAX_RAZON = 500;

/** Inglés de los datos de ejemplo de la ronda (borrador a revisar: ver `lib/idioma/revision-nativa.ts`). */
const ROL_EN: Record<string, string> = { Huerta: "Vegetable garden", Carpintería: "Carpentry" };

/** Los compañeros a reconocer con el rol en el idioma de la página. El nombre propio no se traduce. */
export function companeros(idioma: Idioma): { nombre: string; rol: string }[] {
  return COMPANEROS.map((c) => ({ nombre: c.nombre, rol: idioma === "en" ? (ROL_EN[c.rol] ?? c.rol) : c.rol }));
}

const DIMENSIONES_EN = [
  ["rol", "Role", "How well they fulfil the responsibilities of their work."],
  [
    "cultura",
    "Contribution to the group",
    "Their openness, their energy and how their behavior aligns with the culture of the group.",
  ],
] as const;

export function dimensiones(idioma: Idioma): readonly (readonly [string, string, string])[] {
  return idioma === "en" ? DIMENSIONES_EN : DIMENSIONES;
}

export function preguntaPorque(idioma: Idioma): string {
  return idioma === "en" ? "Why are you giving this score?" : PREGUNTA_PORQUE;
}

/* Lo recibido ya no se guarda como ejemplo con nombres: se calcula con `lib/evaluacion/` (defensa g: solo agregado). */
