// Datos de ejemplo de la gobernanza fractal (fogon-gobernanza-fractal). Los círculos y el consejo son de EJEMPLO:
// el reglamento real lo define el diseño legal. Los nombres de los círculos se pueden cambiar acá sin tocar la spec.
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import { buscarTribuBilingue, listarTribusBilingues } from "@/lib/tribus/datos";
import type { Circulo, Nodo, Registro } from "./tipos";

const b = (es: string, en: string): BilingueConOriginal => ({ es, en });

/** El común (Lighthouse como meta-comunidad): la raíz de la estructura. */
export const COMUN_ID = "lighthouse";

export function nodoComun(): Nodo {
  return { tipo: "comun", id: COMUN_ID, nombre: "Lighthouse" };
}

/** Círculos de ejemplo de las tribus activas o en formación (Avelan Kerum sale de sus áreas, ver `circulosDe`). */
const CIRCULOS_POR_TRIBU: Record<string, BilingueConOriginal[]> = {
  semilla: [b("Banco de semillas", "Seed bank"), b("Huerta intensiva", "Intensive garden"), b("Compost", "Compost")],
  barda: [b("Olivos y aceite", "Olives and oil"), b("Vid y bodega", "Vines and winery")],
  monte: [b("Forestación", "Forestry"), b("Bioconstrucción", "Natural building")],
  agua: [b("Toma y cisterna", "Intake and cistern"), b("Tratamiento de aguas", "Water treatment")],
  valle: [
    b("Cuidado de la tierra", "Land care"),
    b("Arquitectura", "Architecture"),
    b("Comunicación", "Communications"),
    b("Energía solar", "Solar energy"),
  ],
  taller: [b("Herrería", "Blacksmithing"), b("Carpintería", "Carpentry"), b("Reparación", "Repair")],
  puerto: [b("Hospedaje", "Lodging"), b("Mercado", "Market"), b("Eventos", "Events")],
};

/** Círculos transversales de ejemplo: cuelgan del común y muestran qué tribus participan. Sin zona asignada. */
const TRANSVERSALES: Circulo[] = [
  { id: "comunicacion-comun", nombre: b("Comunicación del común", "Communications of the commons"), tribus: ["valle", "taller"] },
];

/** Los círculos de una tribu en un solo idioma. Las tribus que buscan tribu (vacantes) no tienen. */
export function circulosDe(tribuId: string): Circulo[] {
  const t = buscarTribuBilingue(tribuId);
  if (!t || t.estado === "vacante") return [];
  if (t.areas) {
    return t.areas.map((a, i) => ({ id: `${tribuId}-area-${i}`, nombre: a, tribus: [tribuId] }));
  }
  return (CIRCULOS_POR_TRIBU[tribuId] ?? []).map((nombre, i) => ({ id: `${tribuId}-${i}`, nombre, tribus: [tribuId] }));
}

export function circulosTransversales(): Circulo[] {
  return TRANSVERSALES;
}

/** Todos los círculos de ejemplo, de una tribu y transversales. */
export function todosLosCirculos(): Circulo[] {
  return [...listarTribusBilingues().flatMap((t) => circulosDe(t.id)), ...TRANSVERSALES];
}

/** Del que cuelga un círculo: de su tribu si tiene una sola; si no, del común. */
export function padreDe(c: Circulo): string {
  return c.tribus.length === 1 ? c.tribus[0] : COMUN_ID;
}

/** El círculo como nodo de la estructura, con su nombre en el idioma pedido. */
export function nodoDe(c: Circulo, idioma: Idioma): Nodo {
  return { tipo: "circulo", id: c.id, nombre: textoEn(c.nombre, idioma), padreId: padreDe(c) };
}

/**
 * Registros de ejemplo con los que arranca la estructura: el común valida a las tribus que ya son activas o están en
 * formación. Las que buscan tribu todavía no tienen quién las valide. Dato de ejemplo, no una decisión real.
 */
export function validacionesDeEjemplo(): Registro[] {
  return listarTribusBilingues()
    .filter((t) => t.estado !== "vacante")
    .map((t) => ({
      id: `ejemplo-comun-valida-${t.id}`,
      esquema: "valida-tribu" as const,
      afirma: COMUN_ID,
      sobre: t.id,
      apuntaA: null,
      cuando: "2026-10-23T00:00:00.000Z",
      datos: { ejemplo: "true" },
    }));
}
