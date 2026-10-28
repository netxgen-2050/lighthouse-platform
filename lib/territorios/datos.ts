import { sinDato } from "../idioma/formatos";
import type { Idioma } from "../idioma/tipos";
import { listarTribus } from "../tribus/datos";
import type { Tribu } from "../tribus/tipos";
import type { ResumenTerritorio, Territorio } from "./tipos";

// Origen: docs/referencia/netx-tribus-mockup-v6.html (V.territorio y pantalla de inicio).
// Datos de ejemplo. Sin montos ni horas.
const TERRITORIOS: Territorio[] = [
  {
    id: "lighthouse",
    nombre: "Lighthouse",
    ubicacion: "BioPueblo Mainqué, margen sur del Río Negro",
    superficie: "~993 ha",
    descripcion: "~993 ha, doce barrios y las tribus que los están formando.",
    bienesComunes: [
      "Agua: toma, cisterna y riego",
      "Energía: parque solar comunitario",
      "Núcleo común: bioquincho y cocina",
      "Vivero y banco de semillas",
    ],
  },
];

export function listarTerritorios(): Territorio[] {
  return [...TERRITORIOS];
}

export function buscarTerritorio(id: string): Territorio | undefined {
  return TERRITORIOS.find((t) => t.id === id);
}

export function tribusDeTerritorio(id: string): Tribu[] {
  return listarTribus()
    .filter((t) => t.territorioId === id)
    .sort((a, b) => a.barrio - b.barrio);
}

export function resumenDeTerritorio(id: string): ResumenTerritorio | undefined {
  if (!buscarTerritorio(id)) return undefined;
  const tribus = tribusDeTerritorio(id);
  const contar = (estado: Tribu["estado"]) => tribus.filter((t) => t.estado === estado).length;
  return {
    activa: contar("activa"),
    formacion: contar("formacion"),
    vacante: contar("vacante"),
    total: tribus.length,
  };
}

export function textoSuperficie(t: { superficie?: string }, idioma: Idioma = "es"): string {
  return t.superficie ? t.superficie : sinDato(idioma);
}
