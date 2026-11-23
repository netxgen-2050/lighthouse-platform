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

/** Descripción del camino "Explorar": la cantidad de barrios sale de los datos; sin datos, sin número (nunca 0). */
export function descripcionBarrios(cantidad: number, idioma: Idioma = "es"): string {
  return textos("portada", idioma).barrios(cantidad);
}

// Origen: V.inicio del mock-up v6 (sección .paths), sin cifras escritas a mano.
export function caminosDePortada(idioma: Idioma = "es"): Camino[] {
  const t = textos("portada", idioma).caminos;
  const barrios = tribusDeTerritorio("lighthouse").length;
  return [
    {
      id: "tribus",
      etiqueta: t.tribus.etiqueta,
      titulo: t.tribus.titulo,
      descripcion: descripcionBarrios(barrios, idioma),
      href: "/tribus",
    },
    {
      id: "perfil",
      etiqueta: t.perfil.etiqueta,
      titulo: t.perfil.titulo,
      descripcion: t.perfil.descripcion,
      href: "/perfil",
    },
    {
      id: "congreso",
      etiqueta: t.congreso.etiqueta,
      titulo: t.congreso.titulo,
      descripcion: t.congreso.descripcion,
      href: "/congreso",
    },
  ];
}
