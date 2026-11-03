import type { Anillo } from "./biopueblo";
import datos from "./loteo-norte.json";
import type { FuentePlanId } from "./vistas";

// Loteo del sector norte de Lighthouse VRN (spec loteo-norte). Es lo ÚNICO que lee `loteo-norte.json`: las pantallas
// nunca escriben cantidades ni superficies. Hoy el archivo es un boceto; el importador lo reemplaza por el plano de Martín.

export type TipoRasgoLoteo = "sector" | "produccion" | "uso-comun" | "calle" | "lote";

export type Lote = {
  id: string;
  numero: number;
  nombre: string;
  clase?: string;
  /** Si falta, la pantalla dice "sin dato": nunca 0. */
  superficieM2?: number;
  anillo: Anillo;
};

export type ZonaLoteo = {
  tipo: Exclude<TipoRasgoLoteo, "lote">;
  id: string;
  nombre: string;
  areaHa?: number;
  anillo: Anillo;
};

export type PropiedadesLoteo = {
  tipo: TipoRasgoLoteo;
  id: string;
  nombre: string;
  numero?: number;
  clase?: string;
  area_ha?: number;
  superficie_m2?: number | null;
  ilustrativo?: boolean;
};
export type RasgoLoteo = {
  type?: "Feature";
  properties: PropiedadesLoteo;
  geometry: { type: "Polygon"; coordinates: Anillo[] };
};
export type MetadataLoteo = { fuente?: string; fuenteId?: FuentePlanId; archivo?: string; importado?: string };
export type ArchivoLoteo = { type?: "FeatureCollection"; metadata?: MetadataLoteo; features: RasgoLoteo[] };

/** Lee un archivo de loteo (el vigente o la salida del importador). Las funciones de abajo son las del archivo vigente. */
export function loteoDe(archivo: ArchivoLoteo) {
  const rasgos = archivo.features;
  const metadata = archivo.metadata ?? {};

  function listarLotes(): Lote[] {
    return rasgos
      .filter((r) => r.properties.tipo === "lote")
      .map((r) => ({
        id: r.properties.id,
        numero: r.properties.numero ?? Number(r.properties.id.replace(/^lote-/, "")),
        nombre: r.properties.nombre,
        clase: r.properties.clase,
        superficieM2: r.properties.superficie_m2 ?? undefined,
        anillo: r.geometry.coordinates[0],
      }))
      .sort((a, b) => a.numero - b.numero);
  }

  function zonas(): ZonaLoteo[] {
    return rasgos
      .filter((r) => r.properties.tipo !== "lote")
      .map((r) => ({
        tipo: r.properties.tipo as ZonaLoteo["tipo"],
        id: r.properties.id,
        nombre: r.properties.nombre,
        areaHa: r.properties.area_ha,
        anillo: r.geometry.coordinates[0],
      }));
  }

  return {
    rasgos,
    metadata,
    listarLotes,
    /** El contorno del sector, o null si el plano no lo trae. */
    sectorNorte: (): ZonaLoteo | null => zonas().find((z) => z.tipo === "sector") ?? null,
    /** Uso común, producción y camino (los que el plano traiga). */
    zonasDelLoteo: (): ZonaLoteo[] => zonas().filter((z) => z.tipo !== "sector"),
    /** De dónde vienen los datos. Sin `metadata.fuenteId`, es el boceto propio. */
    fuenteDelLoteo: (): FuentePlanId => metadata.fuenteId ?? "ilustrativa",
    /** Fecha de la importación (AAAA-MM-DD), si el archivo la trae. */
    fechaDelLoteo: (): string | undefined => metadata.importado,
  };
}

const vigente = loteoDe(datos as unknown as ArchivoLoteo);

export const listarLotes = vigente.listarLotes;
export const sectorNorte = vigente.sectorNorte;
export const zonasDelLoteo = vigente.zonasDelLoteo;
export const fuenteDelLoteo = vigente.fuenteDelLoteo;
export const fechaDelLoteo = vigente.fechaDelLoteo;

/** Los rasgos tal como están en el archivo vigente (lo usa el validador del importador). */
export function rasgosDelLoteo(): RasgoLoteo[] {
  return vigente.rasgos;
}

/** Menor y mayor superficie entre los lotes que la tienen; null si ninguno la tiene. */
export function rangoDeSuperficies(lotes: Lote[] = listarLotes()): { min: number; max: number } | null {
  const s = lotes.flatMap((l) => (l.superficieM2 === undefined ? [] : [l.superficieM2]));
  return s.length === 0 ? null : { min: Math.min(...s), max: Math.max(...s) };
}
