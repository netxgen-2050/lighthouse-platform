import type { Tribu } from "@/lib/tribus/tipos";
import { PARA_LIGHTHOUSE, type Compromiso } from "./tipos";

export const TEXTO_TIPO = { ofrezco: "Ofrezco", necesito: "Necesito" } as const;
export const TEXTO_CLASE = { tiempo: "Tiempo", bienes: "Bienes", plata: "Plata" } as const;
export const TEXTO_LIGHTHOUSE = "El Lighthouse en general";

export function describirCompromiso(c: Compromiso, tribus: Pick<Tribu, "id" | "nombre">[]): string {
  const cantidad =
    c.clase === "tiempo"
      ? c.horasPorMes !== undefined
        ? `${c.horasPorMes} h/mes`
        : "sin dato"
      : c.clase === "plata"
        ? c.montoUsd !== undefined
          ? `USD ${c.montoUsd}`
          : "sin dato"
        : (c.cantidadBienes ?? "sin dato");
  const para =
    c.para === PARA_LIGHTHOUSE
      ? TEXTO_LIGHTHOUSE
      : (tribus.find((t) => t.id === c.para)?.nombre ?? "sin dato");
  return `${TEXTO_TIPO[c.tipo]} · ${TEXTO_CLASE[c.clase]} · ${c.descripcion} · ${cantidad} · Para: ${para}`;
}
