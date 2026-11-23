import { loteTraeFaro } from "@/lib/bien-comun/modelo";
import { adhesionDesactualizada, adhirioAlManifiestoVrn } from "@/lib/gobernanza/participar";
import { estadoConCompras, type CompraLote } from "@/lib/lotes/compra";
import type { OpcionCompra } from "@/lib/lotes/modelo";
import type { Adhesion } from "@/lib/membresia/versiones";
import { listarLotes } from "@/lib/territorios/loteo";

// La vista de Mi tierra (spec mi-tierra). PURA: sin React ni navegador. Arma lo que se dibuja desde las compras simuladas.
// Dos reglas de un solo dueño (design §2):
//  - el ESTADO sale de `estadoConCompras()` (la misma función de la ficha, la lista y el mapa);
//  - el PLAN y los FARO salen de lo que la persona VIO y quedó guardado (`vio.plan`, `vio.faro`): no se recalculan con el
//    modelo de hoy, así un cambio de versión no cambia lo que ya vio. Lo que no se guardó es "sin dato", nunca contado ni 0.

/** Estado que muestra el chip de la tarjeta. */
export type EstadoPortafolio = "reservado" | "enCuotas" | "vendido";

export type PlanPortafolio =
  | { tipo: "no-entra" } // los primeros 4 lotes no entran al plan en cuotas
  | { tipo: "sin-dato" } // compra vieja, sin plan guardado: nunca se presume contado
  | { tipo: "contado"; pago: number | null; total: number | null; fraccionPagada: number }
  | {
      tipo: "cuotas";
      cuotas: number;
      anticipo: number;
      cuota: number | null;
      /** Lo que suma el plan que la persona vio (null si falta algún valor). */
      total: number | null;
      /** Solo se simula el primer pago: tras el anticipo, 0 de N. */
      cuotasPagadas: number;
      /** Lo pagado sobre el total del plan (0 a 1); null si no se puede saber con lo que la persona vio. */
      fraccionPagada: number | null;
    };

export type FaroPortafolio =
  | { tipo: "no-aplica" } // los primeros 4 lotes no traen FARO
  | { tipo: "sin-pago"; total: number | null } // reservado: falta el primer pago
  | { tipo: "acreditado"; acreditados: number | null; total: number | null }
  | { tipo: "a-medida-que-se-paga"; total: number } // compra vieja pagada, con total pero sin plan
  | { tipo: "sin-dato" };

export type LotePortafolio = {
  loteId: string;
  numero: number;
  estado: EstadoPortafolio;
  opcion: OpcionCompra;
  /** El precio que la persona vio (null: sin dato) y la versión del modelo con que lo vio. */
  precioVisto: number | null;
  version: string;
  plan: PlanPortafolio;
  faro: FaroPortafolio;
};

export type MovimientoLibro = {
  /** ISO. */
  fecha: string;
  tipo: "reserva" | "primer-pago" | "pago";
  loteId: string;
  numero: number;
  /** El monto que vio la persona; null es "sin dato". */
  monto: number | null;
};

export type Portafolio = {
  lotes: LotePortafolio[];
  libro: MovimientoLibro[];
  totales: {
    lotes: number;
    /** Lo pagado sobre el total de los planes (0 a 1). null si algún plan no se puede saber. */
    fraccionPagada: number | null;
    /** FARO acreditados (simulados). null si ningún lote pagado tiene el dato. */
    faroAcreditados: number | null;
    /** ¿Algún lote tiene ya el primer pago? Si no, se dice "falta el primer pago". */
    hayPago: boolean;
  };
  voz: { adhirio: boolean; desactualizada: boolean };
};

const finito = (n: number | null | undefined): n is number => typeof n === "number" && Number.isFinite(n);

/** El total del plan que la persona vio: anticipo + cuotas (la última puede ser distinta por el redondeo). null si falta algún valor. */
function totalDelPlan(p: NonNullable<CompraLote["vio"]["plan"]>): number | null {
  if (!finito(p.cuota)) return null;
  const ultima = p.ultimaCuota === undefined || p.ultimaCuota === null ? p.cuota : p.ultimaCuota;
  return p.anticipo + p.cuota * (p.cuotas - 1) + ultima;
}

function planDe(c: CompraLote, entra: boolean): PlanPortafolio {
  if (!entra) return { tipo: "no-entra" };
  const p = c.vio.plan;
  if (!p) return { tipo: "sin-dato" };
  const pagado = c.paso === "pagado";
  if (p.cuotas === 0) return { tipo: "contado", pago: p.anticipo, total: p.anticipo, fraccionPagada: pagado ? 1 : 0 };
  const total = totalDelPlan(p);
  const fraccion = total === null || total <= 0 ? null : pagado ? Math.min(1, p.anticipo / total) : 0;
  return { tipo: "cuotas", cuotas: p.cuotas, anticipo: p.anticipo, cuota: p.cuota, total, cuotasPagadas: 0, fraccionPagada: fraccion };
}

