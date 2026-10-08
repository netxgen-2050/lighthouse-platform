"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CLAVE_MEMBRESIA,
  INICIAL,
  estadoDe,
  leer,
  reducir,
  type Accion,
  type EstadoMembresia,
  type Membresias,
} from "./estado";

/** Membresía simulada de una comunidad, guardada en el navegador. `cargado` es falso hasta leer lo guardado. */
export function useMembresia(comunidad: string) {
  const [todas, setTodas] = useState<Membresias>(INICIAL);
  const [cargado, setCargado] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setTodas(leer(window.localStorage.getItem(CLAVE_MEMBRESIA)));
    } catch {
      setFalloAlmacen(true);
    }
    setCargado(true);
  }, []);

  const dispatch = useCallback(
    (accion: Accion) => {
      // Se relee antes de escribir: otra pestaña o componente pudo haber cambiado otra comunidad.
      let base = todas;
      try {
        base = leer(window.localStorage.getItem(CLAVE_MEMBRESIA));
      } catch {
        // Sin almacenamiento: se sigue en memoria.
      }
      const siguiente = reducir(base, accion);
      try {
        window.localStorage.setItem(CLAVE_MEMBRESIA, JSON.stringify(siguiente));
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
