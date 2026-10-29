import { personaEnSesion } from "@/lib/demo/claves";
import type { Necesidad, Tope } from "@/lib/tribus/necesidades";
import { HORAS, HORAS_PUNTUAL, MONTO_USD, RANGO_VARIABLE, ROLES, type ClaveRol } from "./datos";
import { compromisoMinimoDe, esCompromisoValido, type CompromisoMeses } from "./formatos";
import { mesDe, mesValido } from "./mes";
import { respuestaDeMes } from "./mensual";
import {
  afirmaComunidad,
  afirmaPersona,
  contraparteDe,
  esPostulacion,
  estaRevocada,
  respuestaDe,
  respuestaDeHoras,
  respuestaValida,
  sobreDe,
  sobrePuntual,
  topeDeDatos,
  type ConstanciaPacto,
} from "./constancias";
import { constanciaBasePuntual, leerConstanciaBase, type ConstanciaBase } from "./constancia-base";
import { horasParaConciliar, repartidoAntesDe } from "./horas";
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

/** "fija": las horas de cada mes son una sola cifra; "variable": un rango por mes y las horas de cada mes se declaran y confirma la comunidad. */
export type Modalidad = "fija" | "variable";
export type RangoHoras = { min: number; max: number };

/** Lo que dice un pacto de tiempo: rol, descripción y horas (o, con "variable", un rango por mes y el compromiso mínimo). */
export type ContenidoPacto = {
  /** Vacío hasta que la persona elige un rol. */
  rol: ClaveRol | "";
  /** Texto libre cuando el rol es "Otro". */
  rolOtro: string;
  descripcion: string;
  /** Lo guardado antes de `pactos-horas-variables` no la tiene: se lee como "fija". */
  modalidad: Modalidad;
  /** Se usa con "fija". */
  horas: number;
  /** Se usa con "variable". */
  rango: RangoHoras;
  /** Con "variable": el compromiso mínimo de la comunidad, en meses. Con "fija": null. */
  compromisoMeses: CompromisoMeses | null;
};

/**
 * Las horas que la persona declaró de un mes (pacto variable). "declarada": espera a la comunidad; "confirmada": la comunidad la
 * confirmó (solo esta genera Semillas); "a-revisar": la comunidad pidió revisarla y se puede declarar de nuevo.
 */
export type EstadoDeclaracion = "declarada" | "confirmada" | "a-revisar";
export type DeclaracionMes = {
  horas: number;
  estado: EstadoDeclaracion;
  /** La `pacto-propone-horas` vigente de ese mes. */
  propuestaId: string;
  /** Con "a-revisar": lo que escribió la comunidad. */
  motivo?: string;
};

/** Un cambio propuesto a un pacto aceptado: 0 = borrador, 1 = enviado a la comunidad. */
export type CambioPropuesto = ContenidoPacto & { paso: 0 | 1 };

/** Una versión que la comunidad aceptó. `aceptado` es la fecha ISO, o null si no se sabe ("sin dato"). */
export type VersionAceptada = ContenidoPacto & { version: number; aceptado: string | null };

/**
 * Los campos de contenido son la versión vigente. `version` es 0 mientras nunca se aceptó; `cambio` solo
 * existe con `paso === 2`; `historial` va en orden cronológico (la pantalla lo muestra al revés). `declaradas` ("AAAA-MM") vive
 * en el pacto, no en la versión: se conserva al aceptar un cambio.
 */
export type PactoTiempo = ContenidoPacto & {
  paso: Paso;
  version: number;
  cambio?: CambioPropuesto;
  historial: VersionAceptada[];
  declaradas: Record<string, DeclaracionMes>;
};

/** Pasos de una postulación a una tarea: `hecha` = marcada hecha, esperando la verificación; `verificado` = el holón verificó las horas. */
export type PasoPuntual = "borrador" | "enviado" | "preadmitido" | "hecha" | "verificado";

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
  /** Horas reales que marcó la persona (desde `hecha`); en `verificado`, las que vio el holón. */
  horasReales?: number;
  /** El último "pidió revisar las horas", para el aviso (con la tarea vuelta a "pre-admitida"). */
  avisoRevisar?: { motivo: string; cuando: string };
  /** La constancia base de Semillas (solo en `verificado`). */
  constancia?: ConstanciaBase;
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
  modalidad: "fija",
  horas: HORAS.inicial,
  rango: { min: RANGO_VARIABLE.inicial.min, max: RANGO_VARIABLE.inicial.max },
  compromisoMeses: null,
  paso: 0,
  version: 0,
  historial: [],
  declaradas: {},
};
export const INICIAL: EstadoPactos = { pestana: "tiempo", comunidades: {} };

