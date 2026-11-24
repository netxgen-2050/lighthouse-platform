import type { PosicionEnIdioma } from "@/lib/equipos/posiciones";

/** Un frente de trabajo ya listo para mostrar (en el idioma de la página). */
export type FrenteVista = {
  id: string;
  nombre: string;
  necesidad: string;
  faltan: string | null;
  paraCuando: string | null;
  lugar: boolean;
  /** Enlace al mapa de Explorar con el frente elegido; `null` si no tiene lugar. */
  hrefMapa: string | null;
  /** Fase desde la que vale, si es una fase futura; `null` si es de ahora. */
  masAdelante: number | null;
};

/** Un equipo (círculo del común) listo para el mapa, la lista y el detalle. Solo datos simples: cruza al navegador. */
export type EquipoVista = {
  id: string;
  /** El id de `?equipo=`: el del círculo sin el prefijo `comun-`. */
  corto: string;
  nombre: string;
  decide: string[];
  frentes: FrenteVista[];
  posiciones: PosicionEnIdioma[];
};
