"use client";

import { useEffect, useState } from "react";
import { adhesionDesactualizada, puedeParticiparEnGobernanza } from "./participar";
import { leerAdhesionDelNavegador, SIN_ADHESION, type Adhesion } from "@/lib/membresia/versiones";

/**
 * Lo que una pantalla de gobernanza necesita saber de la adhesión de quien mira. Lee el navegador (la regla en sí vive
 * en `participar.ts` y es pura). Hasta leer lo guardado, `listo` es false: la pantalla no muestra ni la acción ni el aviso.
 */
export function useParticipacion(): { listo: boolean; puede: boolean; desactualizada: boolean } {
  const [adhesion, setAdhesion] = useState<Adhesion>(SIN_ADHESION);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setAdhesion(leerAdhesionDelNavegador());
    setListo(true);
  }, []);

  return {
    listo,
    puede: puedeParticiparEnGobernanza(adhesion.membresias, adhesion.versiones),
    desactualizada: adhesionDesactualizada(adhesion.membresias, adhesion.versiones),
  };
}
