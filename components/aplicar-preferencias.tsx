"use client";

import { useEffect } from "react";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { atributosDeApariencia } from "@/lib/configuracion/preferencias";

/** No dibuja nada: mantiene al día los atributos de <html> que usa `app/globals.css`. */
export function AplicarPreferencias() {
  const preferencias = usePreferencias();

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const aplicar = () => {
      const atributos = atributosDeApariencia(preferencias, consulta.matches);
      for (const [nombre, valor] of Object.entries(atributos)) document.documentElement.setAttribute(nombre, valor);
    };
    aplicar();
    // Con "el del sistema", si cambia el tema del sistema la página lo sigue.
    consulta.addEventListener("change", aplicar);
    return () => consulta.removeEventListener("change", aplicar);
  }, [preferencias]);

  return null;
}
