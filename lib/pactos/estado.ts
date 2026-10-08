import { CLAVES } from "@/lib/demo/claves";
import { HORAS, MONTO_USD, ROLES, type ClaveRol } from "./datos";

/**
 * Clave de localStorage donde quedan los pactos (simulados, solo en este navegador).
 * Desde `pactos-v2` el JSON es un EstadoPactos con los pactos por comunidad; `lib/semillas/estado`
 * lee los aceptados con `pactosAceptados`. No cambiar el valor: borraría lo ya guardado.
 */
export const CLAVE_PACTOS = CLAVES.pactos;

export type Pestana = "tiempo" | "plata";
/** 0 = Borrador, 1 = Enviado a la comunidad, 2 = Aceptado por quien administra la comunidad. */
export type Paso = 0 | 1 | 2;

export const MAX_DESCRIPCION = 500;
export const MAX_ROL_OTRO = 80;

export type PactoTiempo = {
  /** Vacío hasta que la persona elige un rol. */
  rol: ClaveRol | "";
  /** Texto libre cuando el rol es "Otro". */
  rolOtro: string;
  descripcion: string;
  horas: number;
  paso: Paso;
};

/** Lo que una persona tiene en una comunidad: su pacto de tiempo y los aportes en plata (USD) registrados. */
export type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[] };

export type EstadoPactos = {
  pestana: Pestana;
  /** Por id de comunidad (`lighthouse` o id de tribu). */
  comunidades: Record<string, PactosDeComunidad>;
};

export const TIEMPO_INICIAL: PactoTiempo = { rol: "", rolOtro: "", descripcion: "", horas: HORAS.inicial, paso: 0 };
export const INICIAL: EstadoPactos = { pestana: "tiempo", comunidades: {} };

export type Accion =
  | { tipo: "pestana"; pestana: Pestana }
  | { tipo: "rol"; comunidad: string; rol: ClaveRol | "" }
  | { tipo: "rolOtro"; comunidad: string; texto: string }
  | { tipo: "descripcion"; comunidad: string; texto: string }
  | { tipo: "horas"; comunidad: string; horas: number }
  | { tipo: "avanzar"; comunidad: string }
  | { tipo: "aporte"; comunidad: string; montoUsd: number };

function acotar(n: number, min: number, max: number, paso: number): number {
  const v = Math.min(max, Math.max(min, n));
  return Math.round((v - min) / paso) * paso + min;
}

/** Lo guardado de una comunidad, o lo inicial si todavía no hay nada. */
export function deComunidad(e: EstadoPactos, comunidad: string): PactosDeComunidad {
  return Object.hasOwn(e.comunidades, comunidad) ? e.comunidades[comunidad] : { tiempo: TIEMPO_INICIAL, aportes: [] };
}

/** ¿Están el rol (y su texto si es "Otro") y la descripción propia? Sin eso no se puede enviar. */
export function pactoCompleto(p: PactoTiempo): boolean {
  if (!p.rol) return false;
  if (p.rol === "otro" && !p.rolOtro.trim()) return false;
  return p.descripcion.trim().length > 0;
}

function conTiempo(e: EstadoPactos, comunidad: string, cambio: (t: PactoTiempo) => PactoTiempo): EstadoPactos {
  const actual = deComunidad(e, comunidad);
  // Una vez enviado, el pacto no se edita.
  if (actual.tiempo.paso !== 0) return e;
  return { ...e, comunidades: { ...e.comunidades, [comunidad]: { ...actual, tiempo: cambio(actual.tiempo) } } };
}

