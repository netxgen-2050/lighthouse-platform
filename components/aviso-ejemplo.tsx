"use client";

import { useTextos } from "@/lib/idioma/cliente";

export function AvisoEjemplo() {
  const comunes = useTextos("comunes");
  return (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      {comunes.avisoEjemplo}
    </p>
  );
}
