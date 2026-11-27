"use client";

import { Banknote, BadgeCheck, CalendarClock, Clock, DoorOpen, Handshake, Lightbulb, MessagesSquare, Sprout, type LucideIcon } from "lucide-react";
import { useTextos } from "@/lib/idioma/cliente";

/** Lista cerrada de estados que puede mostrar el chip. */
export const ESTADOS_CHIP = [
  "abierta",
  "enDiscusion",
  "decidida",
  "disponible",
  "reservado",
  "enCuotas",
  "vendido",
  "enFinanciamiento",
  "idea",
] as const;
export type EstadoChip = (typeof ESTADOS_CHIP)[number];

// Cada estado lleva un ícono propio además del texto: nunca se distingue solo por color.
const ICONO: Record<EstadoChip, LucideIcon> = {
  abierta: DoorOpen,
  enDiscusion: MessagesSquare,
  decidida: BadgeCheck,
  disponible: Sprout,
  reservado: Clock,
  enCuotas: CalendarClock,
  vendido: Handshake,
  enFinanciamiento: Banknote,
  idea: Lightbulb,
};

export function ChipEstado({ estado }: { estado: EstadoChip }) {
  const t = useTextos("marco").estados;
  const Icono = ICONO[estado];
  return (
    <span
      data-estado={estado}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-sm text-ink"
    >
      <Icono aria-hidden="true" size={16} />
      {t[estado]}
    </span>
  );
}
