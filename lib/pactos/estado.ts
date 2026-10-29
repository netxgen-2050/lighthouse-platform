import { personaEnSesion } from "@/lib/demo/claves";
import type { Necesidad, Tope } from "@/lib/tribus/necesidades";
import { HORAS, HORAS_PUNTUAL, MONTO_USD, ROLES, type ClaveRol } from "./datos";
import {
  afirmaComunidad,
  afirmaPersona,
  contraparteDe,
  esPostulacion,
  estaRevocada,
  respuestaDe,
  respuestaValida,
  sobreDe,
  sobrePuntual,
  topeDeDatos,
  type ConstanciaPacto,
} from "./constancias";
import { leerDelNavegador } from "./registro-compartido";

/*
 * Los pactos (simulados, solo en este navegador) quedan en localStorage bajo `CLAVES.pactos`.
 * Desde `pactos-v2` el JSON es un EstadoPactos con los pactos por comunidad; `lib/semillas/estado`
 * lee los aceptados con `pactosAceptados`. No cambiar el nombre base: borraría lo ya guardado.
 */

export type Pestana = "tiempo" | "plata";
/** 0 = Borrador, 1 = Enviado a la comunidad, 2 = Aceptado por quien administra la comunidad. */
export type Paso = 0 | 1 | 2;

export const MAX_DESCRIPCION = 500;
export const MAX_ROL_OTRO = 80;

/** Lo que dice un pacto de tiempo: rol, descripción y horas. */
export type ContenidoPacto = {
  /** Vacío hasta que la persona elige un rol. */
  rol: ClaveRol | "";
  /** Texto libre cuando el rol es "Otro". */
  rolOtro: string;
  descripcion: string;
  horas: number;
};

/** Un cambio propuesto a un pacto aceptado: 0 = borrador, 1 = enviado a la comunidad. */
export type CambioPropuesto = ContenidoPacto & { paso: 0 | 1 };

/** Una versión que la comunidad aceptó. `aceptado` es la fecha ISO, o null si no se sabe ("sin dato"). */
export type VersionAceptada = ContenidoPacto & { version: number; aceptado: string | null };

/**
 * Los campos de contenido son la versión vigente. `version` es 0 mientras nunca se aceptó; `cambio` solo
 * existe con `paso === 2`; `historial` va en orden cronológico (la pantalla lo muestra al revés).
 */
export type PactoTiempo = ContenidoPacto & {
  paso: Paso;
  version: number;
  cambio?: CambioPropuesto;
  historial: VersionAceptada[];
};

/** Pasos de una postulación a una tarea. `pacto-puntual-verificacion` suma "hecha" y "verificado". */
export type PasoPuntual = "borrador" | "enviado" | "preadmitido";

/**
 * La postulación de una persona a una necesidad (pacto puntual). Lo que falta (horas, fecha) es null, nunca 0.
 * `tope` y `topeTotal` son los de la necesidad al crearla; al conciliar una pre-admisión, los que vio el holón.
 */
export type PactoPuntual = {
  necesidadId: string;
  rol: ClaveRol | "";
  rolOtro: string;
  descripcion: string;
  horas: number | null;
  /** "AAAA-MM-DD". */
  fecha: string | null;
  tope: Tope | null;
  topeTotal: Tope | null;
  paso: PasoPuntual;
  /** El último "no pre-admitió", para el aviso. */
  noPreadmitida?: { motivo: string; cuando: string };
};

/** Lo que una persona tiene en una comunidad: su pacto de tiempo, los aportes en plata (USD) y sus postulaciones a tareas. */
export type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[]; puntuales: PactoPuntual[] };

/** La última vez que una comunidad no aceptó un pacto o un cambio: la pantalla muestra el motivo hasta que se vuelva a enviar. */
export type UltimaRespuesta = { tipo: "no-acepta"; motivo: string; comunidad: string; cuando: string; esCambio?: boolean };

export type EstadoPactos = {
  pestana: Pestana;
  /** Por id de comunidad (`lighthouse` o id de tribu). */
  comunidades: Record<string, PactosDeComunidad>;
  ultimaRespuesta?: UltimaRespuesta;
};

