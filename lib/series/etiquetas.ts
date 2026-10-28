import { numero } from "./formato";
import type { Metadato } from "./tipos";

// Textos de los controles del simulador: el valor con su unidad, para que no se comunique solo por la posición.

/** Un número con hasta dos decimales, sin ceros de sobra: 5,5 · 0,25 · 220.000. */
export function numeroCorto(n: number): string {
  const t = numero(n, 2);
  return t.includes(",") ? t.replace(/0+$/, "").replace(/,$/, "") : t;
}

/** "5,5 % de los ingresos brutos" · "USD 6 por botella (neto para la serie)" · "3 veces". */
export function textoValor(m: Metadato, v: number): string {
  if (m.unidad === "USD") return `USD ${numeroCorto(v)}`;
  if (m.unidad.startsWith("USD ")) return `USD ${numeroCorto(v)} ${m.unidad.slice(4)}`;
  return `${numeroCorto(v)} ${m.unidad}`;
}

/** "5 %" · "USD 6" · "7 t por ha": el valor de partida, sin la explicación larga. */
export function textoPartida(m: Metadato): string {
  const v = m.partida;
  if (m.unidad.startsWith("%")) return `${numeroCorto(v)} %`;
  if (m.unidad.startsWith("USD")) return `USD ${numeroCorto(v)}`;
  return `${numeroCorto(v)} ${m.unidad}`;
}
