"use client";

import { usePathname } from "next/navigation";
import { useTextos } from "@/lib/idioma/cliente";

// Rutas donde se ofrecen lotes: la cinta suma que la venta es simulada y la aprobación municipal está pendiente.
const RUTAS_DE_VENTA = ["/explorar", "/invertir", "/mi-tierra", "/lotes"];

export function esRutaDeVenta(ruta: string | null): boolean {
  if (!ruta) return false;
  return RUTAS_DE_VENTA.some((r) => ruta === r || ruta.startsWith(`${r}/`));
}

/**
 * Franja angosta y siempre visible con el aviso de prototipo (ux-base, design §4).
 * Reemplaza al sello que cada página dibujaba por su cuenta. No existe variante que muestre la aprobación como otorgada.
 */
export function CintaPrototipo() {
  const t = useTextos("marco");
  const venta = esRutaDeVenta(usePathname());
  return (
    <p
      role="note"
      data-cinta-prototipo
      className="flex flex-wrap items-center justify-center gap-x-2 bg-ink px-3 py-1 text-center text-xs text-bg"
    >
      <span>{t.aviso}</span>
      {venta && (
        <>
          <span aria-hidden="true">·</span>
          <span>{t.avisoVenta}</span>
        </>
      )}
    </p>
  );
}