export const TIEMPO_INICIAL: PactoTiempo = {
  rol: "",
  rolOtro: "",
  descripcion: "",
  horas: HORAS.inicial,
  paso: 0,
  version: 0,
  historial: [],
};
export const INICIAL: EstadoPactos = { pestana: "tiempo", comunidades: {} };

/** `ahora` (ISO) lo pone quien llama: el reductor sigue siendo puro. */
export type Accion =
  | { tipo: "pestana"; pestana: Pestana }
  | { tipo: "rol"; comunidad: string; rol: ClaveRol | "" }
  | { tipo: "rolOtro"; comunidad: string; texto: string }
  | { tipo: "descripcion"; comunidad: string; texto: string }
  | { tipo: "horas"; comunidad: string; horas: number }
  | { tipo: "avanzar"; comunidad: string; ahora?: string }
  | { tipo: "retirar"; comunidad: string }
  | { tipo: "proponerCambio"; comunidad: string }
  | { tipo: "editarCambio"; comunidad: string; cambios: Partial<ContenidoPacto> }
  | { tipo: "enviarCambio"; comunidad: string }
  | { tipo: "retirarCambio"; comunidad: string }
  | { tipo: "aceptarCambio"; comunidad: string; ahora?: string }
  | { tipo: "rechazarCambio"; comunidad: string }
  | { tipo: "descartarCambio"; comunidad: string }
  | { tipo: "aporte"; comunidad: string; montoUsd: number };

function acotar(n: number, min: number, max: number, paso: number): number {
  const v = Math.min(max, Math.max(min, n));
  return Math.round((v - min) / paso) * paso + min;
}

/** Lo guardado de una comunidad, o lo inicial si todavía no hay nada. */
export function deComunidad(e: EstadoPactos, comunidad: string): PactosDeComunidad {
  return Object.hasOwn(e.comunidades, comunidad) ? e.comunidades[comunidad] : { tiempo: TIEMPO_INICIAL, aportes: [], puntuales: [] };
}

/** ¿Están el rol (y su texto si es "Otro") y la descripción propia? Sin eso no se puede enviar. */
export function pactoCompleto(p: ContenidoPacto): boolean {
  if (!p.rol) return false;
  if (p.rol === "otro" && !p.rolOtro.trim()) return false;
  return p.descripcion.trim().length > 0;
}

function contenido(p: ContenidoPacto): ContenidoPacto {
  return { rol: p.rol, rolOtro: p.rolOtro, descripcion: p.descripcion, horas: p.horas };
}

function sinCambio(t: PactoTiempo): PactoTiempo {
  const { cambio: _cambio, ...resto } = t;
  void _cambio;
  return resto;
}

function conPacto(e: EstadoPactos, comunidad: string, tiempo: PactoTiempo): EstadoPactos {
  const actual = deComunidad(e, comunidad);
  return { ...e, comunidades: { ...e.comunidades, [comunidad]: { ...actual, tiempo } } };
}

