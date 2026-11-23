"use client";

import { useTextos } from "@/lib/idioma/cliente";

export type VarianteSello = "general" | "venta";

/**
 * Sello de prototipo. La variante "venta" suma que la venta es simulada y la aprobación municipal está pendiente;
 * no existe una variante que la muestre como otorgada.
 */
export function SelloPrototipo({ variante = "general" }: { variante?: VarianteSello }) {
  const t = useTextos("marco");
  return (
    <p className="inline-flex flex-wrap items-center gap-x-2 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      <span>{t.aviso}</span>
      {variante === "venta" && (
        <>
          <span aria-hidden="true">·</span>
          <span>{t.avisoVenta}</span>
        </>
      )}
    </p>
  );
}
