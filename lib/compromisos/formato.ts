import type { Compromiso } from "./tipos";

export const TEXTO_TIPO = { ofrezco: "Ofrezco", necesito: "Necesito" } as const;
export const TEXTO_CLASE = { tiempo: "Tiempo", bienes: "Bienes", plata: "Plata", trueque: "Trueque" } as const;

/** Cantidad orientativa en palabras; el trueque no lleva cantidad. */
export function describirCantidad(c: Compromiso): string | null {
  switch (c.clase) {
    case "tiempo":
      return c.horasPorMes !== undefined ? `${c.horasPorMes} h/mes` : "sin dato";
    case "plata":
      return c.montoUsd !== undefined ? `USD ${c.montoUsd}` : "sin dato";
    case "bienes":
      return c.cantidadBienes ?? "sin dato";
    case "trueque":
      return null;
  }
}

export function describirCompromiso(c: Compromiso): string {
  const cantidad = describirCantidad(c);
  const partes = [TEXTO_TIPO[c.tipo], TEXTO_CLASE[c.clase], c.descripcion];
  if (cantidad !== null) partes.push(cantidad);
  return partes.join(" · ");
}