export function reducir(e: EstadoPactos, a: Accion): EstadoPactos {
  switch (a.tipo) {
    case "pestana":
      return { ...e, pestana: a.pestana };
    case "rol":
      return conTiempo(e, a.comunidad, (t) => ({ ...t, rol: a.rol }));
    case "rolOtro":
      return conTiempo(e, a.comunidad, (t) => ({ ...t, rolOtro: a.texto.slice(0, MAX_ROL_OTRO) }));
    case "descripcion":
      return conTiempo(e, a.comunidad, (t) => ({ ...t, descripcion: a.texto.slice(0, MAX_DESCRIPCION) }));
    case "horas":
      return conTiempo(e, a.comunidad, (t) => ({ ...t, horas: acotar(a.horas, HORAS.min, HORAS.max, HORAS.paso) }));
    case "avanzar": {
      const actual = deComunidad(e, a.comunidad);
      const t = actual.tiempo;
      if (t.paso >= 2) return e;
      // Enviar exige el pacto completo; aceptar solo tiene sentido si ya se envió.
      if (t.paso === 0 && !pactoCompleto(t)) return e;
      const siguiente: PactoTiempo = { ...t, paso: (t.paso + 1) as Paso };
      return { ...e, comunidades: { ...e.comunidades, [a.comunidad]: { ...actual, tiempo: siguiente } } };
    }
    case "aporte": {
      const monto = Math.round(a.montoUsd);
      if (!Number.isFinite(monto) || monto < MONTO_USD.min || monto > MONTO_USD.max) return e;
      const actual = deComunidad(e, a.comunidad);
      return { ...e, comunidades: { ...e.comunidades, [a.comunidad]: { ...actual, aportes: [...actual.aportes, monto] } } };
    }
  }
}

/** Pactos de tiempo aceptados, por comunidad: lo que Semillas suma. */
export function pactosAceptados(e: EstadoPactos): { comunidad: string; horas: number; rol: ClaveRol }[] {
  const salida: { comunidad: string; horas: number; rol: ClaveRol }[] = [];
  for (const [comunidad, p] of Object.entries(e.comunidades)) {
    if (p.tiempo.paso === 2 && p.tiempo.rol) salida.push({ comunidad, horas: p.tiempo.horas, rol: p.tiempo.rol });
  }
  return salida;
}

/** Total de USD aportados en una comunidad. */
export function totalAportes(p: PactosDeComunidad): number {
  return p.aportes.reduce((a, b) => a + b, 0);
}

function texto(x: unknown, max: number): string {
  return typeof x === "string" ? x.slice(0, max) : "";
}

function leerTiempo(x: unknown): PactoTiempo {
  if (typeof x !== "object" || x === null) return TIEMPO_INICIAL;
  const o = x as Record<string, unknown>;
  const rol = ROLES.find((r) => r.clave === o.rol)?.clave ?? "";
  const horas =
    typeof o.horas === "number" && Number.isFinite(o.horas)
      ? acotar(o.horas, HORAS.min, HORAS.max, HORAS.paso)
      : HORAS.inicial;
  const base: PactoTiempo = {
    rol,
    rolOtro: texto(o.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(o.descripcion, MAX_DESCRIPCION),
    horas,
    paso: 0,
  };
  // Un pacto enviado o aceptado tiene que estar completo; si no, vuelve a borrador.
  const paso = o.paso === 1 || o.paso === 2 ? o.paso : 0;
  return paso !== 0 && pactoCompleto(base) ? { ...base, paso } : base;
}

function leerAportes(x: unknown): number[] {
  if (!Array.isArray(x)) return [];
  return x.filter(
    (n): n is number => typeof n === "number" && Number.isInteger(n) && n >= MONTO_USD.min && n <= MONTO_USD.max,
  );
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo. Lo guardado con el formato anterior se ignora. */
export function leer(crudo: string | null): EstadoPactos {
  if (!crudo) return INICIAL;
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return INICIAL;
    const r = o as Record<string, unknown>;
    const comunidades: Record<string, PactosDeComunidad> = {};
    if (typeof r.comunidades === "object" && r.comunidades !== null && !Array.isArray(r.comunidades)) {
      for (const [id, v] of Object.entries(r.comunidades)) {
        if (id === "__proto__" || typeof v !== "object" || v === null) continue;
        const c = v as Record<string, unknown>;
        comunidades[id] = { tiempo: leerTiempo(c.tiempo), aportes: leerAportes(c.aportes) };
      }
    }
    return { pestana: r.pestana === "plata" ? "plata" : "tiempo", comunidades };
  } catch {
    return INICIAL;
  }
}
