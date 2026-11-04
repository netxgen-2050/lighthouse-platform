import { formatearNumero, sinDato } from "../idioma/formatos";
import { territorio } from "../idioma/textos/territorio";
import type { Idioma } from "../idioma/tipos";
import { fechaDelLoteo, fuenteDelLoteo, lotesDelGrupo, rangoDeSuperficies, sectorNorte, zonasDelLoteo } from "./loteo";

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
  const norte = lotesDelGrupo("norte");
  const rango = rangoDeSuperficies(norte);
  const ha = sectorNorte()?.areaHa;
  return t.resumen(
    norte.length,
    rango ? t.rango(formatearNumero(rango.min, idioma), formatearNumero(rango.max, idioma)) : t.rangoSinDato,
    ha === undefined ? t.sectorSinDato : t.sector(hectareas(ha, idioma)),
  );
}

/** Los primeros lotes que se venden (fuera del 7A); null si el plano no los trae. */
export function resumenDePrimeros(idioma: Idioma): string | null {
  const t = territorio[idioma].loteo;
  const rango = rangoDeSuperficies(lotesDelGrupo("primeros"));
  return rango ? t.primerosResumen(t.rango(formatearNumero(rango.min, idioma), formatearNumero(rango.max, idioma))) : null;
}

/** Cada uso con sus códigos del plano de Martín ("CH-01, CH-02…"); lo que no tiene uso conocido dice "sin dato". */
export function parcelasPorUso(idioma: Idioma): { uso: string; codigos: string[] }[] {
  const usos = territorio[idioma].loteo.usosParcela;
  const grupos = new Map<string, string[]>();
  for (const z of zonasDelLoteo().filter((x) => x.tipo === "parcela")) {
    const prefijo = z.nombre.replace(/-\d+$/, "");
    const uso = usos[z.nombre] ?? usos[prefijo] ?? sinDato(idioma);
    // CP-1 y LR-DM-1 son partes de una sola pieza de la memoria: se nombran una vez.
    const codigo = /-\d$/.test(z.nombre) ? prefijo : z.nombre;
    const lista = grupos.get(uso) ?? [];
    if (!lista.includes(codigo)) lista.push(codigo);
    grupos.set(uso, lista);
  }
  return [...grupos].map(([uso, codigos]) => ({ uso, codigos }));
}

/** Las parcelas que el plano dibuja con otros usos; null si no hay. */
export function parcelasSinUso(idioma: Idioma): string | null {
  const n = zonasDelLoteo().filter((z) => z.tipo === "parcela").length;
  return n === 0 ? null : territorio[idioma].loteo.parcelas(n);
}

/** De dónde salen los datos: el boceto propio o el plano de Martín (con su fecha, si la trae). */
export function fuenteTexto(idioma: Idioma): string {
  const t = territorio[idioma].loteo;
  if (fuenteDelLoteo() === "ilustrativa") return t.fuenteBoceto;
  return t.fuenteMartin(fechaDelLoteo() ?? sinDato(idioma));
}
