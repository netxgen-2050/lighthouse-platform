// La cookie `lh-idioma`: el idioma elegido en este navegador. Es una cookie de preferencia de interfaz pedida por la
// persona (exenta de consentimiento) y no lleva identidad. Sin `HttpOnly` para que el cliente la pueda escribir.
import { esIdioma, type Idioma } from "./tipos";

export const COOKIE_IDIOMA = "lh-idioma";

/** Un año, en segundos. */
export const VIGENCIA_COOKIE = 60 * 60 * 24 * 365;

/** El idioma de una cabecera `Cookie` o de `document.cookie`; cualquier valor que no sea "es" o "en" se ignora. */
export function idiomaDeCookies(cookies: string | null | undefined): Idioma | null {
  if (!cookies) return null;
  for (const parte of cookies.split(";")) {
    const [nombre, ...valor] = parte.trim().split("=");
    if (nombre === COOKIE_IDIOMA) {
      const v = valor.join("=");
      return esIdioma(v) ? v : null;
    }
  }
  return null;
}

/** El texto para `document.cookie = …` que fija el idioma. */
export function textoDeCookie(idioma: Idioma): string {
  return `${COOKIE_IDIOMA}=${idioma}; path=/; max-age=${VIGENCIA_COOKIE}; SameSite=Lax`;
}
