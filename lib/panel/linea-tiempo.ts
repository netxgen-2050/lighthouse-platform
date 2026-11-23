import type { EventoActividad } from "@/lib/actividad/actividad";
import { LOCALES } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";

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

/** El día completo con el día de la semana ("viernes, 9 de octubre de 2026" / "Friday, October 9, 2026"), según el idioma. */
export function etiquetaDelDia(dia: string, idioma: Idioma): string {
  return new Intl.DateTimeFormat(LOCALES[idioma], { dateStyle: "full" }).format(new Date(`${dia}T12:00:00`));
}

/** La hora de un evento ("10:00" / "10:00 AM"), según el idioma. */
export function horaDelEvento(e: EventoActividad, idioma: Idioma): string {
  return new Intl.DateTimeFormat(LOCALES[idioma], { timeStyle: "short" }).format(new Date(fechaVisible(e)));
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
