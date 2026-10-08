import type { Borrador, Errores, FormaJuridica, Postulacion } from "./tipos";

export const MAX_TEXTO = 1000;

/** Enlace de ejemplo para agendar la llamada (no es un Calendly real). */
export const ENLACE_LLAMADA = "https://calendly.com/netx-ejemplo/postulacion";

export const FORMAS_JURIDICAS: Record<FormaJuridica, string> = {
  "asociacion-civil": "Asociación civil",
  sas: "SAS",
  cooperativa: "Cooperativa",
  fundacion: "Fundación",
  ninguna: "Todavía ninguna",
};

/** Requisitos de ejemplo que se muestran antes del formulario. */
export const REQUISITOS: { texto: string; legal?: "pacto" }[] = [
  { texto: "Un grupo de al menos 3 hogares." },
  { texto: "Una persona responsable de la postulación." },
  { texto: "Adherir al Pacto de convivencia del Lighthouse y a la regeneración de la tierra.", legal: "pacto" },
  { texto: "Disponibilidad para una llamada con el equipo." },
];

export const BORRADOR_VACIO: Borrador = {
  nombreComunidad: "",
  lider: "",
  contacto: "",
  personas: "",
  hogares: "",
  desdeCuando: "",
  foco: "",
  rolesTienen: "",
  rolesBuscan: "",
  pozo: "",
  formaJuridica: "",
  decisiones: "",
  ritual: "",
  tierra: "",
  compromisoTiempo: "",
};

const OBLIGATORIOS_TEXTO: [keyof Borrador, string][] = [
  ["nombreComunidad", "Escribí el nombre de la comunidad"],
  ["lider", "Escribí el nombre de la persona que lidera la postulación"],
  ["contacto", "Escribí cómo contactar a esa persona"],
  ["foco", "Contá qué van a producir o aportar en el barrio"],
  ["pozo", "Contá qué aportarían al pozo común"],
  ["decisiones", "Contá cómo toman decisiones"],
  ["ritual", "Contá cuál sería su ritual de entrada"],
  ["compromisoTiempo", "Contá qué tiempo se comprometen a dedicar en la fase de formación"],
];

/** Entero positivo escrito con dígitos; cualquier otra cosa no es una cantidad. */
export function aEntero(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export function validar(b: Borrador): Errores {
  const errores: Errores = {};
  for (const [campo, mensaje] of OBLIGATORIOS_TEXTO) {
    if (!b[campo].trim()) errores[campo] = mensaje;
  }
  if (aEntero(b.personas) === null) errores.personas = "Escribí cuántas personas son (un número mayor que cero)";
  if (aEntero(b.hogares) === null) errores.hogares = "Escribí cuántos hogares son (un número mayor que cero)";
  if (!b.formaJuridica || !Object.hasOwn(FORMAS_JURIDICAS, b.formaJuridica)) {
    errores.formaJuridica = "Elegí la forma jurídica actual o prevista";
  }
  for (const campo of Object.keys(b) as (keyof Borrador)[]) {
    if (!errores[campo] && b[campo].length > MAX_TEXTO) {
      errores[campo] = `Puede tener hasta ${MAX_TEXTO} caracteres`;
    }
  }
  return errores;
}

/** Arma la postulación a guardar. Supone un borrador ya validado (sin errores). */
export function crearPostulacion(
  b: Borrador,
  destino: { tribuId: string; barrio: number },
  ahora: Date,
  id: string,
): Postulacion {
  const personas = aEntero(b.personas);
  const hogares = aEntero(b.hogares);
  if (personas === null || hogares === null || !b.formaJuridica) throw new Error("Borrador sin validar");
  const desdeCuando = b.desdeCuando.trim();
  const rolesTienen = b.rolesTienen.trim();
  const rolesBuscan = b.rolesBuscan.trim();
  const tierra = b.tierra.trim();
  return {
    id,
    fecha: ahora.toISOString(),
    tribuId: destino.tribuId,
    barrio: destino.barrio,
    nombreComunidad: b.nombreComunidad.trim(),
    lider: b.lider.trim(),
    contacto: b.contacto.trim(),
    personas,
    hogares,
    ...(desdeCuando ? { desdeCuando } : {}),
    foco: b.foco.trim(),
    ...(rolesTienen ? { rolesTienen } : {}),
    ...(rolesBuscan ? { rolesBuscan } : {}),
    pozo: b.pozo.trim(),
    formaJuridica: b.formaJuridica,
    decisiones: b.decisiones.trim(),
    ritual: b.ritual.trim(),
    ...(tierra ? { tierra } : {}),
    compromisoTiempo: b.compromisoTiempo.trim(),
  };
}

function esPostulacion(x: unknown): x is Postulacion {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.fecha === "string" &&
    typeof p.tribuId === "string" &&
    typeof p.barrio === "number" &&
    typeof p.nombreComunidad === "string" &&
    typeof p.lider === "string" &&
    typeof p.contacto === "string" &&
    typeof p.personas === "number" &&
    typeof p.hogares === "number" &&
    typeof p.foco === "string" &&
    typeof p.pozo === "string" &&
    typeof p.formaJuridica === "string" &&
    Object.hasOwn(FORMAS_JURIDICAS, p.formaJuridica) &&
    typeof p.decisiones === "string" &&
    typeof p.ritual === "string" &&
    typeof p.compromisoTiempo === "string"
  );
}

/** Lee lo guardado; si no es una lista válida devuelve una lista vacía. */
export function leerPostulaciones(texto: string | null): Postulacion[] {
  if (!texto) return [];
  try {
    const dato: unknown = JSON.parse(texto);
    if (!Array.isArray(dato)) return [];
    return dato.filter(esPostulacion);
  } catch {
    return [];
  }
}

/** La más nueva queda primero. Un id que ya está no se vuelve a agregar (reintentos). */
export function agregar(lista: Postulacion[], nueva: Postulacion): Postulacion[] {
  if (lista.some((p) => p.id === nueva.id)) return lista;
  return [nueva, ...lista];
}
