import type { EventoActividad } from "@/lib/actividad/actividad";

export type GrupoDia = { dia: string; eventos: EventoActividad[] };

function fechaVisible(e: EventoActividad): string {
  return e.visibleDesde ?? e.fecha;
}

/** Día local (AAAA-MM-DD) de una fecha ISO. */
export function diaLocal(iso: string): string {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Agrupa por día una lista ya ordenada de lo más nuevo a lo más viejo (`listarActividad`), sin reordenarla. */
export function agruparPorDia(eventos: EventoActividad[]): GrupoDia[] {
  const grupos: GrupoDia[] = [];
  for (const e of eventos) {
    const dia = diaLocal(fechaVisible(e));
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.dia === dia) ultimo.eventos.push(e);
    else grupos.push({ dia, eventos: [e] });
  }
  return grupos;
}
