// Catálogo único de términos económicos (tooltip 🌱), distinto del catálogo legal (⚖).
// Textos nuevos, no vienen del mock-up: borrador a revisar antes de cualquier uso real.
export const TERMINOS_ECONOMICOS = {
  semillas: {
    titulo: "Semillas",
    texto:
      "Las Semillas registran lo que aportás a una comunidad, en tiempo o en plata. No son dinero ni se venden: son un potencial de acceso. Cada comunidad tiene sus propias Semillas. Cuando la comunidad delibere qué valor va a ofrecer en común (hospitalidad, alimentos, talleres, estadías), tus Semillas te van a dar acceso a eso, según las reglas que se definan en la tokenomics.",
    borrador: true,
  },
} as const;

export type ClaveEconomica = keyof typeof TERMINOS_ECONOMICOS;

/** ¿El texto es un borrador a revisar? */
export function esBorradorEconomico(clave: ClaveEconomica): boolean {
  return "borrador" in TERMINOS_ECONOMICOS[clave];
}
