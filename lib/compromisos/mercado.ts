import type { ClaseCompromiso, Compromiso, TipoCompromiso } from "./tipos";

/** Una tarjeta del mercado: un compromiso, de la persona o de ejemplo. */
export type ItemMercado = {
  compromiso: Compromiso;
  /** Quién publica; los de ejemplo dicen "Comunidad (ejemplo)". */
  autor: string;
  propio: boolean;
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

export function armarMercado(propios: Compromiso[]): ItemMercado[] {
  return [
    ...propios.map((compromiso) => ({ compromiso, autor: "Vos", propio: true })),
    ...EJEMPLOS_MERCADO.map((compromiso) => ({ compromiso, autor: AUTOR_EJEMPLO, propio: false })),
  ];
}

export function filtrarMercado(items: ItemMercado[], f: FiltroMercado): ItemMercado[] {
  return items.filter(
    (i) =>
      (f.tipo === "todos" || i.compromiso.tipo === f.tipo) &&
      (f.clase === "todas" || i.compromiso.clase === f.clase),
  );
}
