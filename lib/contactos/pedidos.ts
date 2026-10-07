import type { Borrador, Canal, Errores, Momento, Motivo, Pedido } from "./tipos";

export const MAX_MENSAJE = 500;

/** Etiqueta visible y destino de cada motivo: los componentes no los escriben a mano. */
export const MOTIVOS: Record<Motivo, { etiqueta: string; destino: string }> = {
  "consulta-lote": { etiqueta: "Consulta por un lote", destino: "BioPueblo, vía NetX como agencia" },
  "invitacion-circulo": { etiqueta: "Invitación al círculo", destino: "Equipo NetX" },
  "charla-netx": { etiqueta: "Charla para invertir en NetX", destino: "Equipo NetX" },
};

export const CANALES: Record<Canal, string> = {
  email: "Email",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

export const MOMENTOS: Record<Momento, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

export function validar(b: Pick<Borrador, "canal" | "mensaje">): Errores {
  const errores: Errores = {};
  if (!b.canal) errores.canal = "Elegí cómo preferís que te contactemos";
  if (b.mensaje.length > MAX_MENSAJE) errores.mensaje = `El mensaje puede tener hasta ${MAX_MENSAJE} caracteres`;
  return errores;
}

/** Arma el pedido a guardar. Supone un borrador ya validado (sin errores). */
export function crearPedido(b: Borrador, ahora: Date, id: string): Pedido {
  if (!b.canal) throw new Error("Falta el canal");
  const mensaje = b.mensaje.trim();
  return {
    id,
    fecha: ahora.toISOString(),
    motivo: b.motivo,
    referencia: b.referencia,
    canal: b.canal,
    ...(b.momento ? { momento: b.momento } : {}),
    ...(mensaje ? { mensaje } : {}),
    destino: MOTIVOS[b.motivo].destino,
    ...(b.estadoMostrado ? { estadoMostrado: b.estadoMostrado } : {}),
  };
}

function esPedido(x: unknown): x is Pedido {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.fecha === "string" &&
    typeof p.referencia === "string" &&
    typeof p.destino === "string" &&
    typeof p.motivo === "string" &&
    p.motivo in MOTIVOS &&
    typeof p.canal === "string" &&
    p.canal in CANALES
  );
}

/** Lee lo guardado; si no es una lista válida devuelve una bandeja vacía. */
export function leerBandeja(texto: string | null): Pedido[] {
  if (!texto) return [];
  try {
    const dato: unknown = JSON.parse(texto);
    if (!Array.isArray(dato)) return [];
    return dato.filter(esPedido);
  } catch {
    return [];
  }
}

/** El pedido más nuevo queda primero. */
export function agregar(bandeja: Pedido[], pedido: Pedido): Pedido[] {
  return [pedido, ...bandeja];
}