/** Quita el aviso de "no aceptó" de esa comunidad (al volver a enviar o a proponer, o al aceptarse). */
function sinAviso(e: EstadoPactos, comunidad: string): EstadoPactos {
  if (!e.ultimaRespuesta || e.ultimaRespuesta.comunidad !== comunidad) return e;
  const { ultimaRespuesta: _u, ...resto } = e;
  void _u;
  return resto;
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
      if (siguiente.paso === 2) {
        // La primera aceptación fija la versión 1 y abre el historial.
        siguiente.version = 1;
        siguiente.historial = [{ version: 1, ...contenido(t), aceptado: a.ahora ?? null }];
      }
      return sinAviso(conPacto(e, a.comunidad, siguiente), a.comunidad);
    }
    case "retirar": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (t.paso !== 1) return e;
      return conPacto(e, a.comunidad, { ...t, paso: 0 });
    }
    case "proponerCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (t.paso !== 2 || t.cambio) return e;
      return conPacto(e, a.comunidad, { ...t, cambio: { ...contenido(t), paso: 0 } });
    }
    case "editarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 0) return e;
      const c = a.cambios;
      const nuevo: CambioPropuesto = { ...t.cambio };
      if (c.rol !== undefined) nuevo.rol = ROLES.find((r) => r.clave === c.rol)?.clave ?? "";
      if (c.rolOtro !== undefined) nuevo.rolOtro = c.rolOtro.slice(0, MAX_ROL_OTRO);
      if (c.descripcion !== undefined) nuevo.descripcion = c.descripcion.slice(0, MAX_DESCRIPCION);
      if (c.horas !== undefined && Number.isFinite(c.horas)) nuevo.horas = acotar(c.horas, HORAS.min, HORAS.max, HORAS.paso);
      return conPacto(e, a.comunidad, { ...t, cambio: nuevo });
    }
    case "enviarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 0 || !pactoCompleto(t.cambio)) return e;
      return sinAviso(conPacto(e, a.comunidad, { ...t, cambio: { ...t.cambio, paso: 1 } }), a.comunidad);
    }
    case "retirarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 1) return e;
      return conPacto(e, a.comunidad, { ...t, cambio: { ...t.cambio, paso: 0 } });
    }
    case "aceptarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 1 || !pactoCompleto(t.cambio)) return e;
      const version = t.version + 1;
      const nuevo = contenido(t.cambio);
      return conPacto(e, a.comunidad, {
        ...sinCambio(t),
        ...nuevo,
        version,
        historial: [...t.historial, { version, ...nuevo, aceptado: a.ahora ?? null }],
      });
    }
    case "rechazarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 1) return e;
      return conPacto(e, a.comunidad, sinCambio(t));
    }
    case "descartarCambio": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (!t.cambio || t.cambio.paso !== 0) return e;
      return conPacto(e, a.comunidad, sinCambio(t));
    }
    case "aporte": {
      const monto = Math.round(a.montoUsd);
      if (!Number.isFinite(monto) || monto < MONTO_USD.min || monto > MONTO_USD.max) return e;
      const actual = deComunidad(e, a.comunidad);
      return { ...e, comunidades: { ...e.comunidades, [a.comunidad]: { ...actual, aportes: [...actual.aportes, monto] } } };
    }
  }
}

/* ---------- Pactos puntuales (openspec/changes/pacto-puntual) ---------- */

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** "AAAA-MM-DD" que existe en el calendario (rechaza 2026-02-31). */
export function fechaValida(f: unknown): f is string {
  if (typeof f !== "string" || !FECHA.test(f)) return false;
  const t = Date.parse(`${f}T00:00:00.000Z`);
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === f;
}

function horasPuntualValidas(h: unknown): h is number {
  return typeof h === "number" && Number.isInteger(h) && h >= HORAS_PUNTUAL.min && h <= HORAS_PUNTUAL.max;
}

/** ¿Están rol (y su texto si es "Otro"), descripción, horas enteras de 1 a 200 y una fecha válida? Sin eso no se envía. */
export function puntualCompleto(p: Pick<PactoPuntual, "rol" | "rolOtro" | "descripcion" | "horas" | "fecha">): boolean {
  if (!p.rol) return false;
  if (p.rol === "otro" && !p.rolOtro.trim()) return false;
  return p.descripcion.trim().length > 0 && horasPuntualValidas(p.horas) && fechaValida(p.fecha);
}

/** Qué falta para enviar, en orden, para que la pantalla lo diga. */
export function faltaDelPuntual(p: Pick<PactoPuntual, "rol" | "rolOtro" | "descripcion" | "horas" | "fecha">): "rol" | "descripcion" | "horas" | "fecha" | null {
  if (!p.rol || (p.rol === "otro" && !p.rolOtro.trim())) return "rol";
  if (!p.descripcion.trim()) return "descripcion";
  if (!horasPuntualValidas(p.horas)) return "horas";
  if (!fechaValida(p.fecha)) return "fecha";
  return null;
}

export type EdicionPuntual = Partial<Pick<PactoPuntual, "rolOtro" | "descripcion">> & {
  rol?: ClaveRol | "";
  /** null = la persona vació el campo. */
  horas?: number | null;
  fecha?: string | null;
};

/** Lo que cambia solo una respuesta del holón leída del registro (`conciliar`): la pantalla de la persona nunca las llama. */
export type AccionPuntual =
  | { tipo: "nuevoPuntual"; comunidad: string; necesidad: Necesidad }
  | { tipo: "editarPuntual"; comunidad: string; necesidadId: string; cambios: EdicionPuntual }
  | { tipo: "enviarPuntual"; comunidad: string; necesidadId: string }
  | { tipo: "retirarPuntual"; comunidad: string; necesidadId: string }
  | { tipo: "descartarPuntual"; comunidad: string; necesidadId: string }
  | { tipo: "preadmitirPuntual"; comunidad: string; necesidadId: string; contenido: ContenidoPuntual }
  | { tipo: "noPreadmitirPuntual"; comunidad: string; necesidadId: string; motivo: string; cuando: string };

