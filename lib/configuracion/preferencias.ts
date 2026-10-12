import { USD_ARS } from "@/lib/pactos/datos";

/** Preferencias de la persona. Prototipo interno: se guardan solo en este navegador (sin cuentas). */
export type Tema = "claro" | "oscuro" | "sistema";
export type TamanoTexto = "normal" | "grande";
export type Moneda = "USD" | "ARS";

/** Tipos de aviso que la persona puede prender o apagar. */
export type TipoAviso = "comunidades" | "pactos" | "rondas" | "mercado" | "postulaciones";

export const TIPOS_AVISO: readonly { id: TipoAviso; etiqueta: string; detalle: string }[] = [
  { id: "comunidades", etiqueta: "Comunidades", detalle: "Cuando una comunidad acepta tu adhesión." },
  { id: "pactos", etiqueta: "Pactos", detalle: "Cuando una comunidad acepta tu pacto." },
  { id: "rondas", etiqueta: "Rondas de reconocimiento", detalle: "Cuando se abre una ronda en tu comunidad." },
  { id: "mercado", etiqueta: "Mercado", detalle: "Cuando alguien se interesa en lo que publicaste." },
  { id: "postulaciones", etiqueta: "Postulaciones", detalle: "Cuando recibimos la postulación de tu comunidad." },
];

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
  /** Por ahora solo español; el inglés llega más adelante. */
  idioma: "es";
};

export const PREFERENCIAS_INICIALES: Preferencias = {
  tema: "sistema",
  texto: "normal",
  reducirAnimaciones: false,
  avisos: { comunidades: true, pactos: true, rondas: true, mercado: true, postulaciones: true },
  mostrarHifa: true,
  moneda: "USD",
  idioma: "es",
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
      idioma: "es",
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

export const NOTA_TIPO_DE_CAMBIO = `Tipo de cambio de ejemplo: 1 USD = ${String(TIPO_DE_CAMBIO).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} ARS. No es una cotización real.`;

function conMiles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Monto en la moneda de referencia elegida. Parte siempre de dólares. Sin dato no se inventa un valor. */
export function formatearMonto(usd: number | null | undefined, moneda: Moneda): string {
  if (usd == null || Number.isNaN(usd)) return "sin dato";
  return moneda === "ARS" ? `ARS ${conMiles(usd * TIPO_DE_CAMBIO)}` : `USD ${conMiles(usd)}`;
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
