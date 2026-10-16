"use client";

// Idioma de la plataforma en el navegador: el contexto que pone el layout, el hook para textos y las reglas de
// recuerdo (design §4): la cookie `lh-idioma` manda, y además se guarda en la persona si hay sesión y consentimiento.
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { guardarPreferencias, leerPreferenciasDelNavegador } from "@/lib/configuracion/almacen";
import { leerPreferenciaIdioma } from "@/lib/congreso/preferencia-idioma";
import { idiomaDeCookies, textoDeCookie } from "./cookie";
import { decidirSincronizacion } from "./sincronizar";
import { textos, type Zona } from "./textos";
import type { Idioma } from "./tipos";

type ValorIdioma = {
  /** El idioma del contenido que se está dibujando (puede ser español dentro de una página sin traducir). */
  idioma: Idioma;
  /** El idioma de la plataforma, el que la persona eligió o detectó el servidor. */
  plataforma: Idioma;
};

const ContextoIdioma = createContext<ValorIdioma>({ idioma: "es", plataforma: "es" });

/**
 * Lo pone el layout con el idioma del pedido. Con `soloContenido` se anida para fijar el idioma de lo que va adentro
 * (una página sin traducir se dibuja en español) sin cambiar el idioma de la plataforma.
 */
export function ProveedorIdioma({
  idioma,
  soloContenido = false,
  children,
}: {
  idioma: Idioma;
  soloContenido?: boolean;
  children: ReactNode;
}) {
  const padre = useContext(ContextoIdioma);
  const valor = useMemo<ValorIdioma>(
    () => ({ idioma, plataforma: soloContenido ? padre.plataforma : idioma }),
    [idioma, soloContenido, padre.plataforma],
  );
  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>;
}

/** El idioma con que se dibuja la página. */
export function useIdioma(): Idioma {
  return useContext(ContextoIdioma).idioma;
}

/**
 * El idioma de la plataforma, aunque la página esté dentro de un contenido sin traducir (que se dibuja en español).
 * Lo usan los controles que cambian el idioma de la plataforma, como el de Configuración.
 */
export function useIdiomaDePlataforma(): Idioma {
  return useContext(ContextoIdioma).plataforma;
}

/** El diccionario de una zona en el idioma de la página. */
export function useTextos<Z extends Zona>(zona: Z) {
  return textos(zona, useIdioma());
}

/** Escribe la cookie del idioma y el atributo `lang` del documento (sin pedir nada al servidor). */
export function fijarIdiomaEnNavegador(idioma: Idioma): void {
  document.cookie = textoDeCookie(idioma);
  document.documentElement.lang = idioma;
}

function guardarEnPersona(idioma: Idioma): void {
  guardarPreferencias({ ...leerPreferenciasDelNavegador(), idiomaElegido: idioma });
}

/**
 * Cambiar el idioma (selector de la barra, Configuración y selector del Congreso): escribe la cookie, lo guarda en la
 * persona si hay sesión y consentimiento vigente, pone `lang` y vuelve a pedir la página al servidor. Con `destino`,
 * además navega a esa dirección (el Congreso tiene una dirección por idioma).
 */
export function useCambiarIdioma(): (idioma: Idioma, destino?: string) => void {
  const router = useRouter();
  const { estado, consentimiento } = useSesion();
  return useCallback(
    (idioma, destino) => {
      fijarIdiomaEnNavegador(idioma);
      // Mientras carga la sesión no se sabe con qué prefijo guardar: queda la cookie, y `SincronizarIdioma` la copia a la persona al entrar.
      if (estado === "ok" && consentimiento === "vigente") guardarEnPersona(idioma);
      // Con otra dirección (el Congreso tiene una por idioma) se carga la página nueva entera: así el marco y la página
      // salen juntos en el idioma elegido, sin depender del orden entre navegar y refrescar.
      if (destino) window.location.assign(destino);
      else router.refresh();
    },
    [router, estado, consentimiento],
  );
}

/**
 * Sin interfaz. Al entrar (cuando se sabe quién es la persona) aplica las reglas de recuerdo del idioma. Se monta una
 * vez en el layout, con o sin sesión: sin sesión solo migra la preferencia vieja del Congreso.
 */
export function SincronizarIdioma() {
  const mostrado = useIdiomaDePlataforma();
  const { estado, consentimiento, sesion } = useSesion();
  const idPersona = sesion?.idPersona ?? null;

  useEffect(() => {
    if (estado === "cargando") return;
    if (estado === "ok" && consentimiento === "cargando") return;
    const conPersona = estado === "ok" && consentimiento === "vigente";
    const decision = decidirSincronizacion({
      cookie: idiomaDeCookies(document.cookie),
      persona: conPersona ? leerPreferenciasDelNavegador().idiomaElegido : null,
      viejo: leerPreferenciaIdioma(),
      mostrado,
      conPersona,
    });
    if (decision.escribirCookie) document.cookie = textoDeCookie(decision.escribirCookie);
    if (decision.guardarEnPersona) guardarEnPersona(decision.guardarEnPersona);
    // Se vuelve a cargar la página (no `router.refresh()`): esto corre al hidratar y un refresco tan temprano se puede perder.
    // Solo si la cookie quedó escrita: con las cookies bloqueadas el servidor no la vería y la página se recargaría sin fin.
    if (decision.refrescar && decision.escribirCookie && idiomaDeCookies(document.cookie) === decision.escribirCookie) {
      window.location.reload();
    }
    // Se corre al saber quién es la persona y su consentimiento; el idioma mostrado cambia como consecuencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, consentimiento, idPersona]);

  return null;
}
