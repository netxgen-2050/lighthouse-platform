// La estructura lista para dibujar (en gráfico y en lista) en un idioma. Puro: lo comparten las dos vistas.
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { listarTribus } from "@/lib/tribus/datos";
import type { EstadoTribu } from "@/lib/tribus/tipos";
import { circulosDe, circulosTransversales } from "./datos";
import { lugaresDelConsejo, validadaPorElComun } from "./registros";
import type { Registro } from "./tipos";

export type TribuVista = {
  id: string;
  nombre: string;
  iniciales: string;
  barrio: number;
  estado: EstadoTribu;
  validada: boolean;
  circulos: string[];
  /** ¿Tiene lugar en el consejo? Solo las tribus validadas por el común. */
  tieneLugar: boolean;
};

export type TransversalVista = {
  id: string;
  nombre: string;
  /** Nombres de las tribus que participan (puede estar vacío). */
  tribus: string[];
  zona?: string;
};

export type LugarVista = { tribuId: string; tribu: string; iniciales: string; representante: string | null };

export type VistaGobernanza = { tribus: TribuVista[]; transversales: TransversalVista[]; lugares: LugarVista[] };

export function construirVista(idioma: Idioma, registros: readonly Registro[] = []): VistaGobernanza {
  const tribus = listarTribus(idioma);
  const lugares = lugaresDelConsejo(registros);
  const nombreDe = (id: string) => tribus.find((t) => t.id === id)?.nombre ?? id;
  return {
    tribus: tribus.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      iniciales: t.iniciales,
      barrio: t.barrio,
      estado: t.estado,
      validada: validadaPorElComun(t.id, registros),
      circulos: circulosDe(t.id).map((c) => textoEn(c.nombre, idioma)),
      tieneLugar: lugares.some((l) => l.tribuId === t.id),
    })),
    transversales: circulosTransversales().map((c) => ({
      id: c.id,
      nombre: textoEn(c.nombre, idioma),
      tribus: c.tribus.map(nombreDe),
      zona: c.zona,
    })),
    lugares: lugares.map((l) => ({
      tribuId: l.tribuId,
      tribu: nombreDe(l.tribuId),
      iniciales: tribus.find((t) => t.id === l.tribuId)?.iniciales ?? "",
      representante: l.representante,
    })),
  };
}
