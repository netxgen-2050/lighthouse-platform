import { CHATS } from "./preguntas";
import { propuestaDePerfil } from "./propuesta";

export type Item = {
  respuesta: string;
  propuesta: string;
  /** Texto confirmado por la persona; null si todavía no confirmó. */
  confirmado: string | null;
};

export type Estado = { items: Item[] };

export type Accion =
  | { tipo: "responder"; texto: string }
  | { tipo: "confirmar"; indice: number }
  | { tipo: "corregir"; indice: number; texto: string }
  | { tipo: "cargar"; estado: Estado }
  | { tipo: "borrar" };

export const ESTADO_INICIAL: Estado = { items: [] };

export function reducir(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "responder": {
      const n = estado.items.length;
      const respuesta = accion.texto.trim();
      if (n >= CHATS.length || respuesta === "") return estado;
      const propuesta = propuestaDePerfil(CHATS[n], respuesta);
      return { items: [...estado.items, { respuesta, propuesta, confirmado: null }] };
    }
    case "confirmar": {
      const item = estado.items[accion.indice];
      if (!item) return estado;
      return reemplazar(estado, accion.indice, { ...item, confirmado: item.propuesta });
    }
    case "corregir": {
      const item = estado.items[accion.indice];
      const texto = accion.texto.trim();
      if (!item || texto === "") return estado;
      return reemplazar(estado, accion.indice, { ...item, propuesta: texto, confirmado: texto });
    }
    case "cargar":
      return accion.estado;
    case "borrar":
      return ESTADO_INICIAL;
  }
}

function reemplazar(estado: Estado, indice: number, item: Item): Estado {
  return { items: estado.items.map((x, i) => (i === indice ? item : x)) };
}

export function cantidadConfirmados(estado: Estado): number {
  return estado.items.filter((i) => i.confirmado !== null).length;
}

export function estaCompleta(estado: Estado): boolean {
  return estado.items.length >= CHATS.length;
}

/** Lee lo guardado en el navegador; ante cualquier dato raro vuelve al estado inicial. */
export function leerGuardado(crudo: string | null): Estado {
  if (!crudo) return ESTADO_INICIAL;
  try {
    const dato: unknown = JSON.parse(crudo);
    const lista = (dato as { items?: unknown } | null)?.items;
    if (!Array.isArray(lista) || lista.length > CHATS.length) return ESTADO_INICIAL;
    const items: Item[] = [];
    for (const x of lista) {
      const o = x as Partial<Item> | null;
      if (
        !o ||
        typeof o.respuesta !== "string" ||
        typeof o.propuesta !== "string" ||
        !(o.confirmado === null || typeof o.confirmado === "string")
      ) {
        return ESTADO_INICIAL;
      }
      items.push({ respuesta: o.respuesta, propuesta: o.propuesta, confirmado: o.confirmado });
    }
    return { items };
  } catch {
    return ESTADO_INICIAL;
  }
}
