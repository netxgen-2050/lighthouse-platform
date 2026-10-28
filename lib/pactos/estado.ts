import { personaEnSesion } from "@/lib/demo/claves";
import { HORAS, MONTO_USD, ROLES, type ClaveRol } from "./datos";
import {
  afirmaComunidad,
  afirmaPersona,
  estaRevocada,
  respuestaDe,
  sobreDe,
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

/** Lo que una persona tiene en una comunidad: su pacto de tiempo y los aportes en plata (USD) registrados. */
export type PactosDeComunidad = { tiempo: PactoTiempo; aportes: number[] };

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
  return Object.hasOwn(e.comunidades, comunidad) ? e.comunidades[comunidad] : { tiempo: TIEMPO_INICIAL, aportes: [] };
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
  tipo: "acepta" | "no-acepta";
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
