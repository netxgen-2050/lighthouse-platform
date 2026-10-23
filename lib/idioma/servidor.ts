import { cookies, headers } from "next/headers";
import { COOKIE_IDIOMA } from "./cookie";
import { idiomaDelNavegador } from "./navegador";
import { esIdioma, type Idioma } from "./tipos";

/**
 * El idioma de este pedido: la cookie `lh-idioma` si es válida; si no, el idioma del navegador (`Accept-Language`).
 * Lo detectado solo decide la respuesta de este pedido: no se guarda en ningún lado.
 * Leer la cookie hace que la página se arme en cada pedido.
 */
export async function idiomaDelPedido(): Promise<Idioma> {
  const guardado = (await cookies()).get(COOKIE_IDIOMA)?.value;
  if (esIdioma(guardado)) return guardado;
  return idiomaDelNavegador((await headers()).get("accept-language"));
}
