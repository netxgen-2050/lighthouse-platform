import type { EstadoTribu } from "@/lib/tribus/tipos";

const COLOR: Record<EstadoTribu, string> = {
  activa: "bg-emerald-800 text-white border-emerald-900",
  formacion: "bg-amber-600 text-white border-amber-800",
  vacante: "bg-white text-stone-700 border-stone-500 border-dashed",
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
