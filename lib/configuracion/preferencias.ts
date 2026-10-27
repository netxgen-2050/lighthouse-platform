import { formatearNumero, sinDato } from "@/lib/idioma/formatos";
import { comunes } from "@/lib/idioma/textos/comunes";
import { configuracion } from "@/lib/idioma/textos/configuracion";
import { esIdioma, type Idioma } from "@/lib/idioma/tipos";
import { USD_ARS } from "@/lib/pactos/datos";

/** Preferencias de la persona. Prototipo interno: se guardan solo en este navegador (sin cuentas). */
export type Tema = "claro" | "oscuro" | "sistema";
export type TamanoTexto = "normal" | "grande";
export type Moneda = "USD" | "ARS";

/** Tipos de aviso que la persona puede prender o apagar. */
export type TipoAviso = "comunidades" | "pactos" | "rondas" | "mercado" | "postulaciones";

const IDS_AVISO: readonly TipoAviso[] = ["comunidades", "pactos", "rondas", "mercado", "postulaciones"];

/** Los tipos de aviso con su etiqueta y su explicación en el idioma pedido (el texto vive en el diccionario `configuracion`). */
export function tiposAviso(idioma: Idioma = "es"): readonly { id: TipoAviso; etiqueta: string; detalle: string }[] {
  const t = configuracion[idioma].avisos.tipos;
  return IDS_AVISO.map((id) => ({ id, ...t[id] }));
}

/** Los mismos tipos en español (el idioma por defecto). Las páginas traducidas usan `tiposAviso(idioma)`. */
export const TIPOS_AVISO = tiposAviso("es");

/** Qué tipos de evento de la actividad (`EventoActividad.tipo`) corresponden a cada tipo de aviso. */
const EVENTOS_DE_AVISO: Record<TipoAviso, readonly string[]> = {
  comunidades: ["adhesion-aceptada"],
  pactos: ["pacto-aceptado"],
  rondas: ["ronda-abierta"],
  mercado: ["interes-oferta"],
  postulaciones: ["postulacion-recibida"],
};

export type Preferencias = {
  tema: Tema;
  texto: TamanoTexto;
  reducirAnimaciones: boolean;
  avisos: Record<TipoAviso, boolean>;
  mostrarHifa: boolean;
  moneda: Moneda;
  /**
   * Idioma que la persona eligió ("es" o "en"); null = no eligió (se usa el del navegador). El campo viejo `idioma: "es"`
   * se ignora al leer: nunca fue una elección.
   */
  idiomaElegido: Idioma | null;
};

export const PREFERENCIAS_INICIALES: Preferencias = {
  tema: "sistema",
  texto: "normal",
  reducirAnimaciones: false,
  avisos: { comunidades: true, pactos: true, rondas: true, mercado: true, postulaciones: true },
  mostrarHifa: true,
  moneda: "USD",
  idiomaElegido: null,
};

/** Lee lo guardado; cada campo roto o ausente vuelve a su valor inicial. */
export function leerPreferencias(crudo: string | null): Preferencias {
  const base = PREFERENCIAS_INICIALES;
  if (!crudo) return base;
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return base;
    const r = o as Record<string, unknown>;
    const avisosCrudos = typeof r.avisos === "object" && r.avisos !== null ? (r.avisos as Record<string, unknown>) : {};
    const avisos = { ...base.avisos };
    for (const t of TIPOS_AVISO) {
      if (typeof avisosCrudos[t.id] === "boolean") avisos[t.id] = avisosCrudos[t.id] as boolean;
    }
    return {
      tema: r.tema === "claro" || r.tema === "oscuro" || r.tema === "sistema" ? r.tema : base.tema,
      texto: r.texto === "normal" || r.texto === "grande" ? r.texto : base.texto,
      reducirAnimaciones: typeof r.reducirAnimaciones === "boolean" ? r.reducirAnimaciones : base.reducirAnimaciones,
      avisos,
      mostrarHifa: typeof r.mostrarHifa === "boolean" ? r.mostrarHifa : base.mostrarHifa,
      moneda: r.moneda === "USD" || r.moneda === "ARS" ? r.moneda : base.moneda,
      idiomaElegido: esIdioma(r.idiomaElegido) ? r.idiomaElegido : null,
    };
  } catch {
    return base;
  }
}

/** Tipos de evento de la actividad que la persona apagó (no se cuentan ni se muestran en la bandeja). */
export function tiposOcultos(p: Preferencias): string[] {
  return TIPOS_AVISO.filter((t) => !p.avisos[t.id]).flatMap((t) => EVENTOS_DE_AVISO[t.id]);
}

/** Tipo de cambio de ejemplo (el mismo valor de referencia de Pactos). No es una cotización real. */
export const TIPO_DE_CAMBIO = USD_ARS;

/** Nota del tipo de cambio de ejemplo en el idioma pedido. */
export function notaTipoDeCambio(idioma: Idioma = "es"): string {
  return comunes[idioma].notaTipoDeCambio(formatearNumero(TIPO_DE_CAMBIO, idioma));
}

/** La misma nota en español (el idioma por defecto). Las páginas traducidas usan `notaTipoDeCambio(idioma)`. */
export const NOTA_TIPO_DE_CAMBIO = notaTipoDeCambio("es");

/** Monto en la moneda de referencia elegida. Parte siempre de dólares. Sin dato no se inventa un valor. */
export function formatearMonto(usd: number | null | undefined, moneda: Moneda, idioma: Idioma = "es"): string {
  if (usd == null || Number.isNaN(usd)) return sinDato(idioma);
  return moneda === "ARS" ? `ARS ${formatearNumero(usd * TIPO_DE_CAMBIO, idioma)}` : `USD ${formatearNumero(usd, idioma)}`;
}

/** Atributos que se ponen en <html> para aplicar la apariencia (los lee `app/globals.css`). */
export function atributosDeApariencia(p: Preferencias, sistemaOscuro: boolean) {
  return {
    "data-tema": p.tema === "sistema" ? (sistemaOscuro ? "oscuro" : "claro") : p.tema,
    "data-texto": p.texto,
    "data-movimiento": p.reducirAnimaciones ? "reducido" : "normal",
    "data-hifa": p.mostrarHifa ? "visible" : "apagada",
  } as const;
}
