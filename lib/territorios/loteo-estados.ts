// Estados de EJEMPLO de los lotes del sector norte (spec loteo-norte). Viven aparte de la geometría: así reemplazar el
// plano no pisa los estados. Un lote sin entrada figura disponible: en una simulación es el estado de partida, no una medición.

export type EstadoLote = "disponible" | "reservado" | "vendido";

export const ESTADOS_EJEMPLO: Readonly<Record<string, Exclude<EstadoLote, "disponible">>> = {
  "lote-5": "reservado",
  "lote-13": "vendido",
  "lote-24": "reservado",
};

export function estadoDeLote(id: string): EstadoLote {
  return Object.hasOwn(ESTADOS_EJEMPLO, id) ? ESTADOS_EJEMPLO[id] : "disponible";
}
