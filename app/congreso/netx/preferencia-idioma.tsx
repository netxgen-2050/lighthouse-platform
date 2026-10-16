"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { leerPreferenciaIdioma } from "@/lib/congreso/preferencia-idioma";

/**
 * Se dibuja SOLO en `/congreso` (español). Si la persona eligió inglés antes, pasa a `/congreso/en` conservando la
 * query (UTM) y el ancla. En `/congreso/en` no se dibuja: la dirección explícita en inglés siempre gana, así un
 * enlace en inglés de los organizadores nunca se pasa al español. Espera a que la sesión deje de estar "cargando"
 * para leer la clave con el prefijo de la persona. Sin interfaz.
 */
export function PreferenciaIdioma() {
  const { estado } = useSesion();
  const router = useRouter();
  useEffect(() => {
    if (estado === "cargando") return;
    if (leerPreferenciaIdioma() === "en") {
      router.replace(`/congreso/en${window.location.search}${window.location.hash}`);
    }
  }, [estado, router]);
  return null;
}
