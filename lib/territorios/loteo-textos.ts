import { formatearNumero, sinDato } from "../idioma/formatos";
import { territorio } from "../idioma/textos/territorio";
import type { Idioma } from "../idioma/tipos";
import { fechaDelLoteo, fuenteDelLoteo, listarLotes, rangoDeSuperficies, sectorNorte } from "./loteo";

// Textos del loteo que se arman con los datos. Nada de cantidades escritas a mano: salen de `loteo.ts`.

/** Hectáreas sin decimales si son enteras ("102"), con uno si no ("102,5"). */
function hectareas(ha: number, idioma: Idioma): string {
  if (Number.isInteger(ha)) return formatearNumero(ha, idioma);
  const t = ha.toFixed(1);
  return idioma === "es" ? t.replace(".", ",") : t;
}

/** "25 lotes de 1.344 a 2.200 m² en un sector de 102 ha"; lo que falta dice "sin dato", nunca 0. */
export function resumenDelLoteo(idioma: Idioma): string {
  const t = territorio[idioma].loteo;
  const rango = rangoDeSuperficies();
  const ha = sectorNorte()?.areaHa;
  return t.resumen(
    listarLotes().length,
    rango ? t.rango(formatearNumero(rango.min, idioma), formatearNumero(rango.max, idioma)) : t.rangoSinDato,
    ha === undefined ? t.sectorSinDato : t.sector(hectareas(ha, idioma)),
  );
}

/** De dónde salen los datos: el boceto propio o el plano de Martín (con su fecha, si la trae). */
export function fuenteTexto(idioma: Idioma): string {
  const t = territorio[idioma].loteo;
  if (fuenteDelLoteo() === "ilustrativa") return t.fuenteBoceto;
  return t.fuenteMartin(fechaDelLoteo() ?? sinDato(idioma));
}
