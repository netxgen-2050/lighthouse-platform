import type { ClaveTermino } from "@/lib/legal/terminos";

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

export const TRIBUS_POR_PROYECTO: readonly FilaTribu[] = [
  { nombre: "Semilla Viva", fincas: 1, plata: [140000, 220000], roles: [8, 10], ritual: "Asociación civil" },
  { nombre: "Barda Productiva", fincas: 2, plata: [520000, 600000], roles: [6, 8], ritual: "SAS" },
  { nombre: "Barrio 3", fincas: 3, plata: [0, 260000], roles: [0, 10], ritual: "A definir" },
  { nombre: "Monte Nuevo", fincas: 4, plata: [60000, 300000], roles: [4, 9], ritual: "SAS de propósito" },
  { nombre: "Agua Clara", fincas: 5, plata: [40000, 180000], roles: [3, 7], ritual: "Cooperativa" },
  { nombre: "Valle Solar", fincas: 6, plata: [310000, 480000], roles: [9, 14], ritual: "Asociación civil" },
  { nombre: "Taller Común", fincas: 7, plata: [90000, 150000], roles: [7, 9], ritual: "Asociación civil" },
  { nombre: "Barrio 8", fincas: 8, plata: [0, 200000], roles: [0, 9], ritual: "A definir" },
  { nombre: "Escuela de la Tierra", fincas: 9, plata: [70000, 240000], roles: [4, 10], ritual: "Asociación civil" },
  { nombre: "Fundación Avelan Kerum", fincas: 10, plata: [140000, 650000], roles: [5, 12], ritual: "Fundación" },
  { nombre: "Puerto Trueque", fincas: 11, plata: [260000, 400000], roles: [7, 11], ritual: "SAS de propósito" },
  { nombre: "Guardianes del Monte", fincas: 12, plata: [30000, 120000], roles: [3, 6], ritual: "Asociación civil" },
];
