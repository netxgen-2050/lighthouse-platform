"use client";

import { useCallback, useEffect, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { VERSION_MANIFIESTO_VRN } from "@/lib/manifiestos/lighthouse-vrn";
import {
  COMUNIDAD_LIGHTHOUSE,
  INICIAL,
  estadoDe,
  leer,
  reducir,
  type Accion,
  type EstadoMembresia,
  type Membresias,
} from "./estado";
import { SIN_VERSIONES, conVersion, leerVersiones, versionAdheridaDe, type VersionesAdheridas } from "./versiones";

/**
 * Membresía simulada de una comunidad, guardada en el navegador. `cargado` es falso hasta leer lo guardado.
 * Para el Lighthouse también lleva a qué versión del manifiesto adhirió: si cambió, `desactualizada` es true y hay que
 * volver a adherir (decisión de Gus, 29-oct-2026).
 */
export function useMembresia(comunidad: string, activo = true) {
  const [todas, setTodas] = useState<Membresias>(INICIAL);
  const [versiones, setVersiones] = useState<VersionesAdheridas>(SIN_VERSIONES);
  const [cargado, setCargado] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Sin sesión no hay membresía que leer (ni se toca el almacenamiento).
    if (!activo) return;
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setTodas(leer(window.localStorage.getItem(CLAVES.membresia)));
      setVersiones(leerVersiones(window.localStorage.getItem(CLAVES.adhesionVersion)));
    } catch {
      setFalloAlmacen(true);
    }
    setCargado(true);
  }, [activo]);

  const dispatch = useCallback(
    (accion: Accion, version?: string) => {
      // Se relee antes de escribir: otra pestaña o componente pudo haber cambiado otra comunidad.
      let base = todas;
      let versionesBase = versiones;
      try {
        base = leer(window.localStorage.getItem(CLAVES.membresia));
        versionesBase = leerVersiones(window.localStorage.getItem(CLAVES.adhesionVersion));
      } catch {
        // Sin almacenamiento: se sigue en memoria.
      }
      const siguiente = reducir(base, accion);
      const versionesSiguiente = version === undefined ? versionesBase : conVersion(versionesBase, accion.comunidad, version);
      try {
        window.localStorage.setItem(CLAVES.membresia, JSON.stringify(siguiente));
        if (version !== undefined) window.localStorage.setItem(CLAVES.adhesionVersion, JSON.stringify(versionesSiguiente));
        setFalloAlmacen(false);
      } catch {
        setFalloAlmacen(true);
      }
      setTodas(siguiente);
      setVersiones(versionesSiguiente);
    },
    [todas, versiones],
  );

  const estado: EstadoMembresia = estadoDe(todas, comunidad);
  const esLighthouse = comunidad === COMUNIDAD_LIGHTHOUSE;
  // Solo el manifiesto del Lighthouse tiene versión que seguir; las tribus no.
  const desactualizada =
    esLighthouse && estado !== "no-miembro" && versionAdheridaDe(versiones, comunidad) !== VERSION_MANIFIESTO_VRN;
  return {
    estado,
    cargado,
    falloAlmacen,
    desactualizada,
    /** Adhiere (o vuelve a adherir, si el manifiesto cambió de versión). */
    adherir: () => dispatch({ tipo: "adherir", comunidad }, esLighthouse ? VERSION_MANIFIESTO_VRN : undefined),
    aceptar: () => dispatch({ tipo: "aceptar", comunidad }),
  };
}
