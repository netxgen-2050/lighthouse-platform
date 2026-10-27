import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import type { ClaseCompromiso, Compromiso, TipoCompromiso } from "./tipos";

/** Una tarjeta del mercado: un compromiso, de la persona o de ejemplo. */
export type ItemMercado = {
  compromiso: Compromiso;
  /** Quién publica; los de ejemplo dicen "Comunidad (ejemplo)". */
  autor: string;
  propio: boolean;
  /** La descripción en los dos idiomas: la de ejemplo trae su inglés, la propia solo el español de la persona. */
  descripcion: BilingueConOriginal;
  /** La cantidad de bienes de una oferta de ejemplo, con su inglés. */
  bienes?: BilingueConOriginal;
};

export type FiltroMercado = {
  tipo: TipoCompromiso | "todos";
  clase: ClaseCompromiso | "todas";
};

export const AUTOR_EJEMPLO = "Comunidad (ejemplo)";

function ej(
  id: string,
  tipo: TipoCompromiso,
  clase: ClaseCompromiso,
  descripcion: string,
  extra: Partial<Compromiso> = {},
): Compromiso {
  return { id: `ejemplo-${id}`, tipo, clase, descripcion, creado: "2026-10-01T00:00:00.000Z", ...extra };
}

/** Datos de ejemplo de la comunidad; no son personas ni montos reales. */
export const EJEMPLOS_MERCADO: Compromiso[] = [
  ej("1", "ofrezco", "tiempo", "Acompañamiento en el armado de huertas familiares", { horasPorMes: 6 }),
  ej("2", "necesito", "tiempo", "Ayuda para cosechar café en temporada", { horasPorMes: 12 }),
  ej("3", "ofrezco", "bienes", "Plantines de frutales nativos", { cantidadBienes: "30 plantines" }),
  ej("4", "necesito", "bienes", "Madera reciclada para un gallinero", { cantidadBienes: "10 tablones" }),
  ej("5", "ofrezco", "plata", "Aporte para un fondo de herramientas compartidas", { montoUsd: 200 }),
  ej("6", "necesito", "plata", "Aporte para una cisterna de agua de lluvia", { montoUsd: 800 }),
  ej("7", "ofrezco", "trueque", "Clases de apicultura a cambio de miel o semillas"),
  ej("8", "necesito", "trueque", "Reparación de un techo a cambio de comidas caseras"),
];

/**
 * Inglés de las ofertas de ejemplo (borrador a revisar: ver `lib/idioma/revision-nativa.ts`), por id del ejemplo. Las
 * ofertas que publica la persona no tienen traducción: se muestran tal cual las escribió.
 */
const EJEMPLOS_EN: Record<string, { descripcion: string; cantidadBienes?: string }> = {
  "ejemplo-1": { descripcion: "Support setting up family vegetable gardens" },
  "ejemplo-2": { descripcion: "Help harvesting coffee in season" },
  "ejemplo-3": { descripcion: "Native fruit tree seedlings", cantidadBienes: "30 seedlings" },
  "ejemplo-4": { descripcion: "Reclaimed wood for a chicken coop", cantidadBienes: "10 planks" },
  "ejemplo-5": { descripcion: "Contribution to a shared tools fund" },
  "ejemplo-6": { descripcion: "Contribution to a rainwater cistern" },
  "ejemplo-7": { descripcion: "Beekeeping lessons in exchange for honey or seeds" },
  "ejemplo-8": { descripcion: "Roof repair in exchange for home-cooked meals" },
};

/** El texto de la oferta de ejemplo con su inglés y el español como idioma original. */
function bilingue(c: Compromiso): Pick<ItemMercado, "descripcion" | "bienes"> {
  const en = EJEMPLOS_EN[c.id];
  return {
    descripcion: { es: c.descripcion, en: en?.descripcion, original: "es" },
    ...(c.cantidadBienes !== undefined ? { bienes: { es: c.cantidadBienes, en: en?.cantidadBienes, original: "es" as const } } : {}),
  };
}

export function armarMercado(propios: Compromiso[]): ItemMercado[] {
  return [
    // Lo que publica la persona va tal cual, sin inglés: se muestra marcado como español.
    ...propios.map((compromiso) => ({
      compromiso,
      autor: "Vos",
      propio: true,
      descripcion: { es: compromiso.descripcion, original: "es" as const },
    })),
    ...EJEMPLOS_MERCADO.map((compromiso) => ({ compromiso, autor: AUTOR_EJEMPLO, propio: false, ...bilingue(compromiso) })),
  ];
}

export function filtrarMercado(items: ItemMercado[], f: FiltroMercado): ItemMercado[] {
  return items.filter(
    (i) =>
      (f.tipo === "todos" || i.compromiso.tipo === f.tipo) &&
      (f.clase === "todas" || i.compromiso.clase === f.clase),
  );
}
