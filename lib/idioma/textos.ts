// Registro de los diccionarios por zona. Cada cambio de zona suma el suyo acá, para que los tests los recorran todos
// (sin textos vacíos, sin copias sin traducir, y anotado en la revisión nativa).
import type { Idioma, Textos } from "./tipos";
import { canales } from "./textos/canales";
import { comunes } from "./textos/comunes";
import { compromisos } from "./textos/compromisos";
import { fogon } from "./textos/fogon";
import { marco } from "./textos/marco";
import { pactos } from "./textos/pactos";
import { pasaporte } from "./textos/pasaporte";
import { portada } from "./textos/portada";
import { semillas } from "./textos/semillas";
import { sumarte } from "./textos/sumarte";
import { territorio } from "./textos/territorio";
import { tribus } from "./textos/tribus";

export const DICCIONARIOS = {
  canales,
  comunes,
  compromisos,
  fogon,
  marco,
  pactos,
  pasaporte,
  portada,
  semillas,
  sumarte,
  territorio,
  tribus,
} as const;

export type Zona = keyof typeof DICCIONARIOS;

/** El diccionario de una zona en un idioma. Los dos idiomas tienen el mismo tipo. */
export function textos<Z extends Zona>(zona: Z, idioma: Idioma): Textos<(typeof DICCIONARIOS)[Z]["es"]> {
  // Los dos idiomas de cada zona tienen el mismo tipo (lo exige `Textos<>` en cada archivo); TypeScript no lo ve a través del genérico.
  return DICCIONARIOS[zona][idioma] as unknown as Textos<(typeof DICCIONARIOS)[Z]["es"]>;
}