function faroDe(c: CompraLote, entra: boolean): FaroPortafolio {
  if (!entra) return { tipo: "no-aplica" };
  const total = finito(c.vio.faro) ? c.vio.faro : null;
  const pagado = c.paso === "pagado";
  if (!pagado) return c.vio.plan || total !== null ? { tipo: "sin-pago", total } : { tipo: "sin-dato" };
  const p = c.vio.plan;
  if (p) return { tipo: "acreditado", acreditados: finito(p.faroAnticipo) ? p.faroAnticipo : null, total };
  return total !== null ? { tipo: "a-medida-que-se-paga", total } : { tipo: "sin-dato" };
}

function estadoDeLaTarjeta(c: CompraLote, compras: CompraLote[]): EstadoPortafolio {
  switch (estadoConCompras(c.loteId, compras)) {
    case "en-cuotas-tuyo":
      return "enCuotas";
    case "vendido-a-vos":
    case "vendido":
      return "vendido";
    default:
      return "reservado";
  }
}

export function armarPortafolio(compras: CompraLote[], adhesion: Adhesion): Portafolio {
  const loteos = new Map(listarLotes().map((l) => [l.id, l]));
  // Una compra de un lote que ya no está en el loteo no se puede mostrar: se ignora.
  const propias = compras.filter((c) => loteos.has(c.loteId));

  const lotes: LotePortafolio[] = propias.map((c) => {
    const lote = loteos.get(c.loteId)!;
    const entra = loteTraeFaro(lote.grupo);
    return {
      loteId: c.loteId,
      numero: lote.numero,
      estado: estadoDeLaTarjeta(c, compras),
      opcion: c.opcion,
      precioVisto: finito(c.vio.precio) ? c.vio.precio : null,
      version: c.vio.version,
      plan: planDe(c, entra),
      faro: faroDe(c, entra),
    };
  });

  const libro: MovimientoLibro[] = propias
    .flatMap((c): MovimientoLibro[] => {
      const lote = loteos.get(c.loteId)!;
      const base = { loteId: c.loteId, numero: lote.numero };
      const monto = finito(c.vio.precio) ? c.vio.precio : null;
      const filas: MovimientoLibro[] = [{ ...base, fecha: c.reservadoEl, tipo: "reserva", monto }];
      if (c.paso === "pagado" && c.pagadoEl) {
        const p = c.vio.plan;
        const enCuotas = !!p && p.cuotas > 0;
        filas.push({ ...base, fecha: c.pagadoEl, tipo: enCuotas ? "primer-pago" : "pago", monto: p ? p.anticipo : monto });
      }
      return filas;
    })
    // Del más nuevo al más viejo; a igual fecha, el pago antes que la reserva.
    .sort((a, b) => {
      const d = Date.parse(b.fecha) - Date.parse(a.fecha);
      if (d !== 0 && !Number.isNaN(d)) return d;
      return Number(b.tipo !== "reserva") - Number(a.tipo !== "reserva");
    });

  // Lo pagado sobre lo que suman los planes (pesado por el monto de cada plan). Si algún lote no tiene plan o le falta un valor, sin dato.
  // Los primeros 4 lotes no entran al plan: no cuentan ni suman ni restan.
  const planes = lotes.map((l) => l.plan).filter((p) => p.tipo !== "no-entra");
  const todosConPlan = planes.length > 0 && planes.every((p) => p.tipo === "cuotas" || p.tipo === "contado");
  let fraccionPagada: number | null = null;
  if (todosConPlan) {
    let pagado = 0;
    let suma = 0;
    let completo = true;
    for (const p of planes) {
      if ((p.tipo !== "cuotas" && p.tipo !== "contado") || p.total === null || p.fraccionPagada === null) {
        completo = false;
        break;
      }
      pagado += p.total * p.fraccionPagada;
      suma += p.total;
    }
    fraccionPagada = completo && suma > 0 ? pagado / suma : null;
  }

  const acreditados = lotes.flatMap((l) => (l.faro.tipo === "acreditado" && l.faro.acreditados !== null ? [l.faro.acreditados] : []));
  const hayPago = propias.some((c) => c.paso === "pagado");

  return {
    lotes,
    libro,
    totales: {
      lotes: lotes.length,
      fraccionPagada,
      faroAcreditados: acreditados.length === 0 ? null : acreditados.reduce((a, b) => a + b, 0),
      hayPago,
    },
    voz: {
      adhirio: adhirioAlManifiestoVrn(adhesion.membresias, adhesion.versiones),
      desactualizada: adhesionDesactualizada(adhesion.membresias, adhesion.versiones),
    },
  };
}
