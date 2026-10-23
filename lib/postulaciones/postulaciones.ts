import type { Idioma } from "@/lib/idioma/tipos";
import { tribus } from "@/lib/idioma/textos/tribus";
import type { Borrador, Errores, FormaJuridica, Postulacion } from "./tipos";

export const MAX_TEXTO = 1000;

/** Enlace de ejemplo para agendar la llamada (no es un Calendly real). */
export const ENLACE_LLAMADA = "https://calendly.com/netx-ejemplo/postulacion";

/** Formas jurídicas en español (en inglés, `tribus.en.postulacion.formas`). Una sola fuente: el diccionario. */
export const FORMAS_JURIDICAS: Record<FormaJuridica, string> = tribus.es.postulacion.formas;

/** Qué requisito (por posición) lleva un ⚖: el tercero, el Pacto de convivencia. */
export const REQUISITOS_LEGALES: readonly ("pacto" | undefined)[] = [undefined, undefined, "pacto", undefined];

/** Requisitos de ejemplo que se muestran antes del formulario (en español; el inglés está en el diccionario). */
export const REQUISITOS: { texto: string; legal?: "pacto" }[] = tribus.es.postulacion.listaRequisitos.map((texto, i) => ({
  texto,
  legal: REQUISITOS_LEGALES[i],
}));

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

/** Los campos de texto obligatorios, en el orden de la pantalla; su mensaje está en el diccionario. */
const OBLIGATORIOS_TEXTO = [
  "nombreComunidad",
  "lider",
  "contacto",
  "foco",
  "pozo",
  "decisiones",
  "ritual",
  "compromisoTiempo",
] as const;

/** Entero positivo escrito con dígitos; cualquier otra cosa no es una cantidad. */
export function aEntero(texto: string): number | null {
  const t = texto.trim();
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** Valida el borrador. Los mensajes salen en el idioma pedido (por defecto, español). */
export function validar(b: Borrador, idioma: Idioma = "es"): Errores {
  const mensajes = tribus[idioma].postulacion.errores;
  const errores: Errores = {};
  for (const campo of OBLIGATORIOS_TEXTO) {
    if (!b[campo].trim()) errores[campo] = mensajes[campo];
  }
  if (aEntero(b.personas) === null) errores.personas = mensajes.personas;
  if (aEntero(b.hogares) === null) errores.hogares = mensajes.hogares;
  if (!b.formaJuridica || !Object.hasOwn(FORMAS_JURIDICAS, b.formaJuridica)) {
    errores.formaJuridica = mensajes.formaJuridica;
  }
  for (const campo of Object.keys(b) as (keyof Borrador)[]) {
    if (!errores[campo] && b[campo].length > MAX_TEXTO) {
      errores[campo] = mensajes.maximo(MAX_TEXTO);
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
