// Qué muestra el ⚖ de un término en cada idioma, y qué se anota en la bitácora. Funciones puras (design de
// congreso-bilingue §8): `TerminoLegal` solo las usa y dibuja.
import { huella } from "@/lib/demo/bitacora";
import { esBorrador, TERMINOS, terminoEn, type ClaveTermino } from "./terminos";

export type IdiomaTermino = "es" | "en";

export type TerminoMostrado = {
  titulo: string;
  texto: string;
  /** Idioma del texto que se muestra de verdad (un término sin inglés se muestra en español aunque la página sea en inglés). */
  idioma: IdiomaTermino;
  borrador: boolean;
  etiqueta: string;
  textoBorrador: string;
  /** Solo si el texto está en un idioma distinto del de la página. */
  langTexto?: "es";
  aviso?: { texto: string; lang: "en" };
};

export function terminoMostrado(clave: ClaveTermino, idiomaPagina: IdiomaTermino = "es"): TerminoMostrado {
  const es = TERMINOS[clave];
  if (idiomaPagina === "en") {
    const en = terminoEn(clave);
    if (en) {
      // Toda versión en inglés es borrador, aunque el español de esa clave no lo sea: nadie la revisó.
      return {
        titulo: en.titulo,
        texto: en.texto,
        idioma: "en",
        borrador: true,
        etiqueta: `What it means legally: ${en.titulo}`,
        textoBorrador: "Draft: text under review",
      };
    }
    return {
      titulo: es.titulo,
      texto: es.texto,
      idioma: "es",
      borrador: esBorrador(clave),
      etiqueta: `What it means legally (only in Spanish): ${es.titulo}`,
      textoBorrador: "Borrador: texto a revisar",
      langTexto: "es",
      aviso: { texto: "Only available in Spanish", lang: "en" },
    };
  }
  return {
    titulo: es.titulo,
    texto: es.texto,
    idioma: "es",
    borrador: esBorrador(clave),
    etiqueta: `Qué significa legalmente: ${es.titulo}`,
    textoBorrador: "Borrador: texto a revisar",
  };
}

/** La frase consultiva que se ve en el acta, en el idioma de la página (la explicación del ⚖ es otro texto). */
export function fraseConsultiva(idioma: IdiomaTermino = "es"): string {
  return idioma === "en" ? TERMINOS.consultivo.en.frase : TERMINOS.consultivo.frase;
}

/** La entrada de bitácora de un ⚖: lo que se mostró de verdad, con su idioma y su huella. */
export function entradaBitacoraTermino(clave: ClaveTermino, idiomaPagina: IdiomaTermino = "es") {
  const m = terminoMostrado(clave, idiomaPagina);
  return {
    tipo: "termino-legal" as const,
    clave,
    mostrado: m.titulo,
    huella: huella(m.titulo, m.texto),
    borrador: m.borrador,
    idioma: m.idioma,
  };
}
