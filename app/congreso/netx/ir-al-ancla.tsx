"use client";

import { useEffect } from "react";
import { idDeAncla } from "@/lib/congreso/ancla";

/**
 * La página se dibuja después de verificar la sesión, así que el navegador ya intentó (y no pudo) ir al ancla de la
 * dirección (`/congreso#ticket`). Al montarse, esta pieza va a ese ancla; el margen de desplazamiento de la hoja del
 * tema deja el título debajo de la barra de NetX y de la barra del evento. Sin interfaz.
 */
export function IrAlAncla() {
  useEffect(() => {
    const id = idDeAncla(window.location.hash);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);
  return null;
}
