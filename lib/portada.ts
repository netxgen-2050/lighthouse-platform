import { tribusDeTerritorio } from "./territorios/datos";

export type Camino = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  href: string;
};

/** Descripción del camino "Explorar": la cantidad de barrios sale de los datos; sin datos, sin número (nunca 0). */
export function descripcionBarrios(cantidad: number): string {
  if (cantidad === 1) return "1 barrio y las tribus que lo están formando.";
  if (cantidad > 0) return `${cantidad} barrios y las tribus que los están formando.`;
  return "Los barrios y las tribus que los están formando.";
}

// Origen: V.inicio del mock-up v6 (sección .paths), sin cifras escritas a mano.
export function caminosDePortada(): Camino[] {
  const barrios = tribusDeTerritorio("lighthouse").length;
  return [
    {
      etiqueta: "Descubrir",
      titulo: "Ver las tribus",
      descripcion: descripcionBarrios(barrios),
      href: "/tribus",
    },
    {
      etiqueta: "Encontrarse",
      titulo: "Encontrar mi tribu",
      descripcion: "Una conversación de 5 minutos para armar tu perfil.",
      href: "/perfil",
    },
    {
      etiqueta: "Encontrarse en persona",
      titulo: "Congreso · Feb 2027",
      descripcion: "Visita al Lighthouse, encuentros de tribus y mingas.",
      href: "/congreso",
    },
  ];
}
