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
  ticket: {
    titulo: "Ticket del Congreso",
    texto:
      "El organizador vende el Congreso por su cuenta. La plataforma solo registra tu ticket para conectar tu presencia con tu perfil.",
  },
  presencia: {
    titulo: "Presencia",
    texto:
      "Un registro que confirma el anfitrión con el check-in. Da acceso y voz (con un tope), nunca valor económico. No se compra ni se transfiere.",
  },
  obra: {
    titulo: "Horas de obra",
    texto:
      "Trabajo presencial en obra: hay que definir la modalidad (voluntariado, Ley 25.855, o locación de servicios) y contratar un seguro de accidentes. Si se presume relación laboral, aplica la LCT (art. 23).",
  },
} as const;

export type ClaveTermino = keyof typeof TERMINOS;
