import type { PathOptions } from "leaflet";
import type { Anillo, EstadoFinca } from "@/lib/territorios/biopueblo";
import { buscarVista, type VistaId } from "@/lib/territorios/vistas";
import type { EstadoTribu } from "@/lib/tribus/tipos";

// Estilos y grupos de capas del mapa (cliente, sin JSX). Qué se ve en cada vista lo decide `lib/territorios/vistas.ts`.

export const aLatLng = (a: Anillo): [number, number][] => a.map(([lng, lat]) => [lat, lng]);

/** Lee un token del tema: el canvas de Leaflet no entiende `var(--…)`. */
export function token(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${nombre}`).trim();
}

export function estiloBarrio(estado: EstadoTribu): PathOptions {
  if (estado === "activa") return { color: token("deep"), weight: 2, fillColor: token("green"), fillOpacity: 0.5 };
  if (estado === "formacion")
    return { color: token("gold-ink"), weight: 2, dashArray: "2 5", lineCap: "round", fillColor: token("gold"), fillOpacity: 0.4 };
  return { color: token("faint"), weight: 2, dashArray: "6 4", fillColor: token("surface"), fillOpacity: 0.35 };
}

/** Zona de barrio de la vista Plan: neutra, sin estado de tribu. */
export function estiloBarrioPlan(): PathOptions {
  return { color: token("faint"), weight: 2, dashArray: "6 4", fillColor: token("surface"), fillOpacity: 0.3, interactive: false };
}

export function estiloFinca(estado: EstadoFinca | undefined): PathOptions {
  if (estado === "disponible") return { color: token("blue-soft"), weight: 1, fillColor: token("blue"), fillOpacity: 0.55 };
  if (estado === "reservada")
    return { color: token("clay-ink"), weight: 1.5, dashArray: "3 3", fillColor: token("clay"), fillOpacity: 0.6 };
  return { color: token("muted"), weight: 1.5, dashArray: "1 4", lineCap: "round", fillColor: token("gray"), fillOpacity: 0.6 };
}

/** Grupos de capas del mapa, en el orden en que se apilan. `barrios-plan` es interno de la vista Plan. */
export type Grupo =
  | "contexto"
  | "soluna"
  | "macrolote"
  | "comun"
  | "barrios-plan"
  | "barrios"
  | "frentes"
  | "sellos-barrio"
  | "lugares";

export const ORDEN_GRUPOS: readonly Grupo[] = [
  "contexto",
  "soluna",
  "macrolote",
  "comun",
  "barrios-plan",
  "barrios",
  "frentes",
  "sellos-barrio",
  "lugares",
];

/** Qué grupos se ven en una vista: en Plan la capa `barrios` es la neutra; en Visión, la que lleva el estado de cada tribu. */
export function gruposDeVista(vista: VistaId): Set<Grupo> {
  const salida = new Set<Grupo>();
  for (const c of buscarVista(vista).capas) salida.add(c === "barrios-neutros" ? "barrios-plan" : c);
  return salida;
}