/** Lo que el holón vio al pre-admitir. */
export type ContenidoPuntual = Pick<PactoPuntual, "rol" | "rolOtro" | "descripcion" | "horas" | "fecha" | "tope" | "topeTotal">;

export function puntualDe(e: EstadoPactos, comunidad: string, necesidadId: string): PactoPuntual | undefined {
  return deComunidad(e, comunidad).puntuales.find((p) => p.necesidadId === necesidadId);
}

function conPuntuales(e: EstadoPactos, comunidad: string, puntuales: PactoPuntual[]): EstadoPactos {
  const actual = deComunidad(e, comunidad);
  return { ...e, comunidades: { ...e.comunidades, [comunidad]: { ...actual, puntuales } } };
}

function cambiarPuntual(
  e: EstadoPactos,
  comunidad: string,
  necesidadId: string,
  desde: PasoPuntual,
  cambio: (p: PactoPuntual) => PactoPuntual | null,
): EstadoPactos {
  const lista = deComunidad(e, comunidad).puntuales;
  const i = lista.findIndex((p) => p.necesidadId === necesidadId);
  // Cada acción vale solo en su paso: leer dos veces una respuesta no la aplica dos veces.
  if (i < 0 || lista[i].paso !== desde) return e;
  const nuevo = cambio(lista[i]);
  if (nuevo === lista[i]) return e;
  if (nuevo === null) return conPuntuales(e, comunidad, lista.filter((_, j) => j !== i));
  return conPuntuales(e, comunidad, lista.map((p, j) => (j === i ? nuevo : p)));
}

export function reducirPuntual(e: EstadoPactos, a: AccionPuntual): EstadoPactos {
  switch (a.tipo) {
    case "nuevoPuntual": {
      const n = a.necesidad;
      if (puntualDe(e, a.comunidad, n.id)) return e;
      const nuevo: PactoPuntual = {
        necesidadId: n.id,
        rol: n.habilidad,
        rolOtro: (n.habilidadOtra ?? "").slice(0, MAX_ROL_OTRO),
        descripcion: "",
        horas: n.horas,
        fecha: n.paraCuando,
        tope: n.tope,
        topeTotal: n.topeTotal,
        paso: "borrador",
      };
      return conPuntuales(e, a.comunidad, [...deComunidad(e, a.comunidad).puntuales, nuevo]);
    }
    case "editarPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "borrador", (p) => {
        const c = a.cambios;
        const nuevo = { ...p };
        if (c.rol !== undefined) nuevo.rol = ROLES.find((r) => r.clave === c.rol)?.clave ?? "";
        if (c.rolOtro !== undefined) nuevo.rolOtro = c.rolOtro.slice(0, MAX_ROL_OTRO);
        if (c.descripcion !== undefined) nuevo.descripcion = c.descripcion.slice(0, MAX_DESCRIPCION);
        if (c.horas !== undefined) {
          nuevo.horas = c.horas === null || !Number.isFinite(c.horas) ? null : acotar(c.horas, HORAS_PUNTUAL.min, HORAS_PUNTUAL.max, HORAS_PUNTUAL.paso);
        }
        if (c.fecha !== undefined) nuevo.fecha = fechaValida(c.fecha) ? c.fecha : null;
        return nuevo;
      });
    case "enviarPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "borrador", (p) => {
        if (!puntualCompleto(p)) return p;
        const { noPreadmitida: _n, ...resto } = p;
        void _n;
        return { ...resto, paso: "enviado" };
      });
    case "retirarPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "enviado", (p) => ({ ...p, paso: "borrador" }));
    case "descartarPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "borrador", () => null);
    case "preadmitirPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "enviado", (p) => ({ ...p, ...a.contenido, paso: "preadmitido" }));
    case "noPreadmitirPuntual":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "enviado", (p) => ({
        ...p,
        paso: "borrador",
        noPreadmitida: { motivo: a.motivo.slice(0, 500), cuando: a.cuando },
      }));
  }
}

