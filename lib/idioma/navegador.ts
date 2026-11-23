import type { Idioma } from "./tipos";

/** Para no recorrer encabezados enormes en cada pedido. */
const MAX_CARACTERES = 256;
const MAX_IDIOMAS = 20;

/**
 * Idioma inicial según el navegador (`Accept-Language`): el de mayor peso (`q`, con empate gana el primero) y solo su
 * parte principal. `es`, `es-AR`, `es-ES`… → "es"; `en`, `en-GB`… → "en"; cualquier otro (`pt-BR`, `fr`, `*`),
 * encabezado ausente o ilegible → "en". Lo detectado nunca se guarda como elección.
 */
export function idiomaDelNavegador(acceptLanguage: string | null | undefined): Idioma {
  if (!acceptLanguage) return "en";
  const partes = acceptLanguage.slice(0, MAX_CARACTERES).split(",").slice(0, MAX_IDIOMAS);
  let mejor: { principal: string; q: number } | null = null;
  for (const parte of partes) {
    const [etiqueta, ...parametros] = parte.trim().split(";");
    const principal = etiqueta.trim().toLowerCase().split("-")[0];
    if (!/^[a-z]{1,8}$/.test(principal) && principal !== "*") continue;
    let q = 1;
    for (const p of parametros) {
      const m = /^\s*q\s*=\s*([0-9]*\.?[0-9]+)\s*$/i.exec(p);
      if (m) q = Number(m[1]);
    }
    if (!(q > 0)) continue;
    if (!mejor || q > mejor.q) mejor = { principal, q };
  }
  return mejor?.principal === "es" ? "es" : "en";
}
