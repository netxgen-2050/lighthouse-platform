import type { EstadoTribu } from "@/lib/tribus/tipos";

const COLOR: Record<EstadoTribu, string> = {
  activa: "bg-deep text-on-deep border-deep",
  formacion: "bg-gold-soft text-gold-ink border-gold-ink",
  vacante: "bg-surface text-muted border-faint border-dashed",
};

export function SelloTribu({
  iniciales,
  estado,
  grande = false,
}: {
  iniciales: string;
  estado: EstadoTribu;
  grande?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 font-semibold ${COLOR[estado]} ${grande ? "h-16 w-16 text-xl" : "h-12 w-12 text-base"}`}
    >
      {iniciales}
    </span>
  );
}
