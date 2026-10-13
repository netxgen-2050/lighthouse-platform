"use client";

import { useCallback, useEffect, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import {
  INICIAL,
  estadoDe,
  leer,
  reducir,
  type Accion,
  type EstadoMembresia,
  type Membresias,
} from "./estado";

/** Membresía simulada de una comunidad, guardada en el navegador. `cargado` es falso hasta leer lo guardado. */
export function useMembresia(comunidad: string, activo = true) {
  const [todas, setTodas] = useState<Membresias>(INICIAL);
  const [cargado, setCargado] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Sin sesión no hay membresía que leer (ni se toca el almacenamiento).
    if (!activo) return;
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setTodas(leer(window.localStorage.getItem(CLAVES.membresia)));
    } catch {
      setFalloAlmacen(true);
    }
    setCargado(true);
  }, [activo]);

  const dispatch = useCallback(
    (accion: Accion) => {
      // Se relee antes de escribir: otra pestaña o componente pudo haber cambiado otra comunidad.
      let base = todas;
      try {
        base = leer(window.localStorage.getItem(CLAVES.membresia));
      } catch {
        // Sin almacenamiento: se sigue en memoria.
      }
      const siguiente = reducir(base, accion);
      try {
        window.localStorage.setItem(CLAVES.membresia, JSON.stringify(siguiente));
        setFalloAlmacen(false);
      } catch {
        setFalloAlmacen(true);
      }
      setTodas(siguiente);
    },
    [todas],
  );

  const estado: EstadoMembresia = estadoDe(todas, comunidad);
  return {
    estado,
    cargado,
    falloAlmacen,
    adherir: () => dispatch({ tipo: "adherir", comunidad }),
    aceptar: () => dispatch({ tipo: "aceptar", comunidad }),
  };
}
