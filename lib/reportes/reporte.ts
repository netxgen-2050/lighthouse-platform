export const TIPOS = ["bug", "idea", "pregunta"] as const;
export type TipoReporte = (typeof TIPOS)[number];

export const TEXTO_TIPO: Record<TipoReporte, string> = {
  bug: "Algo no funciona",
  idea: "Idea o mejora",
  pregunta: "Pregunta",
};

export const MAX_QUE_PASO = 2000;
export const MAX_ESPERABAS = 2000;
export const MAX_CONTACTO = 200;
export const MAX_CONTEXTO = 500;

export const REPO = "netxgen-2050/lighthouse-platform";

export type Contexto = {
  url: string;
  ruta: string;
  titulo: string;
  pantalla: string;
  navegador: string;
  version: string;
  entorno: string;
  fecha: string;
};

export type Reporte = {
  tipo: TipoReporte;
  quePaso: string;
  esperabas: string;
  contacto: string;
  contexto: Contexto;
};

export type CampoReporte = "tipo" | "quePaso" | "esperabas" | "contacto";

export type ResultadoValidar =
  | { ok: true; reporte: Reporte }
  | { ok: false; errores: Partial<Record<CampoReporte, string>> };

export const CONTEXTO_VACIO: Contexto = {
  url: "sin dato",
  ruta: "sin dato",
  titulo: "sin dato",
  pantalla: "sin dato",
  navegador: "sin dato",
  version: "sin dato",
  entorno: "sin dato",
  fecha: "sin dato",
};

function texto(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function recortar(v: unknown): string {
  const t = texto(v);
  return t.length === 0 ? "sin dato" : t.slice(0, MAX_CONTEXTO);
}

/** Version y entorno vienen de las variables de Vercel; sin ellas se trata como local. */
export function versionDesplegada(env: {
  VERCEL_GIT_COMMIT_SHA?: string;
  VERCEL_ENV?: string;
}): { version: string; entorno: string } {
  const sha = env.VERCEL_GIT_COMMIT_SHA?.trim();
  const e = env.VERCEL_ENV?.trim();
  return {
    version: sha ? sha.slice(0, 7) : "local",
    entorno: e === "production" ? "producción" : e === "preview" ? "preview" : "local",
  };
}

export function armarContexto(entrada: {
  url: string;
  titulo: string;
  ancho: number;
  alto: number;
  navegador: string;
  version: string;
  entorno: string;
  ahora?: Date;
}): Contexto {
  let ruta = "sin dato";
  try {
    const u = new URL(entrada.url);
    ruta = u.pathname + u.search;
  } catch {
    ruta = "sin dato";
  }
  const pantalla =
    Number.isFinite(entrada.ancho) && Number.isFinite(entrada.alto)
      ? `${Math.round(entrada.ancho)} × ${Math.round(entrada.alto)} px`
      : "sin dato";
  return {
    url: recortar(entrada.url),
    ruta,
    titulo: recortar(entrada.titulo),
    pantalla,
    navegador: recortar(entrada.navegador),
    version: recortar(entrada.version),
    entorno: recortar(entrada.entorno),
    fecha: (entrada.ahora ?? new Date()).toISOString(),
  };
}

function limpiarContexto(c: unknown): Contexto {
  const o = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
  return {
    url: recortar(o.url),
    ruta: recortar(o.ruta),
    titulo: recortar(o.titulo),
    pantalla: recortar(o.pantalla),
    navegador: recortar(o.navegador),
    version: recortar(o.version),
    entorno: recortar(o.entorno),
    fecha: recortar(o.fecha),
  };
}

export function validarReporte(entrada: unknown): ResultadoValidar {
  const o = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  const errores: Partial<Record<CampoReporte, string>> = {};
  const tipo = o.tipo;
  if (typeof tipo !== "string" || !(TIPOS as readonly string[]).includes(tipo)) {
    errores.tipo = "Elegí un tipo de reporte.";
  }
  const quePaso = texto(o.quePaso);
  if (quePaso.length === 0) errores.quePaso = "Contanos qué pasó.";
  else if (quePaso.length > MAX_QUE_PASO) errores.quePaso = `Puede tener hasta ${MAX_QUE_PASO} caracteres.`;
  const esperabas = texto(o.esperabas);
  if (esperabas.length > MAX_ESPERABAS) errores.esperabas = `Puede tener hasta ${MAX_ESPERABAS} caracteres.`;
  const contacto = texto(o.contacto);
  if (contacto.length > MAX_CONTACTO) errores.contacto = `Puede tener hasta ${MAX_CONTACTO} caracteres.`;
  if (Object.keys(errores).length > 0) return { ok: false, errores };
  return {
    ok: true,
    reporte: { tipo: tipo as TipoReporte, quePaso, esperabas, contacto, contexto: limpiarContexto(o.contexto) },
  };
}

/** El campo trampa lo llenan los bots; una persona nunca lo ve. */
export function esBot(entrada: unknown): boolean {
  const o = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>;
  return texto(o.sitioWeb).length > 0;
}

export function armarTitulo(r: Pick<Reporte, "tipo" | "quePaso">): string {
  const plano = r.quePaso.replace(/\s+/g, " ").trim();
  const palabras = plano.split(" ").slice(0, 10).join(" ");
  const corto = palabras.length > 80 ? `${palabras.slice(0, 79)}…` : palabras;
  return `[${r.tipo}] ${corto}`;
}

export function armarCuerpo(r: Reporte): string {
  const c = r.contexto;
  return [
    `**Tipo:** ${TEXTO_TIPO[r.tipo]}`,
    "",
    "**¿Qué pasó?**",
    r.quePaso,
    "",
    "**¿Qué esperabas que pasara?**",
    r.esperabas || "sin dato",
    "",
    `**Contacto:** ${r.contacto || "sin dato"}`,
    "",
    "**Contexto**",
    `- URL: ${c.url}`,
    `- Ruta: ${c.ruta}`,
    `- Título de la página: ${c.titulo}`,
    `- Pantalla: ${c.pantalla}`,
    `- Navegador: ${c.navegador}`,
    `- Versión: ${c.version}`,
    `- Entorno: ${c.entorno}`,
    `- Fecha: ${c.fecha}`,
  ].join("\n");
}

export function armarEtiquetas(tipo: TipoReporte): string[] {
  return ["reporte", tipo];
}

/** Texto completo para copiar cuando no se pudo registrar. */
export function textoParaCopiar(r: Reporte): string {
  return `${armarTitulo(r)}\n\n${armarCuerpo(r)}`;
}
