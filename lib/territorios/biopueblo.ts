import { listarTribus } from "../tribus/datos";
import type { EstadoTribu, Tribu } from "../tribus/tipos";
import datos from "./biopueblo-territorios.json";

// Geometría real de BioPueblo (docs/referencia/biopueblo-territorios.geojson).
// Barrios y terreno común: distribución aleatoria e ilustrativa hasta el masterplan.

/** Punto [longitud, latitud], como en GeoJSON. */
export type Punto = [number, number];
/** Anillo cerrado: el primer punto se repite al final. */
export type Anillo = Punto[];

export type TipoElemento = "macrolote" | "comun" | "barrio" | "soluna" | "finca" | "lugar" | "contexto";
export type EstadoFinca = "disponible" | "reservada" | "cantera";

type Base = { id: string; nombre: string };
export type Zona = Base & { tipo: "macrolote" | "comun" | "soluna" | "contexto"; areaHa?: number; anillo: Anillo };
export type Barrio = Base & { tipo: "barrio"; barrio: number; tribuId: string; areaHa?: number; anillo: Anillo };
export type Finca = Base & {
  tipo: "finca";
  numero?: number;
  superficieM2?: number;
  estado?: EstadoFinca;
  anillo: Anillo;
};
export type Lugar = Base & { tipo: "lugar"; punto: Punto };

type Propiedades = {
  tipo: TipoElemento;
  id: string;
  nombre: string;
  barrio?: number;
  tribuId?: string;
  numero?: number;
  area_ha?: number;
  superficie_m2?: number | null;
  estado?: EstadoFinca;
};
type Rasgo =
  | { properties: Propiedades; geometry: { type: "Polygon"; coordinates: Punto[][] } }
  | { properties: Propiedades; geometry: { type: "Point"; coordinates: Punto } };

const rasgos = (datos as unknown as { features: Rasgo[] }).features;

function anillos(tipo: TipoElemento): { p: Propiedades; anillo: Anillo }[] {
  return rasgos.flatMap((r) =>
    r.properties.tipo === tipo && r.geometry.type === "Polygon" ? [{ p: r.properties, anillo: r.geometry.coordinates[0] }] : [],
  );
}

function zonas(tipo: Zona["tipo"]): Zona[] {
  return anillos(tipo).map(({ p, anillo }) => ({ tipo, id: p.id, nombre: p.nombre, areaHa: p.area_ha, anillo }));
}

export function listarContexto(): Zona[] {
  return zonas("contexto");
}

export function macrolote7(): Zona {
  return zonas("macrolote")[0];
}

export function terrenoComun(): Zona {
  return zonas("comun")[0];
}

export function solunaContorno(): Zona {
  return zonas("soluna")[0];
}

export function listarBarrios(): Barrio[] {
  return anillos("barrio")
    .map(({ p, anillo }) => ({
      tipo: "barrio" as const,
      id: p.id,
      nombre: p.nombre,
      barrio: p.barrio ?? 0,
      tribuId: p.tribuId ?? "",
      areaHa: p.area_ha,
      anillo,
    }))
    .sort((a, b) => a.barrio - b.barrio);
}

export function listarFincas(): Finca[] {
  return anillos("finca")
    .map(({ p, anillo }) => ({
      tipo: "finca" as const,
      id: p.id,
      nombre: p.nombre,
      numero: p.numero ?? undefined,
      superficieM2: p.superficie_m2 ?? undefined,
      estado: p.estado,
      anillo,
    }))
    .sort((a, b) => (a.numero ?? Infinity) - (b.numero ?? Infinity));
}

export function listarLugares(): Lugar[] {
  return rasgos.flatMap((r) =>
    r.properties.tipo === "lugar" && r.geometry.type === "Point"
      ? [{ tipo: "lugar" as const, id: r.properties.id, nombre: r.properties.nombre, punto: r.geometry.coordinates }]
      : [],
  );
}

export type Elemento = Zona | Barrio | Finca | Lugar;

/** Busca un barrio, el común, una finca o un lugar por su id. */
export function buscarElemento(id: string): Barrio | Zona | Finca | Lugar | undefined {
  return (
    listarBarrios().find((b) => b.id === id) ??
    [terrenoComun()].find((z) => z.id === id) ??
    listarFincas().find((f) => f.id === id) ??
    listarLugares().find((l) => l.id === id)
  );
}

export type ConteoTribus = { activa: number; formacion: number; vacante: number; total: number };

/** Cuenta las tribus de los barrios por estado, cruzando `tribuId` con los datos de tribus. */
export function contarTribusPorEstado(tribus: Tribu[] = listarTribus()): ConteoTribus {
  const conteo: ConteoTribus = { activa: 0, formacion: 0, vacante: 0, total: 0 };
  for (const b of listarBarrios()) {
    const t = tribus.find((x) => x.id === b.tribuId);
    if (!t) continue;
    conteo[t.estado as EstadoTribu] += 1;
    conteo.total += 1;
  }
  return conteo;
}

export function tribuDeBarrio(b: Barrio, tribus: Tribu[] = listarTribus()): Tribu | undefined {
  return tribus.find((t) => t.id === b.tribuId);
}

export const TEXTO_ESTADO_FINCA: Record<EstadoFinca, string> = {
  disponible: "Disponible",
  reservada: "Reservada",
  cantera: "Cantera",
};

/** Superficie en m² con separador de miles; sin dato nunca es 0. */
export function textoSuperficieM2(m2?: number | null): string {
  // A mano: Intl no agrupa los miles de 4 cifras en español.
  return m2 == null ? "sin dato" : `${String(Math.round(m2)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} m²`;
}

export function textoHectareas(ha?: number): string {
  return ha === undefined ? "sin dato" : `${ha.toFixed(1).replace(".", ",")} ha`;
}
