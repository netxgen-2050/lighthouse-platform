import type { Idioma } from "@/lib/idioma/tipos";
import type { Punto } from "./biopueblo";
import datos from "./alternativa-permacultura.json";

// Borrador v0.1 del masterplan de permacultura del Macrolote 7, armado por el Agente de Regeneración (vault
// NS_permacultura, `sources/masterplan-permacultura/`) desde el MDE Copernicus GLO-30. Preliminar e ilustrativo.

/** Grupo de la leyenda y de la lista. El orden es el de la leyenda. */
export const CAPAS_PERMACULTURA = ["agua", "produccion", "asentamiento", "implementacion", "silvestre", "camino", "sector", "obra"] as const;
export type CapaPermacultura = (typeof CAPAS_PERMACULTURA)[number];

/** Los ids que llevan un sello enfocable en el mapa. */
export const SELLOS_PERMACULTURA = ["pc-hectarea-1", "pc-nucleo", "pc-cluster-1", "pc-cluster-2", "pc-cluster-3", "pc-cluster-4"];

type Geometria =
  | { type: "Polygon"; coordinates: Punto[][] }
  | { type: "MultiPolygon"; coordinates: Punto[][][] }
  | { type: "LineString"; coordinates: Punto[] }
  | { type: "MultiLineString"; coordinates: Punto[][] }
  | { type: "Point"; coordinates: Punto }
  | { type: "MultiPoint"; coordinates: Punto[] };

type Propiedades = {
  id: string;
  capa: CapaPermacultura;
  nombre: string;
  zona: string;
  descripcion: string;
  nombre_en: string;
  zona_en: string;
  descripcion_en: string;
  marca: string;
  area_ha?: number;
};

type Metadatos = { version: string; fecha: string; metodo: string; total_ha?: number; conservacion_ha?: number; cuenca_canadon_ha?: number };

const fuente = datos as unknown as { metadata: Metadatos; features: { properties: Propiedades; geometry: Geometria }[] };

export type ElementoPermacultura = {
  id: string;
  capa: CapaPermacultura;
  /** Superficie en hectáreas; solo los polígonos la tienen. Sin ella es `undefined` ("sin dato"), nunca 0. */
  areaHa?: number;
  marca: string;
  geometria: Geometria;
  textos: Record<Idioma, { nombre: string; zona: string; descripcion: string }>;
};

const ELEMENTOS: ElementoPermacultura[] = fuente.features.map(({ properties: p, geometry }) => ({
  id: p.id,
  capa: p.capa,
  areaHa: p.area_ha,
  marca: p.marca,
  geometria: geometry,
  textos: {
    es: { nombre: p.nombre, zona: p.zona, descripcion: p.descripcion },
    en: { nombre: p.nombre_en, zona: p.zona_en, descripcion: p.descripcion_en },
  },
}));

export function listarElementosPermacultura(): ElementoPermacultura[] {
  return [...ELEMENTOS];
}

export function buscarElementoPermacultura(id: string): ElementoPermacultura | undefined {
  return ELEMENTOS.find((e) => e.id === id);
}

/** Los elementos de una capa, en el orden de los datos. */
export function elementosDeCapa(capa: CapaPermacultura): ElementoPermacultura[] {
  return ELEMENTOS.filter((e) => e.capa === capa);
}

export type ResumenPermacultura = {
  version: string;
  fecha: string;
  metodo: string;
  totalHa?: number;
  conservacionHa?: number;
  /** Porcentaje del macrolote en conservación (ribera, columna verde, desembocadura y zona 5). */
  proporcionEcologica?: number;
  cuencaHa?: number;
};

export function resumenPermacultura(): ResumenPermacultura {
  const m = fuente.metadata;
  const proporcion =
    m.total_ha !== undefined && m.conservacion_ha !== undefined && m.total_ha > 0
      ? Math.round((m.conservacion_ha / m.total_ha) * 100)
      : undefined;
  return {
    version: m.version,
    fecha: m.fecha,
    metodo: m.metodo,
    totalHa: m.total_ha,
    conservacionHa: m.conservacion_ha,
    proporcionEcologica: proporcion,
    cuencaHa: m.cuenca_canadon_ha,
  };
}

/** Recorre todos los puntos de una geometría, para tests y límites. */
export function puntosDe(g: Geometria): Punto[] {
  switch (g.type) {
    case "Point":
      return [g.coordinates];
    case "MultiPoint":
    case "LineString":
      return g.coordinates;
    case "MultiLineString":
    case "Polygon":
      return g.coordinates.flat();
    case "MultiPolygon":
      return g.coordinates.flat(2);
  }
}
