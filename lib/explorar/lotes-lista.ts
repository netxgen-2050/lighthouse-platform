import type { EstadoMostrado } from "@/lib/lotes/compra";
import type { Lote } from "@/lib/territorios/loteo";
import type { EstadoLote } from "@/lib/territorios/loteo-estados";

// Filtro y orden de la lista de lotes de Explorar (spec ux-explorar). Puro: sin React ni Next.
// Se refleja en la URL (`?estado=disponible,reservado&orden=superficie`) y conserva `vista`, `fase` y `sel`.

export const ESTADOS_FILTRO: readonly EstadoLote[] = ["disponible", "reservado", "vendido"];
export const ORDENES = ["numero", "superficie", "superficie-desc"] as const;
export type Orden = (typeof ORDENES)[number];
export const ORDEN_POR_DEFECTO: Orden = "numero";

export type FiltroLotes = { estados: EstadoLote[]; orden: Orden };

/** El estado de ejemplo que le corresponde a lo que ve la persona (lo suyo en la simulación cuenta como reservado o vendido). */
export function estadoBase(estado: EstadoMostrado): EstadoLote {
  if (estado === "reservado-por-vos") return "reservado";
  if (estado === "vendido-a-vos" || estado === "en-cuotas-tuyo") return "vendido";
  return estado;
}

/** Lee `estado` y `orden` de la URL. Lo que no se reconoce se ignora. Sin `estado`, no hay filtro (se ven todos). */
export function leerFiltro(params: URLSearchParams): FiltroLotes {
  const crudo = (params.get("estado") ?? "").split(",");
  const estados = ESTADOS_FILTRO.filter((e) => crudo.includes(e));
  const o = params.get("orden");
  const orden = ORDENES.find((x) => x === o) ?? ORDEN_POR_DEFECTO;
  return { estados, orden };
}

/** Escribe el filtro en una copia de los parámetros, sin tocar `vista`, `fase` ni `sel`. Los valores por defecto no se escriben. */
export function escribirFiltro(params: URLSearchParams, filtro: FiltroLotes): URLSearchParams {
  const salida = new URLSearchParams(params);
  if (filtro.estados.length > 0) salida.set("estado", filtro.estados.join(","));
  else salida.delete("estado");
  if (filtro.orden !== ORDEN_POR_DEFECTO) salida.set("orden", filtro.orden);
  else salida.delete("orden");
  return salida;
}

export type LoteConEstado = { lote: Lote; estado: EstadoLote };

/** Filtra por estado y ordena. Un lote sin superficie va siempre al final al ordenar por superficie (el dato que falta no es cero). */
export function aplicarFiltro(lotes: LoteConEstado[], filtro: FiltroLotes): LoteConEstado[] {
  const visibles = filtro.estados.length === 0 ? lotes : lotes.filter((l) => filtro.estados.includes(l.estado));
  const copia = [...visibles];
  const porNumero = (a: LoteConEstado, b: LoteConEstado) => a.lote.numero - b.lote.numero;
  // "Número" es el orden del loteo: los primeros 4 van primero y después el sector norte por número.
  if (filtro.orden === "numero") return copia;
  const signo = filtro.orden === "superficie" ? 1 : -1;
  return copia.sort((a, b) => {
    const sa = a.lote.superficieM2;
    const sb = b.lote.superficieM2;
    if (sa === undefined && sb === undefined) return porNumero(a, b);
    if (sa === undefined) return 1;
    if (sb === undefined) return -1;
    return signo * (sa - sb) || porNumero(a, b);
  });
}

/** Cuántos lotes hay por estado. */
export function contarPorEstado(lotes: LoteConEstado[]): Record<EstadoLote, number> {
  const cuenta: Record<EstadoLote, number> = { disponible: 0, reservado: 0, vendido: 0 };
  for (const l of lotes) cuenta[l.estado]++;
  return cuenta;
}
