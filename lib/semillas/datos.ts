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

/** Reconocimiento recibido de ejemplo (no es de nadie real): quién lo dio, sus puntuaciones y por qué. */
export const RECONOCIMIENTO_RECIBIDO = [
  {
    de: "Martina",
    rol: { nota: 4, porque: "Siempre llega a las jornadas de huerta y avisa con tiempo cuando no puede." },
    aporte: { nota: 5, porque: "Trae energía a las reuniones y ayuda a que las decisiones se tomen con cuidado." },
  },
  {
    de: "Joaquín",
    rol: { nota: 4, porque: "Cumplió con lo que se comprometió en la carpintería del espacio común." },
    aporte: { nota: 4, porque: "Es abierto a las ideas de otras personas, aunque a veces tarda en responder." },
  },
] as const;

const RECONOCIMIENTO_EN = [
  {
    rol: "She always shows up to the garden days and gives notice in advance when she can't.",
    aporte: "She brings energy to the meetings and helps decisions get made with care.",
  },
  {
    rol: "He did what he committed to in the carpentry of the shared space.",
    aporte: "He is open to other people's ideas, although he is sometimes slow to answer.",
  },
] as const;

/** El reconocimiento recibido de ejemplo con el texto en el idioma de la página (la nota y quién lo dio no cambian). */
export function reconocimientoRecibido(idioma: Idioma) {
  return RECONOCIMIENTO_RECIBIDO.map((r, i) =>
    idioma === "en"
      ? {
          de: r.de,
          rol: { nota: r.rol.nota, porque: RECONOCIMIENTO_EN[i].rol },
          aporte: { nota: r.aporte.nota, porque: RECONOCIMIENTO_EN[i].aporte },
        }
      : r,
  );
}
