// Catálogo único de términos económicos (tooltip 🌱), distinto del catálogo legal (⚖).
// Textos nuevos, no vienen del mock-up: borrador a revisar antes de cualquier uso real.
// `en` es la versión en inglés: siempre borrador (nadie la revisó). "Semillas" no se traduce (glosario).
import type { Idioma } from "@/lib/idioma/tipos";

export const TERMINOS_ECONOMICOS = {
  semillas: {
    titulo: "Semillas",
    texto:
      "Las Semillas registran lo que aportás a una comunidad, en tiempo o en plata. No son dinero ni se venden: son un potencial de acceso. Cada comunidad tiene sus propias Semillas. Cuando la comunidad delibere qué valor va a ofrecer en común (hospitalidad, alimentos, talleres, estadías), tus Semillas te van a dar acceso a eso, según las reglas que se definan en la tokenomics.",
    borrador: true,
    en: {
      titulo: "Semillas",
      texto:
        "Semillas (seeds) record what you contribute to a community, in time or in money. They are not money and they are not sold: they are a potential for access. Each community has its own Semillas. When the community decides what value it will offer in common (hospitality, food, workshops, stays), your Semillas will give you access to it, under the rules defined in the tokenomics.",
    },
  },
} as const;

export type ClaveEconomica = keyof typeof TERMINOS_ECONOMICOS;

/** ¿El texto en español es un borrador a revisar? */
export function esBorradorEconomico(clave: ClaveEconomica): boolean {
  return "borrador" in TERMINOS_ECONOMICOS[clave];
}

/** Título y texto de un término en el idioma pedido. Todo texto en inglés es borrador, aunque el español no lo sea. */
export function terminoEconomico(
  clave: ClaveEconomica,
  idioma: Idioma,
): { titulo: string; texto: string; borrador: boolean } {
  const t = TERMINOS_ECONOMICOS[clave];
  if (idioma === "en") return { titulo: t.en.titulo, texto: t.en.texto, borrador: true };
  return { titulo: t.titulo, texto: t.texto, borrador: esBorradorEconomico(clave) };
}