/** `ahora` (ISO) lo pone quien llama: el reductor sigue siendo puro. */
export type Accion =
  | { tipo: "pestana"; pestana: Pestana }
  | { tipo: "rol"; comunidad: string; rol: ClaveRol | "" }
  | { tipo: "rolOtro"; comunidad: string; texto: string }
  | { tipo: "descripcion"; comunidad: string; texto: string }
  | { tipo: "horas"; comunidad: string; horas: number }
  | { tipo: "modalidad"; comunidad: string; modalidad: Modalidad }
  | { tipo: "rango"; comunidad: string; min?: number; max?: number }
  | { tipo: "avanzar"; comunidad: string; ahora?: string }
  | { tipo: "retirar"; comunidad: string }
  | { tipo: "proponerCambio"; comunidad: string }
  | { tipo: "editarCambio"; comunidad: string; cambios: Partial<ContenidoPacto> }
  | { tipo: "enviarCambio"; comunidad: string }
  | { tipo: "retirarCambio"; comunidad: string }
  | { tipo: "aceptarCambio"; comunidad: string; ahora?: string }
  | { tipo: "rechazarCambio"; comunidad: string }
  | { tipo: "descartarCambio"; comunidad: string }
  | { tipo: "aporte"; comunidad: string; montoUsd: number }
  | { tipo: "declarar"; comunidad: string; mes: string; horas: number; propuestaId: string; ahora: string }
  | { tipo: "confirmarMes"; comunidad: string; mes: string; propuestaId: string }
  | { tipo: "revisarMes"; comunidad: string; mes: string; propuestaId: string; motivo: string };

function acotar(n: number, min: number, max: number, paso: number): number {
  const v = Math.min(max, Math.max(min, n));
  return Math.round((v - min) / paso) * paso + min;
}

/** Lo guardado de una comunidad, o lo inicial si todavía no hay nada. */
export function deComunidad(e: EstadoPactos, comunidad: string): PactosDeComunidad {
  return Object.hasOwn(e.comunidades, comunidad) ? e.comunidades[comunidad] : { tiempo: TIEMPO_INICIAL, aportes: [], puntuales: [] };
}

/** ¿Es un número del rango variable: entero de 0 a 80, en pasos de 2? */
function horaDeRango(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= RANGO_VARIABLE.min && n <= RANGO_VARIABLE.max && n % RANGO_VARIABLE.paso === 0;
}

/** ¿Es un rango válido? Los dos extremos en el rango variable y el mínimo menor que el máximo. */
export function rangoValido(r: RangoHoras): boolean {
  return horaDeRango(r.min) && horaDeRango(r.max) && r.min < r.max;
}

/**
 * ¿Están el rol (y su texto si es "Otro") y la descripción propia? Con "variable", además el rango (mínimo menor que máximo) y
 * el compromiso mínimo. Sin eso no se puede enviar.
 */
export function pactoCompleto(p: ContenidoPacto): boolean {
  if (!p.rol) return false;
  if (p.rol === "otro" && !p.rolOtro.trim()) return false;
  if (p.descripcion.trim().length === 0) return false;
  return p.modalidad !== "variable" || (rangoValido(p.rango) && esCompromisoValido(p.compromisoMeses));
}

function contenido(p: ContenidoPacto): ContenidoPacto {
  return {
    rol: p.rol,
    rolOtro: p.rolOtro,
    descripcion: p.descripcion,
    modalidad: p.modalidad,
    horas: p.horas,
    rango: { min: p.rango.min, max: p.rango.max },
    compromisoMeses: p.modalidad === "variable" ? p.compromisoMeses : null,
  };
}

/** El compromiso (en meses) de la última versión variable aceptada, para no perderlo si el pacto pasa a fija y vuelve a variable. */
export function compromisoAnterior(t: PactoTiempo): CompromisoMeses | null {
  for (let i = t.historial.length - 1; i >= 0; i--) {
    const c = t.historial[i].compromisoMeses;
    if (t.historial[i].modalidad === "variable" && esCompromisoValido(c)) return c;
  }
  return null;
}

