// Datos de ejemplo copiados de `V.pactos` y de las constantes del mock-up v6
// (docs/referencia/netx-tribus-mockup-v6.html).
export const USD_ARS = 1400;
export const HOUR_REF_ARS = 7049;
export const HOUR_REF_USD = HOUR_REF_ARS / USD_ARS;

/** Persona de ejemplo con la que arranca el mock-up (Lucía, Oslo). */
export const PERSONA = {
  nombre: "Lucía",
  rol: "Eventos y comunidad",
  modo: "remoto" as "remoto" | "obra",
  /** ¿Puede sumarse con plata al fideicomiso? (depende de la residencia fiscal; Lucía vive en Noruega) */
  residenciaArgentina: false,
  residencia: "Noruega",
};

export const HORAS = { min: 4, max: 80, paso: 2, inicial: 10 } as const;
export const PARTE_SEMILLA = { min: 0, max: 100, paso: 10, inicial: 50 } as const;
export const MONTO_USD = { min: 5000, max: 60000, paso: 1000, inicial: 30000 } as const;

export const PESTANAS = [
  ["tiempo", "Pacto de tiempo"],
  ["plata", "Sumarte con plata"],
  ["convivencia", "Pacto de convivencia"],
] as const;

export const PASOS = ["Borrador", "En revisión", "Aceptado"] as const;

export const REGLAS_CONVIVENCIA = [
  "Nada de agroquímicos ni semillas transgénicas",
  "Bioconstrucción y captación de agua de lluvia",
  "Cuidado del bosque ribereño: sin talas sin permiso",
  "Obras solo con plano aprobado",
  "Al día con el fondo común",
] as const;