/** Todas las postulaciones de la persona, con su comunidad. */
export function puntualesDe(e: EstadoPactos): { comunidad: string; puntual: PactoPuntual }[] {
  return Object.entries(e.comunidades).flatMap(([comunidad, c]) => c.puntuales.map((puntual) => ({ comunidad, puntual })));
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

function leerContenido(o: Record<string, unknown>): ContenidoPacto {
  return {
    rol: ROLES.find((r) => r.clave === o.rol)?.clave ?? "",
    rolOtro: texto(o.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(o.descripcion, MAX_DESCRIPCION),
    horas:
      typeof o.horas === "number" && Number.isFinite(o.horas)
        ? acotar(o.horas, HORAS.min, HORAS.max, HORAS.paso)
        : HORAS.inicial,
  };
}

function leerHistorial(x: unknown, vigente: number): VersionAceptada[] {
  if (!Array.isArray(x)) return [];
  const salida: VersionAceptada[] = [];
  for (const v of x) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    const c = leerContenido(o);
    if (typeof o.version !== "number" || !Number.isInteger(o.version) || o.version < 1 || !pactoCompleto(c)) continue;
    if (o.version > vigente || salida.some((s) => s.version === o.version)) continue;
    const fecha = typeof o.aceptado === "string" && !Number.isNaN(Date.parse(o.aceptado)) ? o.aceptado : null;
    salida.push({ version: o.version, ...c, aceptado: fecha });
  }
  return salida;
}

function leerTiempo(x: unknown): PactoTiempo {
  if (typeof x !== "object" || x === null) return TIEMPO_INICIAL;
  const o = x as Record<string, unknown>;
  const base: PactoTiempo = { ...leerContenido(o), paso: 0, version: 0, historial: [] };
  // Un pacto enviado o aceptado tiene que estar completo; si no, vuelve a borrador.
  const paso = o.paso === 1 || o.paso === 2 ? o.paso : 0;
  if (paso === 0 || !pactoCompleto(base)) return base;
  if (paso === 1) return { ...base, paso };
  // Aceptado. Lo guardado antes de las versiones se lee como versión 1, con fecha sin dato.
  const version = typeof o.version === "number" && Number.isInteger(o.version) && o.version >= 1 ? o.version : 1;
  const historial = leerHistorial(o.historial, version);
  if (!historial.some((h) => h.version === version)) historial.push({ version, ...contenido(base), aceptado: null });
  historial.sort((a, b) => a.version - b.version);
  const aceptado: PactoTiempo = { ...base, paso, version, historial };
  if (typeof o.cambio === "object" && o.cambio !== null) {
    const c = o.cambio as Record<string, unknown>;
    const contenidoCambio = leerContenido(c);
    // Un cambio enviado tiene que estar completo; si no, vuelve a borrador.
    aceptado.cambio = { ...contenidoCambio, paso: c.paso === 1 && pactoCompleto(contenidoCambio) ? 1 : 0 };
  }
  return aceptado;
}

function leerAportes(x: unknown): number[] {
  if (!Array.isArray(x)) return [];
  return x.filter(
    (n): n is number => typeof n === "number" && Number.isInteger(n) && n >= MONTO_USD.min && n <= MONTO_USD.max,
  );
}

function leerTope(x: unknown): Tope | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  return topeDeDatos(typeof o.unidad === "string" ? o.unidad : undefined, String(o.valor));
}

