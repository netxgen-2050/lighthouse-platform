"use client";

import { useEffect, useState } from "react";
import {
  consentimientoVigente,
  EVENTO_CONSENTIMIENTO,
  leerConsentimiento,
  sensiblesVigente,
  type Consentimiento,
} from "./consentimiento";

export type EstadoConsentimiento = "cargando" | "pendiente" | "vigente";

/**
 * Lo que la persona consintió (se vuelve a leer al cambiar de persona y cuando algo lo registra o lo retira).
 * `id` dice de qué persona es lo leído, para no usar el registro de la anterior.
 */
export function useConsentimiento(idPersona: string | null) {
  const [leido, setLeido] = useState<{ id: string; registro: Consentimiento | null } | null>(null);

  useEffect(() => {
    if (!idPersona) {
      setLeido(null);
      return;
    }
    const cargar = () => {
      let registro: Consentimiento | null = null;
      try {
        registro = leerConsentimiento(window.localStorage);
      } catch {
        // Sin almacenamiento no hay registro: se pide el consentimiento.
      }
      setLeido({ id: idPersona, registro });
    };
    cargar();
    window.addEventListener(EVENTO_CONSENTIMIENTO, cargar);
    window.addEventListener("storage", cargar);
    return () => {
      window.removeEventListener(EVENTO_CONSENTIMIENTO, cargar);
      window.removeEventListener("storage", cargar);
    };
  }, [idPersona]);

  const listo = idPersona !== null && leido !== null && leido.id === idPersona;
  const registro = listo ? leido.registro : null;
  const estado: EstadoConsentimiento = !listo ? "cargando" : consentimientoVigente(registro) ? "vigente" : "pendiente";
  return { estado, registro, sensibles: sensiblesVigente(registro) };
}
