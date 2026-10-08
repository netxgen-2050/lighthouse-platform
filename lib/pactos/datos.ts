// Valor de referencia de la hora, copiado del mock-up v6 (docs/referencia/netx-tribus-mockup-v6.html).
// Es "referencia, por ahora": no es el valor propio de cada persona.
export const USD_ARS = 1400;
export const HOUR_REF_ARS = 7049;
export const HOUR_REF_USD = HOUR_REF_ARS / USD_ARS;

export const HORAS = { min: 4, max: 80, paso: 2, inicial: 10 } as const;
/** Aporte en plata (USD): se registra como Semillas, 1 USD = 1 Semilla de referencia. */
export const MONTO_USD = { min: 1, max: 1_000_000, inicial: 200 } as const;

export const PESTANAS = [
  ["tiempo", "Pacto de tiempo"],
  ["plata", "Sumarte con plata"],
] as const;

export const PASOS = ["Borrador", "Enviado a la comunidad", "Aceptado por quien administra la comunidad"] as const;

/** Roles de ejemplo (a ajustar por cada comunidad). `otro` abre un texto libre. */
export const ROLES = [
  { clave: "facilitacion", nombre: "Facilitación", descripcion: "Conduce reuniones y ayuda a que el grupo decida con claridad y cuidado." },
  { clave: "community-manager", nombre: "Community manager", descripcion: "Sostiene la conversación de la comunidad: canales, novedades y bienvenida a quien llega." },
  { clave: "culture-manager", nombre: "Culture manager", descripcion: "Cuida los acuerdos de convivencia y la cultura del grupo." },
  { clave: "coordinacion", nombre: "Coordinación o project management", descripcion: "Ordena tareas, plazos y responsables para que los proyectos avancen." },
  { clave: "abogacia", nombre: "Abogacía", descripcion: "Acompaña los aspectos jurídicos: estatutos, contratos y permisos." },
  { clave: "economia", nombre: "Economía", descripcion: "Lleva las cuentas, los presupuestos y la planificación económica de la comunidad." },
  { clave: "jardineria", nombre: "Jardinería", descripcion: "Cuida huertas, jardines y espacios verdes compartidos." },
  { clave: "permacultura", nombre: "Diseño de permacultura", descripcion: "Diseña cómo se usan la tierra, el agua y la energía de forma regenerativa." },
  { clave: "bioconstruccion", nombre: "Bioconstrucción", descripcion: "Construye y mantiene obras con materiales naturales y técnicas de bajo impacto." },
  { clave: "comunicacion", nombre: "Comunicación", descripcion: "Cuenta lo que pasa en la comunidad: textos, imágenes y difusión." },
  { clave: "otro", nombre: "Otro", descripcion: "Un rol que no está en la lista: contanos cuál con tus palabras." },
] as const;

export type ClaveRol = (typeof ROLES)[number]["clave"];

export function buscarRol(clave: string) {
  return ROLES.find((r) => r.clave === clave);
}