/** Lo guardado de las postulaciones: lo inválido se corrige o se descarta campo por campo; lo enviado incompleto vuelve a borrador. */
function leerPuntuales(x: unknown): PactoPuntual[] {
  if (!Array.isArray(x)) return [];
  const salida: PactoPuntual[] = [];
  for (const v of x) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    const id = o.necesidadId;
    if (typeof id !== "string" || !id || id === "__proto__" || id.includes(":") || salida.some((p) => p.necesidadId === id)) continue;
    const p: PactoPuntual = {
      necesidadId: id,
      rol: ROLES.find((r) => r.clave === o.rol)?.clave ?? "",
      rolOtro: texto(o.rolOtro, MAX_ROL_OTRO),
      descripcion: texto(o.descripcion, MAX_DESCRIPCION),
      horas: horasPuntualValidas(o.horas) ? o.horas : null,
      fecha: fechaValida(o.fecha) ? o.fecha : null,
      tope: leerTope(o.tope),
      topeTotal: leerTope(o.topeTotal),
      paso: "borrador",
    };
    const n = o.noPreadmitida;
    if (typeof n === "object" && n !== null) {
      const m = n as Record<string, unknown>;
      if (typeof m.motivo === "string" && typeof m.cuando === "string") p.noPreadmitida = { motivo: m.motivo.slice(0, 500), cuando: m.cuando };
    }
    if ((o.paso === "enviado" || o.paso === "preadmitido") && puntualCompleto(p)) p.paso = o.paso;
    salida.push(p);
  }
  return salida;
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
        comunidades[id] = { tiempo: leerTiempo(c.tiempo), aportes: leerAportes(c.aportes), puntuales: leerPuntuales(c.puntuales) };
      }
    }
    const estado: EstadoPactos = { pestana: r.pestana === "plata" ? "plata" : "tiempo", comunidades };
    const u = r.ultimaRespuesta;
    if (typeof u === "object" && u !== null && !Array.isArray(u)) {
      const x = u as Record<string, unknown>;
      if (
        x.tipo === "no-acepta" &&
        typeof x.motivo === "string" &&
        typeof x.comunidad === "string" &&
        typeof x.cuando === "string"
      ) {
        estado.ultimaRespuesta = { tipo: "no-acepta", motivo: x.motivo.slice(0, 500), comunidad: x.comunidad, cuando: x.cuando };
        if (x.esCambio === true) estado.ultimaRespuesta.esCambio = true;
      }
    }
    return estado;
  } catch {
    return INICIAL;
  }
}

/* ---------- Conciliación con las constancias de la tribu (pactos-dos-partes) ---------- */

/** Una respuesta de la tribu ya aplicada al pacto de la persona: sirve para anunciar y registrar el evento una sola vez. */
export type RespuestaAplicada = {
  /** "preadmite" y "no-preadmite" son las del holón a una postulación (`necesidadId` y `holon` vienen en ese caso). */
  tipo: "acepta" | "no-acepta" | "preadmite" | "no-preadmite";
  /** Postulación: la necesidad y el holón (`circulo:valle-3`) que respondió. */
  necesidadId?: string;
  holon?: string;
  comunidad: string;
  esCambio: boolean;
  /** Acepta: la versión nueva. No acepta: la versión que sigue vigente (0 si era un pacto nuevo). */
  version: number;
  cuando: string;
  propuestaId: string;
  motivo?: string;
};

