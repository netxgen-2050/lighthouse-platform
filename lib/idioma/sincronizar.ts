import type { Idioma } from "./tipos";

export type EntradaSincronizacion = {
  /** Lo que dice la cookie `lh-idioma` de este navegador (null = no hay). */
  cookie: Idioma | null;
  /** Lo que la persona eligió y tiene guardado en sus preferencias (null = no eligió). */
  persona: Idioma | null;
  /** La preferencia vieja del Congreso (`lh-congreso-idioma`), que se usa una vez si no hay cookie. */
  viejo: Idioma | null;
  /** El idioma con que se dibujó la página. */
  mostrado: Idioma;
  /** ¿Hay sesión y un consentimiento vigente? Solo así se toca la preferencia de la persona. */
  conPersona: boolean;
};

export type DecisionSincronizacion = {
  /** Escribir la cookie con este idioma. */
  escribirCookie?: Idioma;
  /** Guardar este idioma en las preferencias de la persona. */
  guardarEnPersona?: Idioma;
  /** Volver a pedir la página al servidor para que se dibuje en el idioma nuevo. */
  refrescar: boolean;
};

/**
 * Reglas de design §4 al entrar:
 * 1. La cookie manda (es lo elegido en este navegador): si la persona tiene otra cosa guardada, se guarda la de la cookie.
 * 2. Sin cookie y con una elección guardada de la persona: se escribe la cookie y se refresca.
 * 3. Sin cookie ni elección de la persona: se usa, una vez, la preferencia vieja del Congreso.
 * 4. Sin nada elegido no se guarda nada: sigue lo detectado del navegador.
 */
export function decidirSincronizacion(e: EntradaSincronizacion): DecisionSincronizacion {
  if (e.cookie) {
    return { guardarEnPersona: e.conPersona && e.persona !== e.cookie ? e.cookie : undefined, refrescar: false };
  }
  const elegido = (e.conPersona ? e.persona : null) ?? e.viejo;
  if (!elegido) return { refrescar: false };
  return {
    escribirCookie: elegido,
    guardarEnPersona: e.conPersona && e.persona !== elegido ? elegido : undefined,
    refrescar: elegido !== e.mostrado,
  };
}
