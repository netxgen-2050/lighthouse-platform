import type { CaminoId } from "./origen/origen";
import { tribusDeTerritorio } from "./territorios/datos";
import { textos } from "./idioma/textos";
import type { Idioma } from "./idioma/tipos";

export type Camino = {
  id: CaminoId;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  href: string;
};

/** Descripción del camino de las tribus: la cantidad de barrios sale de los datos; sin datos, sin número (nunca 0). */
export function descripcionBarrios(cantidad: number, idioma: Idioma = "es"): string {
  return textos("portada", idioma).barrios(cantidad);
}

// Los tres caminos de la portada de Lighthouse VRN (portada-vrn), sin cifras escritas a mano.
export function caminosDePortada(idioma: Idioma = "es"): Camino[] {
  const t = textos("portada", idioma).caminos;
  const barrios = tribusDeTerritorio("lighthouse").length;
  return [
    {
      id: "lotes",
      etiqueta: t.lotes.etiqueta,
      titulo: t.lotes.titulo,
      descripcion: t.lotes.descripcion,
      href: "/explorar#lotes",
    },
    {
      id: "territorio",
      etiqueta: t.territorio.etiqueta,
      titulo: t.territorio.titulo,
      descripcion: t.territorio.descripcion,
      href: "/explorar#territorio",
    },
    {
      id: "tribus",
      etiqueta: t.tribus.etiqueta,
      titulo: t.tribus.titulo,
      descripcion: descripcionBarrios(barrios, idioma),
      href: "/participa",
    },
  ];
}
