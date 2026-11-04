import { listarLotes } from "@/lib/territorios/loteo";
import { estadoDeLote, type EstadoLote } from "@/lib/territorios/loteo-estados";
import { OPCIONES_COMPRA, type OpcionCompra } from "./modelo";

// Reservar, pago simulado y boleto de ejemplo (spec lotes-compra-simulada). Puro: sin React ni Next.
// Todo es SIMULADO y vive solo en el navegador. El registro NO tiene ningún campo de identidad ni de pago.

export type PasoCompra = "reservado" | "pagado";

/** Lo que la persona vio, para que un boleto viejo no cambie si cambia el modelo. */
export type LoVisto = {
  precio: number | null;
  aporte: number | null;
  expensa: number | null;
  version: string;
  /** Precio de la casa elegida que vio la persona (opcional: no hay en "solo el lote" ni en lo guardado antes). */
  precioCasa?: number | null;
  /** Fuente del modelo con que se calcularon los valores (opcional: lo guardado antes no la tiene). */
  fuente?: string;
};

export type CompraLote = {
  loteId: string;
  opcion: OpcionCompra;
  paso: PasoCompra;
  reservadoEl: string; // ISO
  pagadoEl?: string;
  vio: LoVisto;
};

/** Estado de un lote para la persona: los de ejemplo, más lo que ella reservó o "pagó" en la simulación. */
export type EstadoMostrado = EstadoLote | "reservado-por-vos" | "vendido-a-vos";

export type ResultadoCompra = { ok: true; compras: CompraLote[] } | { ok: false; motivo: "no-disponible" | "ya-reservado" | "no-reservado" | "desconocido" };

const esNumeroONull = (x: unknown): x is number | null => x === null || (typeof x === "number" && Number.isFinite(x));

function esCompra(x: unknown): x is CompraLote {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  const v = c.vio as Record<string, unknown> | undefined;
  return (
    typeof c.loteId === "string" &&
    typeof c.opcion === "string" &&
    (OPCIONES_COMPRA as readonly string[]).includes(c.opcion) &&
    (c.paso === "reservado" || c.paso === "pagado") &&
    typeof c.reservadoEl === "string" &&
    (c.pagadoEl === undefined || typeof c.pagadoEl === "string") &&
    typeof v === "object" &&
    v !== null &&
    esNumeroONull(v.precio) &&
    esNumeroONull(v.aporte) &&
    esNumeroONull(v.expensa) &&
    typeof v.version === "string" &&
    (v.precioCasa === undefined || esNumeroONull(v.precioCasa)) &&
    (v.fuente === undefined || typeof v.fuente === "string")
  );
}

/** Lee lo guardado. Un JSON inválido, o algo que no es una lista, da una lista vacía. Solo se copian los campos conocidos. */
export function leerCompras(texto: string | null): CompraLote[] {
  if (!texto) return [];
  try {
    const dato: unknown = JSON.parse(texto);
    if (!Array.isArray(dato)) return [];
    const vistos = new Set<string>();
    return dato.filter(esCompra).flatMap((c) => {
      if (vistos.has(c.loteId)) return [];
      vistos.add(c.loteId);
      const { loteId, opcion, paso, reservadoEl, pagadoEl, vio } = c;
      return [
        {
          loteId,
          opcion,
          paso,
          reservadoEl,
          ...(pagadoEl ? { pagadoEl } : {}),
          vio: {
            precio: vio.precio,
            aporte: vio.aporte,
            expensa: vio.expensa,
            version: vio.version,
            ...(vio.precioCasa !== undefined ? { precioCasa: vio.precioCasa } : {}),
            ...(vio.fuente !== undefined ? { fuente: vio.fuente } : {}),
          },
        },
      ];
    });
  } catch {
    return [];
  }
}

export const compraDe = (compras: CompraLote[], loteId: string): CompraLote | undefined =>
  compras.find((c) => c.loteId === loteId);

const existe = (loteId: string) => listarLotes().some((l) => l.id === loteId);

/** Reserva un lote. Falla si el lote no existe, si su estado base no es "disponible" o si la persona ya lo tiene. */
export function reservar(
  compras: CompraLote[],
  loteId: string,
  opcion: OpcionCompra,
  vio: LoVisto,
  ahora: Date,
): ResultadoCompra {
  if (!existe(loteId)) return { ok: false, motivo: "desconocido" };
  if (estadoDeLote(loteId) !== "disponible") return { ok: false, motivo: "no-disponible" };
  if (compraDe(compras, loteId)) return { ok: false, motivo: "ya-reservado" };
  return {
    ok: true,
    compras: [...compras, { loteId, opcion, paso: "reservado", reservadoEl: ahora.toISOString(), vio }],
  };
}

/** Simula el pago de lo reservado. Falla si el lote no está reservado por la persona. */
export function pagar(compras: CompraLote[], loteId: string, ahora: Date): ResultadoCompra {
  const c = compraDe(compras, loteId);
  if (!c || c.paso !== "reservado") return { ok: false, motivo: "no-reservado" };
  return {
    ok: true,
    compras: compras.map((x) => (x.loteId === loteId ? { ...x, paso: "pagado" as const, pagadoEl: ahora.toISOString() } : x)),
  };
}

/** Saca la reserva o el pago simulado de un lote. Un lote que no estaba queda igual. */
export const deshacer = (compras: CompraLote[], loteId: string): CompraLote[] => compras.filter((c) => c.loteId !== loteId);

/** El estado base del lote, con lo que la persona reservó o "pagó". Un id que no existe en el loteo se ignora. */
export function estadoConCompras(loteId: string, compras: CompraLote[]): EstadoMostrado {
  const base = estadoDeLote(loteId);
  if (!existe(loteId)) return base;
  const c = compraDe(compras, loteId);
  if (!c || base !== "disponible") return base;
  return c.paso === "pagado" ? "vendido-a-vos" : "reservado-por-vos";
}
