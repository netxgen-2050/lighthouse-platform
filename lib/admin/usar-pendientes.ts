"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { leerBandejaDelNavegador } from "@/lib/contactos/almacen";
import { leerPostulacionesDelNavegador } from "@/lib/postulaciones/almacen";
import { contarPendientes } from "./pendientes";

/**
 * `undefined` hasta leer el navegador después de hidratar; después el contador (`null` = sin dato). Vuelve a leer cuando
 * cambia la ruta (se guardó algo en esta pestaña y se navegó) y cuando otra pestaña del navegador guarda algo (`storage`).
 */
export function usePendientes(): number | null | undefined {
  const [n, setN] = useState<number | null | undefined>(undefined);
  const ruta = usePathname();
  useEffect(() => {
    const leer = () => setN(contarPendientes(leerPostulacionesDelNavegador(), leerBandejaDelNavegador()));
    leer();
    window.addEventListener("storage", leer);
    return () => window.removeEventListener("storage", leer);
  }, [ruta]);
  return n;
}
