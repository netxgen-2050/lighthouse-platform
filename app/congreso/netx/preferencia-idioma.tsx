"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIdioma } from "@/lib/idioma/cliente";
import { idiomaDeCookies } from "@/lib/idioma/cookie";

/**
 * Se dibuja SOLO en `/congreso` (español). La primera carga ya la resuelve el servidor (middleware): si la plataforma
 * está en inglés, `/congreso` pasa a `/congreso/en`. Esta pieza cubre el caso en que el idioma cambia estando acá (por
 * ejemplo, al recuperar la preferencia de la persona al entrar): pasa a `/congreso/en` conservando la query (UTM) y el
 * ancla. En `/congreso/en` no se dibuja: la dirección explícita en inglés siempre gana, así un enlace en inglés de los
 * organizadores nunca se pasa al español. Sin interfaz.
 */
export function PreferenciaIdioma() {
  const idioma = useIdioma();
  const router = useRouter();
  useEffect(() => {
    // La cookie es lo último que eligió la persona: al pasar de /congreso/en a /congreso con "ES", el contexto todavía
    // dice inglés hasta que el servidor responde, y no hay que volver.
    if ((idiomaDeCookies(document.cookie) ?? idioma) === "en") {
      router.replace(`/congreso/en${window.location.search}${window.location.hash}`);
    }
  }, [idioma, router]);
  return null;
}
