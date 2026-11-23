import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { Compromiso } from "./tipos";

/** Etiquetas en español (las de inglés salen de `textos("compromisos", "en")`). */
export const TEXTO_TIPO = textos("compromisos", "es").tipo;
export const TEXTO_CLASE = textos("compromisos", "es").clase;

/** Etiquetas del tipo y del medio de intercambio en el idioma pedido. */
export function etiquetasDe(idioma: Idioma = "es") {
  const t = textos("compromisos", idioma);
  return { tipo: t.tipo, clase: t.clase };
}

/** Cantidad orientativa en palabras; el trueque no lleva cantidad. La cantidad de bienes es texto de la persona: va tal cual. */
export function describirCantidad(c: Compromiso, idioma: Idioma = "es"): string | null {
  const t = textos("compromisos", idioma).cantidad;
  switch (c.clase) {
    case "tiempo":
      return c.horasPorMes !== undefined ? t.horas(c.horasPorMes) : t.sinDato;
    case "plata":
      return c.montoUsd !== undefined ? `USD ${c.montoUsd}` : t.sinDato;
    case "bienes":
      return c.cantidadBienes ?? t.sinDato;
    case "trueque":
      return null;
  }
}

export function describirCompromiso(c: Compromiso, idioma: Idioma = "es"): string {
  const e = etiquetasDe(idioma);
  const cantidad = describirCantidad(c, idioma);
  const partes = [e.tipo[c.tipo], e.clase[c.clase], c.descripcion];
  if (cantidad !== null) partes.push(cantidad);
  return partes.join(" · ");
}
