"use client";

import { useSesion } from "./contexto";

/** "Admin de Valle Solar": solo la ve quien administra esa tribu (en el POC, solo `valle`). */
export function MarcaAdmin({ tribu }: { tribu: string }) {
  const { sesion } = useSesion();
  if (sesion?.tribuAdmin !== tribu) return null;
  return (
    <p className="mt-2 w-fit rounded-full border-2 border-deep bg-green-soft px-3 py-1 text-sm font-bold text-deep">
      Admin de Valle Solar
    </p>
  );
}
