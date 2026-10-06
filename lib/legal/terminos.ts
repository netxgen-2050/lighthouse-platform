// Catálogo único de textos legales. Copiados textualmente de LEGAL en
// docs/referencia/netx-tribus-mockup-v6.html. Los textos nuevos los escribe o aprueba Gabriel.
export const TERMINOS = {
  ritual: {
    titulo: "Ritual de entrada",
    texto:
      "Cada tribu decide quién entra según su propio estatuto (por ejemplo, asociación civil o SAS). Eso no condiciona tu derecho a sumarte al proyecto del territorio: ese acceso no filtra por ideas ni valores (Ley 23.592).",
  },
  personeria: {
    titulo: "Comunidad con personería",
    texto:
      "Una tribu puede sumarse como asociación civil (sin fin de lucro, con estatuto que regula ingreso y salida) o como SAS (si hay retorno).",
  },
} as const;

export type ClaveTermino = keyof typeof TERMINOS;
