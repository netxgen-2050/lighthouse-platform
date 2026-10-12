import type { Borrador, Canal, Errores, Momento, Motivo, OrigenPedido, Pedido } from "./tipos";

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

/** Referencia de una finca: su número o, si no tiene, su id para no confundirla con otra. */
export function referenciaDeFinca(numero: number | undefined, id: string): string {
  return numero === undefined ? `Finca sin número (${id})` : `Finca ${numero}`;
}

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
    ...(b.origen && (b.origen.fuente || b.origen.medio || b.origen.campana)
      ? { origen: { ...b.origen } }
      : {}),
  };
}

/** Un origen mal formado (o vacío) se lee como "sin origen"; el pedido sigue valiendo. */
function leerOrigenDePedido(x: unknown): OrigenPedido | undefined {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return undefined;
  const o = x as Record<string, unknown>;
  const partes = { fuente: o.fuente, medio: o.medio, campana: o.campana };
  if (Object.values(partes).some((v) => v !== undefined && typeof v !== "string")) return undefined;
  const origen: OrigenPedido = {
    ...(typeof partes.fuente === "string" ? { fuente: partes.fuente } : {}),
    ...(typeof partes.medio === "string" ? { medio: partes.medio } : {}),
    ...(typeof partes.campana === "string" ? { campana: partes.campana } : {}),
  };
  return origen.fuente || origen.medio || origen.campana ? origen : undefined;
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
    Object.hasOwn(MOTIVOS, p.motivo) &&
    typeof p.canal === "string" &&
    Object.hasOwn(CANALES, p.canal) &&
    (p.momento === undefined || (typeof p.momento === "string" && Object.hasOwn(MOMENTOS, p.momento))) &&
    (p.mensaje === undefined || typeof p.mensaje === "string") &&
    (p.estadoMostrado === undefined || typeof p.estadoMostrado === "string")
  );
}

/** Lee lo guardado; si no es una lista válida devuelve una bandeja vacía. */
export function leerBandeja(texto: string | null): Pedido[] {
  if (!texto) return [];
  try {
    const dato: unknown = JSON.parse(texto);
    if (!Array.isArray(dato)) return [];
    return dato.filter(esPedido).map((p) => {
      const { origen: crudo, ...resto } = p as Pedido & { origen?: unknown };
      const origen = leerOrigenDePedido(crudo);
      return origen ? { ...resto, origen } : resto;
    });
  } catch {
    return [];
  }
}

/** El pedido más nuevo queda primero. Un id que ya está en la bandeja no se vuelve a agregar (reintentos). */
export function agregar(bandeja: Pedido[], pedido: Pedido): Pedido[] {
  if (bandeja.some((p) => p.id === pedido.id)) return bandeja;
  return [pedido, ...bandeja];
}
