import type { CaminoId } from "./origen/origen";
import { tribusDeTerritorio } from "./territorios/datos";
import { textos } from "./idioma/textos";
import type { Idioma } from "./idioma/tipos";

export type PublicoId = "vivir" | "invertir" | "cuidar";

export type Camino = {
  id: PublicoId;
  /** Quién habla: "Quiero vivir ahí". */
  etiqueta: string;
  /** La pregunta de ese público. */
  titulo: string;
  descripcion: string;
  /** Lo que dice la acción de la tarjeta. */
  accion: string;
  href: string;
  /** Valores de `?camino=` (campañas anteriores) que marcan este camino como "Recomendado para vos". */
  recomendadoPara: readonly CaminoId[];
};

/** Descripción del camino del bien común: la cantidad de barrios sale de los datos; sin datos, sin número (nunca 0). */
export function descripcionBarrios(cantidad: number, idioma: Idioma = "es"): string {
  return textos("portada", idioma).barrios(cantidad);
}

// Los tres caminos de Inicio, uno por público (ux-inicio, design §4), sin cifras escritas a mano.
export function caminosDePortada(idioma: Idioma = "es"): Camino[] {
  const t = textos("portada", idioma).caminos;
  const barrios = tribusDeTerritorio("lighthouse").length;
  return [
    {
      id: "vivir",
      etiqueta: t.vivir.etiqueta,
      titulo: t.vivir.titulo,
      descripcion: t.vivir.descripcion,
      accion: t.vivir.accion,
      href: "/explorar/territorio",
      recomendadoPara: ["lotes", "territorio"],
    },
    {
      id: "invertir",
      etiqueta: t.invertir.etiqueta,
      titulo: t.invertir.titulo,
      descripcion: t.invertir.descripcion,
      accion: t.invertir.accion,
      href: "/invertir",
      recomendadoPara: [],
    },
    {
      id: "cuidar",
      etiqueta: t.cuidar.etiqueta,
      titulo: t.cuidar.titulo,
      descripcion: descripcionBarrios(barrios, idioma),
      accion: t.cuidar.accion,
      href: "/participa",
      recomendadoPara: ["tribus"],
    },
  ];
}
