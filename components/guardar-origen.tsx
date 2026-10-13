"use client";

import { useEffect } from "react";
import { guardarOrigenDelNavegador, type Parametros } from "@/lib/origen/origen";

/** Sin interfaz: guarda el primer origen de la visita en este navegador. */
export function GuardarOrigen({ origen }: { origen: Parametros }) {
  const { camino, fuente, medio, campana } = origen;
  useEffect(() => {
    guardarOrigenDelNavegador({ camino, fuente, medio, campana });
  }, [camino, fuente, medio, campana]);
  return null;
}