/** El contenido que la tribu vio, leído de los `datos` de la propuesta; null si no alcanza para un pacto completo. */
function contenidoDeDatos(d: Record<string, string>): ContenidoPacto | null {
  const horas = Number(d.horas);
  if (!Number.isFinite(horas)) return null;
  const c: ContenidoPacto = {
    rol: ROLES.find((r) => r.clave === d.rol)?.clave ?? "",
    rolOtro: texto(d.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(d.descripcion, MAX_DESCRIPCION),
    horas: acotar(horas, HORAS.min, HORAS.max, HORAS.paso),
  };
  return pactoCompleto(c) ? c : null;
}

/** La última propuesta no revocada de esa persona, comunidad y tipo (pacto nuevo o cambio), o null. */
export function ultimaPropuesta(constancias: readonly ConstanciaPacto[], idPersona: string, comunidad: string, tipo: "nuevo" | "cambio") {
  const sobre = sobreDe(comunidad, idPersona);
  const propias = constancias.filter(
    (c) =>
      c.esquema === "pacto-propone" &&
      c.sobre === sobre &&
      c.afirma === afirmaPersona(idPersona) &&
      c.datos.tipo === tipo &&
      !estaRevocada(constancias, c.id),
  );
  return propias.length > 0 ? propias[propias.length - 1] : null;
}

/**
 * Aplica al pacto de la persona las respuestas de la tribu que están en el registro. Pura: la fecha de lo aceptado es la de la
 * constancia. Lo que vale es lo que la tribu vio (el contenido sale de la propuesta). Sin registro (null) no cambia nada.
 */
export function conciliar(
  estado: EstadoPactos,
  constancias: readonly ConstanciaPacto[] | null,
  idPersona: string,
): { estado: EstadoPactos; aplicadas: RespuestaAplicada[] } {
  if (constancias === null) return { estado, aplicadas: [] };
  let actual = estado;
  const aplicadas: RespuestaAplicada[] = [];
  for (const comunidad of Object.keys(estado.comunidades)) {
    const t = deComunidad(actual, comunidad).tiempo;
    const esCambio = t.paso === 2 && t.cambio?.paso === 1;
    if (t.paso !== 1 && !esCambio) continue;
    const propuesta = ultimaPropuesta(constancias, idPersona, comunidad, esCambio ? "cambio" : "nuevo");
    if (!propuesta) continue;
    const r = respuestaDe(constancias, propuesta.id);
    if (!r) continue;
    // Solo vale la respuesta de la comunidad, de otra persona que la persona del pacto, y de la versión que sigue.
    if (r.afirma !== afirmaComunidad(comunidad) || r.por === idPersona || r.sobre !== propuesta.sobre) continue;
    if (r.version !== t.version + 1 || propuesta.version !== r.version) continue;
    if (r.esquema === "pacto-acepta") {
      const c = contenidoDeDatos(propuesta.datos);
      if (!c) continue;
      let siguiente: EstadoPactos;
      if (esCambio) {
        siguiente = conPacto(actual, comunidad, { ...t, cambio: { ...c, paso: 1 } });
        siguiente = reducir(siguiente, { tipo: "aceptarCambio", comunidad, ahora: r.cuando });
      } else {
        siguiente = conPacto(actual, comunidad, { ...t, ...c });
        siguiente = reducir(siguiente, { tipo: "avanzar", comunidad, ahora: r.cuando });
      }
      if (siguiente === actual) continue;
      actual = sinAviso(siguiente, comunidad);
      aplicadas.push({ tipo: "acepta", comunidad, esCambio, version: r.version, cuando: r.cuando, propuestaId: propuesta.id });
    } else if (r.esquema === "pacto-no-acepta") {
      const siguiente = reducir(actual, esCambio ? { tipo: "rechazarCambio", comunidad } : { tipo: "retirar", comunidad });
      if (siguiente === actual) continue;
      const motivo = texto(r.datos.motivo, 500);
      actual = { ...siguiente, ultimaRespuesta: { tipo: "no-acepta", motivo, comunidad, cuando: r.cuando, ...(esCambio ? { esCambio: true } : {}) } };
      aplicadas.push({ tipo: "no-acepta", comunidad, esCambio, version: t.version, cuando: r.cuando, propuestaId: propuesta.id, motivo });
    }
  }
  const p = conciliarPuntuales(actual, constancias, idPersona);
  return { estado: p.estado, aplicadas: [...aplicadas, ...p.aplicadas] };
}

/** La última postulación no revocada de esa persona a esa necesidad, o null. */
export function ultimaPostulacion(constancias: readonly ConstanciaPacto[], idPersona: string, necesidadId: string): ConstanciaPacto | null {
  const sobre = sobrePuntual(necesidadId, idPersona);
  const propias = constancias.filter(
    (c) => esPostulacion(c) && c.sobre === sobre && c.afirma === afirmaPersona(idPersona) && !estaRevocada(constancias, c.id),
  );
  return propias.length > 0 ? propias[propias.length - 1] : null;
}

/** El contenido que el holón vio, leído de los `datos` de la postulación; null si no alcanza para una postulación completa. */
function contenidoPuntualDeDatos(d: Record<string, string>): ContenidoPuntual | null {
  const horas = Number(d.horas);
  const c: ContenidoPuntual = {
    rol: ROLES.find((r) => r.clave === d.rol)?.clave ?? "",
    rolOtro: texto(d.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(d.descripcion, MAX_DESCRIPCION),
    horas: horasPuntualValidas(horas) ? horas : null,
    fecha: fechaValida(d.fecha) ? d.fecha : null,
    tope: topeDeDatos(d.topeUnidad, d.topeValor),
    topeTotal: topeDeDatos(d.topeTotalUnidad, d.topeTotalValor),
  };
  return puntualCompleto(c) ? c : null;
}

/**
 * Aplica a las postulaciones enviadas de la persona las respuestas del holón que están en el registro. Solo vale una
 * respuesta del holón de la postulación (`contraparteDe`) y de otra persona. Lo que vale es lo que el holón vio.
 */
function conciliarPuntuales(
  estado: EstadoPactos,
  constancias: readonly ConstanciaPacto[],
  idPersona: string,
): { estado: EstadoPactos; aplicadas: RespuestaAplicada[] } {
  let actual = estado;
  const aplicadas: RespuestaAplicada[] = [];
  for (const [comunidad, c] of Object.entries(estado.comunidades)) {
    for (const p of c.puntuales) {
      if (p.paso !== "enviado") continue;
      const propuesta = ultimaPostulacion(constancias, idPersona, p.necesidadId);
      if (!propuesta) continue;
      const r = respuestaDe(constancias, propuesta.id);
      if (!r || r.apuntaA !== propuesta.id || r.version !== propuesta.version || !respuestaValida(propuesta, r)) continue;
      const holon = contraparteDe(propuesta) ?? "";
      if (r.esquema === "pacto-acepta") {
        const contenido = contenidoPuntualDeDatos(propuesta.datos);
        if (!contenido) continue;
        const siguiente = reducirPuntual(actual, { tipo: "preadmitirPuntual", comunidad, necesidadId: p.necesidadId, contenido });
        if (siguiente === actual) continue;
        actual = siguiente;
        aplicadas.push({ tipo: "preadmite", comunidad, esCambio: false, version: r.version, cuando: r.cuando, propuestaId: propuesta.id, necesidadId: p.necesidadId, holon });
      } else if (r.esquema === "pacto-no-acepta") {
        const motivo = texto(r.datos.motivo, 500);
        const siguiente = reducirPuntual(actual, { tipo: "noPreadmitirPuntual", comunidad, necesidadId: p.necesidadId, motivo, cuando: r.cuando });
        if (siguiente === actual) continue;
        actual = siguiente;
        aplicadas.push({ tipo: "no-preadmite", comunidad, esCambio: false, version: r.version, cuando: r.cuando, propuestaId: propuesta.id, necesidadId: p.necesidadId, holon, motivo });
      }
    }
  }
  return { estado: actual, aplicadas };
}

/** Una propuesta que la persona tiene enviada pero que nunca llegó al registro (guardada antes de este cambio). */
export type PorPublicar = {
  comunidad: string;
  tipo: "nuevo" | "cambio";
  contenido: ContenidoPacto;
  version: number;
  horasVigentes?: number;
};

/**
 * Compatibilidad (design §8 y §13): pactos en paso 1 (o cambios enviados) sin ninguna propuesta de ese tipo en el registro.
 * Con el registro ilegible (null) no se publica nada.
 */
export function propuestasPorPublicar(
  estado: EstadoPactos,
  constancias: readonly ConstanciaPacto[] | null,
  idPersona: string,
): PorPublicar[] {
  if (constancias === null) return [];
  const salida: PorPublicar[] = [];
  for (const [comunidad, p] of Object.entries(estado.comunidades)) {
    const t = p.tiempo;
    const tipo = t.paso === 1 ? "nuevo" : t.paso === 2 && t.cambio?.paso === 1 ? "cambio" : null;
    if (!tipo) continue;
    const sobre = sobreDe(comunidad, idPersona);
    const hay = constancias.some((c) => c.esquema === "pacto-propone" && c.sobre === sobre && c.datos.tipo === tipo);
    if (hay) continue;
    if (tipo === "nuevo") salida.push({ comunidad, tipo, contenido: contenido(t), version: t.version + 1 });
    else if (t.cambio) salida.push({ comunidad, tipo, contenido: contenido(t.cambio), version: t.version + 1, horasVigentes: t.horas });
  }
  return salida;
}

/**
 * Lo guardado de la persona con las respuestas de la tribu ya aplicadas, solo en memoria (no guarda nada).
 * `registro` null = no se pudo leer: se devuelve el estado sin conciliar.
 */
export function leerPactosConciliados(
  crudo: string | null,
  idPersona: string | null = personaEnSesion(),
  registro: readonly ConstanciaPacto[] | null = leerDelNavegador(),
): EstadoPactos {
  const estado = leer(crudo);
  return idPersona ? conciliar(estado, registro, idPersona).estado : estado;
}