/**
 * El compromiso mínimo que lleva un pacto variable. Un cambio NO lo cambia: se copia el de la versión vigente (o el de la última
 * versión variable). Un pacto nuevo toma el de la comunidad.
 */
export function compromisoDelPacto(t: PactoTiempo, comunidad: string, esCambio: boolean): CompromisoMeses {
  if (esCambio) {
    if (t.modalidad === "variable" && esCompromisoValido(t.compromisoMeses)) return t.compromisoMeses;
    return compromisoAnterior(t) ?? compromisoMinimoDe(comunidad);
  }
  return esCompromisoValido(t.compromisoMeses) ? t.compromisoMeses : compromisoMinimoDe(comunidad);
}

/** Pasa el borrador (o el cambio) a la modalidad dada, con su compromiso. */
function conModalidad<T extends ContenidoPacto>(c: T, modalidad: Modalidad, compromiso: CompromisoMeses): T {
  return { ...c, modalidad, compromisoMeses: modalidad === "variable" ? compromiso : null };
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
    case "modalidad":
      return conTiempo(e, a.comunidad, (t) => conModalidad(t, a.modalidad, compromisoDelPacto(t, a.comunidad, false)));
    case "rango":
      return conTiempo(e, a.comunidad, (t) => ({ ...t, rango: editarRango(t.rango, a.min, a.max) }));
    case "avanzar": {
      const actual = deComunidad(e, a.comunidad);
      const t0 = actual.tiempo;
      if (t0.paso >= 2) return e;
      // El compromiso del pacto variable es el de la comunidad al enviar (si ya lo trae, el que la comunidad vio).
      const t: PactoTiempo = t0.paso === 0 ? conModalidad(t0, t0.modalidad, compromisoDelPacto(t0, a.comunidad, false)) : t0;
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
      let nuevo: CambioPropuesto = { ...t.cambio };
      if (c.rol !== undefined) nuevo.rol = ROLES.find((r) => r.clave === c.rol)?.clave ?? "";
      if (c.rolOtro !== undefined) nuevo.rolOtro = c.rolOtro.slice(0, MAX_ROL_OTRO);
      if (c.descripcion !== undefined) nuevo.descripcion = c.descripcion.slice(0, MAX_DESCRIPCION);
      if (c.horas !== undefined && Number.isFinite(c.horas)) nuevo.horas = acotar(c.horas, HORAS.min, HORAS.max, HORAS.paso);
      // Un cambio no cambia el compromiso: al pasar a variable lleva el de la versión vigente.
      if (c.modalidad === "fija" || c.modalidad === "variable") nuevo = conModalidad(nuevo, c.modalidad, compromisoDelPacto(t, a.comunidad, true));
      if (c.rango !== undefined) nuevo.rango = editarRango(nuevo.rango, c.rango.min, c.rango.max);
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
    case "declarar": {
      const t = deComunidad(e, a.comunidad).tiempo;
      if (motivoNoDeclara(t, a.mes, a.horas, a.ahora) !== null) return e;
      return conPacto(e, a.comunidad, { ...t, declaradas: { ...t.declaradas, [a.mes]: { horas: a.horas, estado: "declarada", propuestaId: a.propuestaId } } });
    }
    case "confirmarMes": {
      const t = deComunidad(e, a.comunidad).tiempo;
      const d = Object.hasOwn(t.declaradas, a.mes) ? t.declaradas[a.mes] : undefined;
      // Cada transición vale solo desde "declarada" y para la declaración vigente: leer dos veces una respuesta no la aplica dos veces.
      if (!d || d.estado !== "declarada" || d.propuestaId !== a.propuestaId) return e;
      return conPacto(e, a.comunidad, { ...t, declaradas: { ...t.declaradas, [a.mes]: { horas: d.horas, estado: "confirmada", propuestaId: d.propuestaId } } });
    }
    case "revisarMes": {
      const t = deComunidad(e, a.comunidad).tiempo;
      const d = Object.hasOwn(t.declaradas, a.mes) ? t.declaradas[a.mes] : undefined;
      if (!d || d.estado !== "declarada" || d.propuestaId !== a.propuestaId) return e;
      const motivo = a.motivo.slice(0, 500);
      return conPacto(e, a.comunidad, {
        ...t,
        declaradas: { ...t.declaradas, [a.mes]: { horas: d.horas, estado: "a-revisar", propuestaId: d.propuestaId, motivo } },
      });
    }
  }
}

