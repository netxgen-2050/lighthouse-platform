// Lógica del middleware de idioma como función pura (design §5). No mira sesión ni permisos: solo idioma.
import { esIdioma, type Idioma } from "./tipos";
import { idiomaDelNavegador } from "./navegador";
import { rutaParaIdioma } from "./rutas";

export type ResultadoIdioma = {
  /** A dónde redirigir (307). Siempre el mismo origen del pedido. */
  redirigir?: URL;
  /** Idioma que hay que guardar en la cookie `lh-idioma` (solo viene de un `?lang=` válido). */
  cookie?: Idioma;
  /** Cabeceras de la redirección: depende de la cookie y del navegador, así que no se guarda en cachés compartidas. */
  cabeceras?: Record<string, string>;
};

const CABECERAS_PRIVADAS = { "Cache-Control": "private, no-store", Vary: "Cookie, Accept-Language" };

/** La query sin el parámetro `lang`, conservando el resto tal como llegó (sin re-codificar). */
function sinLang(search: string): string {
  const partes = search
    .replace(/^\?/, "")
    .split("&")
    .filter((p) => p !== "" && p.split("=")[0] !== "lang");
  return partes.length ? `?${partes.join("&")}` : "";
}

/**
 * Decide qué hacer con un pedido:
 * - `?lang=es|en`: fija el idioma (cookie) y redirige a la misma dirección sin `lang` (el Congreso pasa a su dirección
 *   en ese idioma). Otro valor: redirige sin `lang` y sin cookie.
 * - Sin `lang`: `/congreso` con el idioma del pedido en inglés va a `/congreso/en`. `/congreso/en` no se redirige nunca.
 * El destino se arma clonando la URL del pedido: nunca se toma un destino de la query ni de `Host`.
 */
export function resolverIdioma(
  url: URL,
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): ResultadoIdioma {
  const elegido = esIdioma(cookie) ? cookie : null;
  const idiomaDelPedido: Idioma = elegido ?? idiomaDelNavegador(acceptLanguage);

  if (url.searchParams.has("lang")) {
    const valor = url.searchParams.get("lang");
    const destino = new URL(url);
    destino.search = sinLang(url.search);
    if (esIdioma(valor)) {
      destino.pathname = rutaParaIdioma(url.pathname, valor);
      return { redirigir: destino, cookie: valor, cabeceras: CABECERAS_PRIVADAS };
    }
    // Valor desconocido: se quita y el idioma no cambia (si hace falta, el pedido siguiente aplica la regla del Congreso).
    return { redirigir: destino, cabeceras: CABECERAS_PRIVADAS };
  }

  if (/^\/congreso\/?$/.test(url.pathname) && idiomaDelPedido === "en") {
    const destino = new URL(url);
    destino.pathname = "/congreso/en";
    return { redirigir: destino, cabeceras: CABECERAS_PRIVADAS };
  }
  return {};
}
