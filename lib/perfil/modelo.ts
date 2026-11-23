import { perfil as textosPerfil } from "@/lib/idioma/textos/perfil";
import type { Idioma } from "@/lib/idioma/tipos";
import { ROLES, type ClaveRol } from "@/lib/pactos/datos";
import { CHATS } from "./preguntas";
import { leerGuardado, type Estado as EstadoEntrevista } from "./estado";

export const MAX = { nombre: 80, lugar: 80, frase: 140, ofrezco: 300, decision: 300, noNegociables: 300, rolOtro: 80 } as const;

/** Perfil de la persona (prototipo interno: se guarda solo en este navegador). Un texto vacío es "sin dato". */
export type Perfil = {
  nombre: string;
  /** De dónde sos. */
  lugar: string;
  /** Una frase sobre vos. */
  frase: string;
  /** Oficios y cosas que sabés hacer, en tus palabras. */
  ofrezco: string;
  /** Roles de la misma lista de Pactos. */
  roles: ClaveRol[];
  /** Texto libre cuando entre los roles está "Otro". */
  rolOtro: string;
  /** Cómo te gusta decidir. */
  decision: string;
  noNegociables: string;
};

export const PERFIL_VACIO: Perfil = {
  nombre: "",
  lugar: "",
  frase: "",
  ofrezco: "",
  roles: [],
  rolOtro: "",
  decision: "",
  noNegociables: "",
};

export type ErroresPerfil = Partial<Record<"nombre" | "lugar" | "frase" | "ofrezco" | "rolOtro" | "decision" | "noNegociables", string>>;

/** Valida el formulario. El nombre es obligatorio; "Otro" pide que cuentes cuál. Sin errores = objeto vacío. Los mensajes salen en el idioma pedido. */
export function validar(p: Perfil, idioma: Idioma = "es"): ErroresPerfil {
  const t = textosPerfil[idioma].errores;
  const e: ErroresPerfil = {};
  if (p.nombre.trim() === "") e.nombre = t.nombre;
  else if (p.nombre.trim().length > MAX.nombre) e.nombre = t.nombreMax(MAX.nombre);
  for (const campo of ["lugar", "frase", "ofrezco", "decision", "noNegociables"] as const) {
    if (p[campo].trim().length > MAX[campo]) e[campo] = t.max(MAX[campo]);
  }
  // El texto de "Otro" solo cuenta si "Otro" está marcado (si no, el campo ni se ve).
  if (p.roles.includes("otro")) {
    if (p.rolOtro.trim() === "") e.rolOtro = t.rolOtro;
    else if (p.rolOtro.trim().length > MAX.rolOtro) e.rolOtro = t.max(MAX.rolOtro);
  }
  return e;
}

/** Deja los textos recortados y los roles sin repetir, en el orden de la lista de Pactos. */
export function normalizar(p: Perfil): Perfil {
  const roles = ROLES.map((r) => r.clave).filter((c) => p.roles.includes(c));
  return {
    nombre: p.nombre.trim(),
    lugar: p.lugar.trim(),
    frase: p.frase.trim(),
    ofrezco: p.ofrezco.trim(),
    roles,
    rolOtro: roles.includes("otro") ? p.rolOtro.trim() : "",
    decision: p.decision.trim(),
    noNegociables: p.noNegociables.trim(),
  };
}

/** Campos básicos: los que hacen falta para decir que el perfil está completo. */
export function basicosCompletos(p: Perfil): boolean {
  return p.nombre.trim() !== "" && p.lugar.trim() !== "" && p.frase.trim() !== "";
}

export const TOTAL_DATOS = 6;

/** Cuántos de los 6 datos tienen algo: nombre, lugar, frase, qué ofrecés (texto o roles), cómo decidís y qué no negociás. */
export function datosCompletos(p: Perfil): number {
  return [
    p.nombre.trim() !== "",
    p.lugar.trim() !== "",
    p.frase.trim() !== "",
    p.ofrezco.trim() !== "" || p.roles.length > 0,
    p.decision.trim() !== "",
    p.noNegociables.trim() !== "",
  ].filter(Boolean).length;
}

/** Borrador con el que arranca el formulario: si el perfil no tiene nombre y la cuenta (Privy) trae uno, se precarga. */
export function borradorInicial(perfil: Perfil, nombreCuenta: string | null): Perfil {
  const nombre = nombreCuenta?.trim() ?? "";
  if (perfil.nombre !== "" || nombre === "") return perfil;
  return { ...perfil, nombre: nombre.slice(0, MAX.nombre) };
}

export function perfilVacio(p: Perfil): boolean {
  return datosCompletos(p) === 0;
}

/** Iniciales para el encabezado (hasta dos). Sin nombre devuelve cadena vacía. */
export function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => Array.from(palabra)[0].toLocaleUpperCase("es"))
    .join("");
}

function texto(x: unknown, max: number): string {
  return typeof x === "string" ? x.trim().slice(0, max) : "";
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo. Devuelve null si no hay nada guardado o no es un objeto. */
export function leer(crudo: string | null): Perfil | null {
  if (!crudo) return null;
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return null;
    const r = o as Record<string, unknown>;
    const lista = Array.isArray(r.roles) ? r.roles : [];
    return normalizar({
      nombre: texto(r.nombre, MAX.nombre),
      lugar: texto(r.lugar, MAX.lugar),
      frase: texto(r.frase, MAX.frase),
      ofrezco: texto(r.ofrezco, MAX.ofrezco),
      roles: ROLES.map((x) => x.clave).filter((c) => lista.includes(c)),
      rolOtro: texto(r.rolOtro, MAX.rolOtro),
      decision: texto(r.decision, MAX.decision),
      noNegociables: texto(r.noNegociables, MAX.noNegociables),
    });
  } catch {
    return null;
  }
}

function dato(estado: EstadoEntrevista, etiqueta: string, max: number): string {
  const i = CHATS.findIndex((c) => c.etiqueta === etiqueta);
  const item = estado.items[i];
  return item ? (item.confirmado ?? item.propuesta).slice(0, max) : "";
}

/**
 * Migra lo que la persona contó en la entrevista anterior a los campos nuevos:
 * "Qué te trae" pasa a la frase, "Lo que aportás" a qué ofrecés, "Cómo decidir" y "No negociables" a sus campos.
 * "Bioregión" y "Tiempo" no tienen campo en el perfil nuevo y no se migran. Sin entrevista devuelve null.
 */
export function migrarDeEntrevista(estado: EstadoEntrevista): Perfil | null {
  if (estado.items.length === 0) return null;
  return {
    ...PERFIL_VACIO,
    frase: dato(estado, "Qué te trae", MAX.frase),
    ofrezco: dato(estado, "Lo que aportás", MAX.ofrezco),
    decision: dato(estado, "Cómo decidir", MAX.decision),
    noNegociables: dato(estado, "No negociables", MAX.noNegociables),
  };
}

/** Perfil guardado; si no hay, el migrado de la entrevista vieja; si tampoco, vacío. */
export function cargarPerfil(crudoNuevo: string | null, crudoEntrevista: string | null): Perfil {
  return leer(crudoNuevo) ?? migrarDeEntrevista(leerGuardado(crudoEntrevista)) ?? PERFIL_VACIO;
}