function editarRango(r: RangoHoras, min?: number, max?: number): RangoHoras {
  const lim = (n: number) => acotar(n, RANGO_VARIABLE.min, RANGO_VARIABLE.max, RANGO_VARIABLE.paso);
  return {
    min: min !== undefined && Number.isFinite(min) ? lim(min) : r.min,
    max: max !== undefined && Number.isFinite(max) ? lim(max) : r.max,
  };
}

/* ---------- Horas de cada mes de un pacto variable (pactos-horas-variables) ---------- */

export type MotivoNoDeclara = "sin-pacto" | "fuera-de-rango" | "mes" | "confirmada";

/**
 * ¿Se pueden declarar esas horas de ese mes? Solo con el pacto aceptado y la versión vigente "variable"; las horas enteras, en pasos de
 * 2 y dentro del rango vigente; y el mes en curso (hora de Argentina) que no esté confirmado, o un mes pasado que la comunidad
 * pidió revisar. Un mes futuro, un mes pasado sin revisar o un mes confirmado no se declaran. null = se puede.
 */
export function motivoNoDeclara(t: PactoTiempo, mes: string, horas: number, ahora: string): MotivoNoDeclara | null {
  if (t.paso !== 2 || t.modalidad !== "variable" || !mesValido(mes)) return "sin-pacto";
  if (!horaDeRango(horas) || horas < t.rango.min || horas > t.rango.max) return "fuera-de-rango";
  const enCurso = mesDe(ahora);
  if (enCurso === "") return "mes";
  const previa = Object.hasOwn(t.declaradas, mes) ? t.declaradas[mes] : undefined;
  if (previa?.estado === "confirmada") return "confirmada";
  if (mes === enCurso) return null;
  return previa?.estado === "a-revisar" && mes < enCurso ? null : "mes";
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
  | { tipo: "noPreadmitirPuntual"; comunidad: string; necesidadId: string; motivo: string; cuando: string }
  | { tipo: "marcarHecha"; comunidad: string; necesidadId: string; horasReales: number }
  | { tipo: "retirarHecha"; comunidad: string; necesidadId: string }
  | { tipo: "verificarHoras"; comunidad: string; necesidadId: string; constancia: ConstanciaBase }
  | { tipo: "pedirRevisarHoras"; comunidad: string; necesidadId: string; motivo: string; cuando: string };

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
    case "marcarHecha":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "preadmitido", (p) => {
        if (!horasPuntualValidas(a.horasReales)) return p;
        const { avisoRevisar: _a, ...resto } = p;
        void _a;
        return { ...resto, paso: "hecha", horasReales: a.horasReales };
      });
    case "retirarHecha":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "hecha", (p) => {
        const { horasReales: _h, ...resto } = p;
        void _h;
        return { ...resto, paso: "preadmitido" };
      });
    case "verificarHoras":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "hecha", (p) => {
        const c = leerConstanciaBase(a.constancia);
        if (!c) return p;
        return { ...p, paso: "verificado", horasReales: c.datos.horas, constancia: c };
      });
    case "pedirRevisarHoras":
      return cambiarPuntual(e, a.comunidad, a.necesidadId, "hecha", (p) => {
        const { horasReales: _h, ...resto } = p;
        void _h;
        return { ...resto, paso: "preadmitido", avisoRevisar: { motivo: a.motivo.slice(0, 500), cuando: a.cuando } };
      });
  }
}

/** Todas las postulaciones de la persona, con su comunidad. */
export function puntualesDe(e: EstadoPactos): { comunidad: string; puntual: PactoPuntual }[] {
  return Object.entries(e.comunidades).flatMap(([comunidad, c]) => c.puntuales.map((puntual) => ({ comunidad, puntual })));
}

