// Datos de ejemplo copiados de `V.semillas` del mock-up v6 (docs/referencia/netx-tribus-mockup-v6.html).
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
