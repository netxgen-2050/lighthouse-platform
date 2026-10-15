// Tribus con tickets vinculados: datos de EJEMPLO para la vitrina del Congreso.
// No hay ticketera conectada; cuando la haya, esto se reemplaza por el conteo real.
import { buscarTribu } from "@/lib/tribus/datos";
import type { Tribu } from "@/lib/tribus/tipos";

const EJEMPLO: { tribuId: string; conTicket: number }[] = [
  { tribuId: "valle", conTicket: 5 },
  { tribuId: "agua", conTicket: 2 },
  { tribuId: "taller", conTicket: 4 },
];

export type TribuConTicket = {
  tribu: Tribu;
  conTicket: number;
  total: number;
  /** Siempre true hoy: la cifra es de ejemplo. */
  esEjemplo: true;
};

/** Hasta tres tribus del catálogo con cuántas personas ya tienen ticket. Omite ids que no existan. */
export function tribusConTicket(): TribuConTicket[] {
  const salida: TribuConTicket[] = [];
  for (const e of EJEMPLO) {
    const tribu = buscarTribu(e.tribuId);
    if (!tribu) continue;
    const total = tribu.roles.cubiertos;
    if (!(total > 0)) continue;
    salida.push({ tribu, conTicket: Math.min(e.conTicket, total), total, esEjemplo: true });
  }
  return salida.slice(0, 3);
}