/** Pactos de tiempo aceptados, por comunidad: lo que Semillas suma. */
export function pactosAceptados(e: EstadoPactos): {
  comunidad: string;
  horas: number;
  rol: ClaveRol;
  modalidad: Modalidad;
  rango: RangoHoras;
  compromisoMeses: CompromisoMeses | null;
}[] {
  const salida: ReturnType<typeof pactosAceptados> = [];
  for (const [comunidad, p] of Object.entries(e.comunidades)) {
    if (p.tiempo.paso === 2 && p.tiempo.rol) {
      salida.push({
        comunidad,
        horas: p.tiempo.horas,
        rol: p.tiempo.rol,
        modalidad: p.tiempo.modalidad,
        rango: p.tiempo.rango,
        compromisoMeses: p.tiempo.compromisoMeses,
      });
    }
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

function leerRango(x: unknown): RangoHoras {
  const inicial = { min: RANGO_VARIABLE.inicial.min, max: RANGO_VARIABLE.inicial.max };
  if (typeof x !== "object" || x === null) return inicial;
  const o = x as Record<string, unknown>;
  const lim = (n: unknown, otro: number) =>
    typeof n === "number" && Number.isFinite(n) ? acotar(n, RANGO_VARIABLE.min, RANGO_VARIABLE.max, RANGO_VARIABLE.paso) : otro;
  return { min: lim(o.min, inicial.min), max: lim(o.max, inicial.max) };
}

/** Lo guardado sin modalidad (antes de `pactos-horas-variables`) se lee como "fija"; sin compromiso. */
function leerContenido(o: Record<string, unknown>, comunidad: string): ContenidoPacto {
  const modalidad: Modalidad = o.modalidad === "variable" ? "variable" : "fija";
  return {
    rol: ROLES.find((r) => r.clave === o.rol)?.clave ?? "",
    rolOtro: texto(o.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(o.descripcion, MAX_DESCRIPCION),
    modalidad,
    horas:
      typeof o.horas === "number" && Number.isFinite(o.horas)
        ? acotar(o.horas, HORAS.min, HORAS.max, HORAS.paso)
        : HORAS.inicial,
    rango: leerRango(o.rango),
    compromisoMeses: modalidad === "variable" ? (esCompromisoValido(o.compromisoMeses) ? o.compromisoMeses : compromisoMinimoDe(comunidad)) : null,
  };
}

/** Las declaraciones guardadas: se descartan las de un mes inválido, horas fuera del rango variable, estado desconocido o un mes posterior al actual. */
function leerDeclaradas(x: unknown, ahora: string): Record<string, DeclaracionMes> {
  const salida: Record<string, DeclaracionMes> = {};
  if (typeof x !== "object" || x === null || Array.isArray(x)) return salida;
  const enCurso = mesDe(ahora);
  for (const [mes, v] of Object.entries(x)) {
    if (!mesValido(mes) || (enCurso !== "" && mes > enCurso) || typeof v !== "object" || v === null) continue;
    const d = v as Record<string, unknown>;
    if (!horaDeRango(d.horas) || (d.estado !== "declarada" && d.estado !== "confirmada" && d.estado !== "a-revisar")) continue;
    if (typeof d.propuestaId !== "string" || !d.propuestaId) continue;
    const decl: DeclaracionMes = { horas: d.horas, estado: d.estado, propuestaId: d.propuestaId };
    if (d.estado === "a-revisar") decl.motivo = texto(d.motivo, 500);
    salida[mes] = decl;
  }
  return salida;
}

function leerHistorial(x: unknown, vigente: number, comunidad: string): VersionAceptada[] {
  if (!Array.isArray(x)) return [];
  const salida: VersionAceptada[] = [];
  for (const v of x) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    const c = leerContenido(o, comunidad);
    if (typeof o.version !== "number" || !Number.isInteger(o.version) || o.version < 1 || !pactoCompleto(c)) continue;
    if (o.version > vigente || salida.some((s) => s.version === o.version)) continue;
    const fecha = typeof o.aceptado === "string" && !Number.isNaN(Date.parse(o.aceptado)) ? o.aceptado : null;
    salida.push({ version: o.version, ...c, aceptado: fecha });
  }
  return salida;
}

function leerTiempo(x: unknown, comunidad: string, ahora: string): PactoTiempo {
  if (typeof x !== "object" || x === null) return TIEMPO_INICIAL;
  const o = x as Record<string, unknown>;
  const base: PactoTiempo = { ...leerContenido(o, comunidad), paso: 0, version: 0, historial: [], declaradas: {} };
  // Un pacto enviado o aceptado tiene que estar completo; si no, vuelve a borrador.
  const paso = o.paso === 1 || o.paso === 2 ? o.paso : 0;
  if (paso === 0 || !pactoCompleto(base)) return base;
  if (paso === 1) return { ...base, paso };
  // Aceptado. Lo guardado antes de las versiones se lee como versión 1, con fecha sin dato.
  const version = typeof o.version === "number" && Number.isInteger(o.version) && o.version >= 1 ? o.version : 1;
  const historial = leerHistorial(o.historial, version, comunidad);
  if (!historial.some((h) => h.version === version)) historial.push({ version, ...contenido(base), aceptado: null });
  historial.sort((a, b) => a.version - b.version);
  const aceptado: PactoTiempo = { ...base, paso, version, historial, declaradas: leerDeclaradas(o.declaradas, ahora) };
  if (typeof o.cambio === "object" && o.cambio !== null) {
    const c = o.cambio as Record<string, unknown>;
    const contenidoCambio = leerContenido(c, comunidad);
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
    const av = o.avisoRevisar;
    if (typeof av === "object" && av !== null) {
      const m = av as Record<string, unknown>;
      if (typeof m.motivo === "string" && typeof m.cuando === "string") p.avisoRevisar = { motivo: m.motivo.slice(0, 500), cuando: m.cuando };
    }
    if (puntualCompleto(p)) {
      if (o.paso === "enviado" || o.paso === "preadmitido") p.paso = o.paso;
      else if (o.paso === "hecha" || o.paso === "verificado") {
        // Hecha sin horas válidas vuelve a pre-admitida; verificada sin constancia válida vuelve a hecha.
        if (horasPuntualValidas(o.horasReales)) {
          p.paso = "hecha";
          p.horasReales = o.horasReales;
          const c = o.paso === "verificado" ? leerConstanciaBase(o.constancia) : null;
          if (c && c.datos.necesidad === id) {
            p.paso = "verificado";
            p.horasReales = c.datos.horas;
            p.constancia = c;
          }
        } else p.paso = "preadmitido";
      }
    }
    salida.push(p);
  }
  return salida;
}

/** Lee lo guardado; cualquier cosa rara se descarta campo por campo. Lo guardado con el formato anterior se ignora. */
export function leer(crudo: string | null, ahora: string = new Date().toISOString()): EstadoPactos {
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
        comunidades[id] = { tiempo: leerTiempo(c.tiempo, id, ahora), aportes: leerAportes(c.aportes), puntuales: leerPuntuales(c.puntuales) };
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
  tipo: "acepta" | "no-acepta" | "preadmite" | "no-preadmite" | "verifica" | "pide-revisar" | "confirma-mes" | "revisa-mes";
  /** Confirma y revisa un mes: el mes ("AAAA-MM") y las horas que declaró la persona. */
  mes?: string;
  horas?: number;
  /** Verifica y pide revisar: el id de la respuesta del holón (para registrar el evento una sola vez). */
  respuestaId?: string;
  /** Verifica: las Semillas de la constancia base. */
  semillas?: number;
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
function contenidoDeDatos(d: Record<string, string>, comunidad: string): ContenidoPacto | null {
  const horas = Number(d.horas);
  if (!Number.isFinite(horas)) return null;
  // Lo guardado sin modalidad (propuestas de antes de `pactos-horas-variables`) es "fija".
  const modalidad: Modalidad = d.modalidad === "variable" ? "variable" : "fija";
  const compromiso = Number(d.compromisoMeses);
  const c: ContenidoPacto = {
    rol: ROLES.find((r) => r.clave === d.rol)?.clave ?? "",
    rolOtro: texto(d.rolOtro, MAX_ROL_OTRO),
    descripcion: texto(d.descripcion, MAX_DESCRIPCION),
    modalidad,
    horas: acotar(horas, HORAS.min, HORAS.max, HORAS.paso),
    rango: { min: Number(d.rangoMin), max: Number(d.rangoMax) },
    compromisoMeses: modalidad === "variable" ? (esCompromisoValido(compromiso) ? compromiso : compromisoMinimoDe(comunidad)) : null,
  };
  // Lo que la tribu vio manda: un rango que no sirve (o ausente en una variable) no se acepta; en una fija el rango no se usa.
  if (modalidad === "fija") c.rango = { min: RANGO_VARIABLE.inicial.min, max: RANGO_VARIABLE.inicial.max };
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
      const c = contenidoDeDatos(propuesta.datos, comunidad);
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
  const m = conciliarMeses(actual, constancias, idPersona);
  const p = conciliarPuntuales(m.estado, constancias, idPersona);
  return { estado: p.estado, aplicadas: [...aplicadas, ...m.aplicadas, ...p.aplicadas] };
}

/**
 * Aplica a las horas declaradas de cada mes las respuestas de la comunidad que están en el registro (pactos-horas-variables,
 * design §3). Cada transición vale solo desde "declarada" y para la declaración vigente: leer dos veces una respuesta no la aplica
 * dos veces, y una respuesta a una declaración ya revocada se ignora. Lo que vale es lo que la comunidad vio.
 */
function conciliarMeses(
  estado: EstadoPactos,
  constancias: readonly ConstanciaPacto[],
  idPersona: string,
): { estado: EstadoPactos; aplicadas: RespuestaAplicada[] } {
  let actual = estado;
  const aplicadas: RespuestaAplicada[] = [];
  for (const [comunidad, c] of Object.entries(estado.comunidades)) {
    for (const [mes, d] of Object.entries(c.tiempo.declaradas)) {
      if (d.estado !== "declarada") continue;
      const h = constancias.find((x) => x.id === d.propuestaId);
      if (!h || h.sobre !== sobreDe(comunidad, idPersona) || h.afirma !== afirmaPersona(idPersona) || h.datos.mes !== mes) continue;
      const r = respuestaDeMes(constancias, h);
      if (!r) continue;
      const base = { comunidad, esCambio: false, version: c.tiempo.version, cuando: r.cuando, propuestaId: h.id, respuestaId: r.id, mes, horas: d.horas };
      if (r.esquema === "pacto-confirma-horas") {
        const siguiente = reducir(actual, { tipo: "confirmarMes", comunidad, mes, propuestaId: h.id });
        if (siguiente === actual) continue;
        actual = siguiente;
        aplicadas.push({ ...base, tipo: "confirma-mes" });
      } else {
        const motivo = texto(r.datos.motivo, 500);
        const siguiente = reducir(actual, { tipo: "revisarMes", comunidad, mes, propuestaId: h.id, motivo });
        if (siguiente === actual) continue;
        actual = siguiente;
        aplicadas.push({ ...base, tipo: "revisa-mes", motivo });
      }
    }
  }
  return { estado: actual, aplicadas };
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
      if (p.paso === "hecha") {
        const post = ultimaPostulacion(constancias, idPersona, p.necesidadId);
        const h = post ? horasParaConciliar(constancias, post.id) : null;
        const resp = h ? respuestaDeHoras(constancias, h) : null;
        if (!post || !h || !resp) continue;
        const holon = contraparteDe(post) ?? "";
        if (resp.esquema === "pacto-confirma-horas") {
          const conf = constanciaBasePuntual(
            comunidad,
            { necesidadId: p.necesidadId, postulacionId: post.id, fecha: p.fecha ?? "", tope: p.tope, topeTotal: p.topeTotal },
            resp,
            repartidoAntesDe(constancias, p.necesidadId, resp.id, p.topeTotal),
          );
          if (!conf) continue;
          const siguiente = reducirPuntual(actual, { tipo: "verificarHoras", comunidad, necesidadId: p.necesidadId, constancia: conf });
          if (siguiente === actual) continue;
          actual = siguiente;
          aplicadas.push({ tipo: "verifica", comunidad, esCambio: false, version: resp.version, cuando: resp.cuando, propuestaId: h.id, respuestaId: resp.id, necesidadId: p.necesidadId, holon, semillas: conf.datos.semillas });
        } else {
          const motivo = texto(resp.datos.motivo, 500);
          const siguiente = reducirPuntual(actual, { tipo: "pedirRevisarHoras", comunidad, necesidadId: p.necesidadId, motivo, cuando: resp.cuando });
          if (siguiente === actual) continue;
          actual = siguiente;
          aplicadas.push({ tipo: "pide-revisar", comunidad, esCambio: false, version: resp.version, cuando: resp.cuando, propuestaId: h.id, respuestaId: resp.id, necesidadId: p.necesidadId, holon, motivo });
        }
        continue;
      }
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
  vigente?: Pick<ContenidoPacto, "modalidad" | "horas" | "rango">;
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
    else if (t.cambio) salida.push({ comunidad, tipo, contenido: contenido(t.cambio), version: t.version + 1, vigente: { modalidad: t.modalidad, horas: t.horas, rango: t.rango } });
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
  ahora: string = new Date().toISOString(),
): EstadoPactos {
  const estado = leer(crudo, ahora);
  return idPersona ? conciliar(estado, registro, idPersona).estado : estado;
}
