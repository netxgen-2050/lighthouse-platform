import type { ClaveTermino } from "@/lib/legal/terminos";
import { listarTribus } from "@/lib/tribus/datos";

// Datos de ejemplo copiados de V.franz, EMISION y TRIBES en docs/referencia/netx-tribus-mockup-v6.html.

export const INDICADORES = [
  { numero: "412", etiqueta: "perfiles completos" },
  { numero: "9", etiqueta: "tribus activas" },
  { numero: "37", etiqueta: "pactos aceptados" },
  { numero: "USD 1,2 M", etiqueta: "en el espejo de aportes" },
  { numero: "640 h", etiqueta: "horas comprometidas por mes" },
] as const;

export const EMBUDO: readonly { etiqueta: string; valor: number }[] = [
  { etiqueta: "Visitas al sitio", valor: 3240 },
  { etiqueta: "Perfiles completos", valor: 412 },
  { etiqueta: "En una tribu", valor: 186 },
  { etiqueta: "Con pacto propuesto", valor: 58 },
  { etiqueta: "Con pacto aceptado", valor: 37 },
];

export const EMISION = { aportantes: 22, cupo: 35, noCalificados: 11, cupoNoCalificados: 15 } as const;

export const ALERTAS: readonly { etiqueta: string; valor: string; termino?: ClaveTermino }[] = [
  { etiqueta: "Pasaportes pendientes", valor: "14" },
  { etiqueta: "Interesados con residencia fiscal en el exterior", valor: "23", termino: "hacienda" },
  { etiqueta: "Interesados extranjeros (tierra ribereña)", valor: "17", termino: "ribera" },
  { etiqueta: "Constructores sin seguro de accidentes", valor: "6", termino: "obra" },
  { etiqueta: "Fondos recibidos por la plataforma", valor: "USD 0", termino: "caja" },
];

export type FilaTribu = {
  nombre: string;
  /** Número de barrio (la columna "Fincas" del mock-up). */
  fincas: number;
  /** [juntado, meta] en USD. */
  plata: readonly [number, number];
  /** [cubiertos, necesarios]. */
  roles: readonly [number, number];
  ritual: string;
};

// Solo plata y roles (cap y hum del mock-up) por id de tribu; el resto sale de lib/tribus.
const AVANCE: Record<string, { plata: readonly [number, number]; roles: readonly [number, number] }> = {
  semilla: { plata: [140000, 220000], roles: [8, 10] },
  barda: { plata: [520000, 600000], roles: [6, 8] },
  grano: { plata: [0, 260000], roles: [0, 10] },
  monte: { plata: [60000, 300000], roles: [4, 9] },
  agua: { plata: [40000, 180000], roles: [3, 7] },
  valle: { plata: [310000, 480000], roles: [9, 14] },
  taller: { plata: [90000, 150000], roles: [7, 9] },
  cuidado: { plata: [0, 200000], roles: [0, 9] },
  escuela: { plata: [70000, 240000], roles: [4, 10] },
  avelan: { plata: [140000, 650000], roles: [5, 12] },
  puerto: { plata: [260000, 400000], roles: [7, 11] },
  guardia: { plata: [30000, 120000], roles: [3, 6] },
};

export const TRIBUS_POR_PROYECTO: readonly FilaTribu[] = listarTribus().map((t) => ({
  nombre: t.nombre,
  fincas: t.barrio,
  plata: AVANCE[t.id].plata,
  roles: AVANCE[t.id].roles,
  ritual: t.formaJuridica,
}));
