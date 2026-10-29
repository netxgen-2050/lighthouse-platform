// Valor de referencia de la hora, copiado del mock-up v6 (docs/referencia/netx-tribus-mockup-v6.html).
// Es "referencia, por ahora": no es el valor propio de cada persona.
import type { Idioma } from "@/lib/idioma/tipos";

export const USD_ARS = 1400;
export const HOUR_REF_ARS = 7049;
export const HOUR_REF_USD = HOUR_REF_ARS / USD_ARS;

export const HORAS = { min: 4, max: 80, paso: 2, inicial: 10 } as const;
/** Horas de un pacto puntual (una sola tarea): enteras. */
export const HORAS_PUNTUAL = { min: 1, max: 200, paso: 1 } as const;
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

// Inglés de los textos de ejemplo (borrador a revisar: ver `lib/idioma/revision-nativa.ts`).
const ROLES_EN: Record<ClaveRol, { nombre: string; descripcion: string }> = {
  facilitacion: { nombre: "Facilitation", descripcion: "Leads meetings and helps the group decide clearly and carefully." },
  "community-manager": {
    nombre: "Community manager",
    descripcion: "Keeps the community conversation going: channels, news and a welcome for newcomers.",
  },
  "culture-manager": { nombre: "Culture manager", descripcion: "Looks after the living agreements and the culture of the group." },
  coordinacion: {
    nombre: "Coordination or project management",
    descripcion: "Organizes tasks, deadlines and owners so projects move forward.",
  },
  abogacia: { nombre: "Legal support", descripcion: "Helps with legal matters: bylaws, contracts and permits." },
  economia: { nombre: "Economics", descripcion: "Keeps the accounts, budgets and economic planning of the community." },
  jardineria: { nombre: "Gardening", descripcion: "Looks after shared vegetable gardens, gardens and green spaces." },
  permacultura: {
    nombre: "Permaculture design",
    descripcion: "Designs how land, water and energy are used in a regenerative way.",
  },
  bioconstruccion: {
    nombre: "Natural building",
    descripcion: "Builds and maintains structures with natural materials and low-impact techniques.",
  },
  comunicacion: { nombre: "Communication", descripcion: "Tells what happens in the community: texts, images and outreach." },
  otro: { nombre: "Other", descripcion: "A role that is not on the list: tell us which one in your own words." },
};

/** Nombre y descripción de un rol en el idioma de la página. */
export function textoDeRol(rol: (typeof ROLES)[number], idioma: Idioma): { nombre: string; descripcion: string } {
  return idioma === "en" ? ROLES_EN[rol.clave] : { nombre: rol.nombre, descripcion: rol.descripcion };
}

const PESTANAS_EN: Record<(typeof PESTANAS)[number][0], string> = { tiempo: "Time pact", plata: "Join with money" };
const PASOS_EN = ["Draft", "Sent to the community", "Accepted by whoever manages the community"] as const;

export function tituloDePestana(clave: (typeof PESTANAS)[number][0], idioma: Idioma): string {
  return idioma === "en" ? PESTANAS_EN[clave] : (PESTANAS.find((p) => p[0] === clave)?.[1] ?? clave);
}

export function pasosDelPacto(idioma: Idioma): readonly string[] {
  return idioma === "en" ? PASOS_EN : PASOS;
}
