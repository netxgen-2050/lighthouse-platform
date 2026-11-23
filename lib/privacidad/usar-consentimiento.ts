"use client";

import { useEffect, useRef, useState } from "react";
import {
  EVENTO_CONSENTIMIENTO,
  leerSensibles,
  limpiarRegistroAnterior,
  pedirConsentimiento,
  registroDeEstado,
  sensiblesVigente,
  type Cabeceras,
  type Consentimiento,
  type SensiblesLocal,
} from "./consentimiento";
import type { EstadoServidor, RegistroNovedades } from "./estado";

export type EstadoConsentimiento = "cargando" | "pendiente" | "vigente";

function sensiblesLocales(idPersona: string): SensiblesLocal | null {
  try {
    return leerSensibles(window.localStorage, idPersona);
  } catch {
    return null;
  }
}

/**
 * Lo que la persona consintió, **según el servidor** (`GET /api/consentimientos`). Se carga una vez por persona y se actualiza
 * cuando algo lo registra o lo retira (el evento trae el estado nuevo, sin otro pedido). `id` dice de qué persona es lo leído,
 * para no usar lo de la anterior. Si el servidor no responde, la persona queda sin consentimiento (anónima), nunca como aceptada.
 * Lo que el navegador guardaba antes se ignora y se limpia la primera vez que el servidor responde. Solo el proveedor de sesión
 * lo llama; el resto lee el resultado de `useSesion()`.
 */
export function useConsentimiento(idPersona: string | null, cabeceras: Cabeceras) {
  const [leido, setLeido] = useState<{ id: string; servidor: EstadoServidor | null; sensibles: SensiblesLocal | null } | null>(null);
  const pedirCabeceras = useRef(cabeceras);
  useEffect(() => {
    pedirCabeceras.current = cabeceras;
  });

  useEffect(() => {
    if (!idPersona) {
      setLeido(null);
      return;
    }
    let vigente = true;
    void (async () => {
      const r = await pedirConsentimiento(() => pedirCabeceras.current());
      if (!vigente) return;
      if (r) {
        try {
          limpiarRegistroAnterior(window.localStorage, idPersona);
        } catch {
          // Sin almacenamiento no hay nada que limpiar.
        }
      }
      setLeido({ id: idPersona, servidor: r?.estado ?? null, sensibles: sensiblesLocales(idPersona) });
    })();
    const alCambiar = (ev: Event) => {
      const d = (ev as CustomEvent<{ id: string; estado: EstadoServidor } | null>).detail;
      // Con el estado nuevo del servidor se usa tal cual; sin él (cambió lo local, como los sensibles) solo se vuelve a leer eso.
      setLeido((previo) => {
        if (!previo || previo.id !== idPersona) return previo;
        return { id: idPersona, servidor: d && d.id === idPersona ? d.estado : previo.servidor, sensibles: sensiblesLocales(idPersona) };
      });
    };
    window.addEventListener(EVENTO_CONSENTIMIENTO, alCambiar);
    window.addEventListener("storage", alCambiar);
    return () => {
      vigente = false;
      window.removeEventListener(EVENTO_CONSENTIMIENTO, alCambiar);
      window.removeEventListener("storage", alCambiar);
    };
  }, [idPersona]);

  const listo = idPersona !== null && leido !== null && leido.id === idPersona;
  const registro: Consentimiento | null = listo ? registroDeEstado(leido.servidor, leido.sensibles) : null;
  const vigente = listo && leido.servidor?.general === "vigente";
  const estado: EstadoConsentimiento = !listo ? "cargando" : vigente ? "vigente" : "pendiente";
  const novedades: RegistroNovedades | null = listo ? (leido.servidor?.novedadesRegistro ?? null) : null;
  return {
    estado,
    registro,
    novedades,
    /** ¿Dio el consentimiento específico para datos sensibles de la versión vigente (y el general está vigente)? */
    sensibles: vigente && sensiblesVigente(leido?.sensibles ?? null),
    /** El estado del servidor tal cual (null: todavía no se leyó, o el servidor no respondió). */
    servidor: listo ? leido.servidor : null,
  };
}
