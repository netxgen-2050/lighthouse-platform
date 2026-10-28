"use client";

import { useTextos } from "@/lib/idioma/cliente";
import { useSesion } from "./contexto";

/** "Admin de <tribu>": solo la ve quien lidera esa tribu (Plan Tribu en Sumarte, o el nivel asignado en `LH_PERSONAS`). */
export function MarcaAdmin({ tribu, nombre }: { tribu: string; nombre: string }) {
  const { estado, tribuLider } = useSesion();
  const t = useTextos("marco");
  if (estado !== "ok" || tribuLider !== tribu) return null;
  return (
    <p className="mt-2 w-fit rounded-full border-2 border-deep bg-green-soft px-3 py-1 text-sm font-bold text-deep">
      {t.barra.adminDe(nombre)}
    </p>
  );
}
