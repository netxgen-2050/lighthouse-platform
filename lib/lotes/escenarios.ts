import { areaM2 } from "@/lib/territorios/geometria";
import { macrolote7 } from "@/lib/territorios/biopueblo";
import { lotesDelGrupo } from "@/lib/territorios/loteo";
import { MODELO_LOTES, aportePrimerAnio } from "./modelo";

// Tres escenarios del costo anual del bien común y qué parte cubre la venta de lotes (modelo-hibrido-procomun, design §4).
// Puro: sin React ni Next. Los escenarios NO son un presupuesto: el costo real del bien común no está calculado y falta el
// dato de Vagner. Ningún resultado de acá es "lo que falta": el resto sale de fuentes que todavía no existen ("sin dato").
// Los valores están acá y en ningún otro lado: las pantallas los leen.

export type IdEscenario = "arranque" | "simulacion" | "alta";

type Bilingue = { es: string; en: string };

export type EscenarioCosto = {
  id: IdEscenario;
  nombre: Bilingue;
  /** USD por año, de ejemplo. */
  costoAnual: number;
  fuente: Bilingue;
};

export const ESCENARIOS_COSTO: readonly EscenarioCosto[] = [
  {
    id: "arranque",
    nombre: { es: "Arranque", en: "Start-up" },
    costoAnual: 30_000,
    fuente: {
      es: "el masterplan de permacultura del primer año (Gus, 8-nov-2026, estimación)",
      en: "the permaculture masterplan for the first year (Gus, 8 Nov 2026, estimate)",
    },
  },
  {
    id: "simulacion",
    nombre: { es: "Simulación de octubre", en: "October simulation" },
    costoAnual: MODELO_LOTES.presupuestoComunAnual,
    fuente: {
      es: "NS_Tokenomics sim/RESULTS.md (\"Commons opex USD 6k/month\", marcado ❓: nadie lo costeó)",
      en: "NS_Tokenomics sim/RESULTS.md (\"Commons opex USD 6k/month\", marked ❓: nobody costed it)",
    },
  },
  {
    id: "alta",
    nombre: { es: "Alternativa alta", en: "High alternative" },
    costoAnual: 240_000,
    fuente: {
      es: "NS_Tokenomics sim/lot_sale_sim.py, COMMONS_BUDGETS (criterio, sin presupuesto detrás)",
      en: "NS_Tokenomics sim/lot_sale_sim.py, COMMONS_BUDGETS (judgment call, no budget behind it)",
    },
  },
];

export const escenarioPorId = (id: IdEscenario): EscenarioCosto => ESCENARIOS_COSTO.find((e) => e.id === id)!;

/** El masterplan del primer año: "más de" este monto. Es el único rubro con un valor, y es una estimación. */
export const MASTERPLAN_PRIMER_ANIO_USD = escenarioPorId("arranque").costoAnual;

/** Lotes que cuentan para el aporte: los del sector norte. Los primeros 4 no se suman (R40): si aportan, sin dato. */
export const lotesDelSector = (): number => lotesDelGrupo("norte").length;

/**
 * Qué parte del macrolote 7 (el 7A, todo Lighthouse VRN) son los lotes privados: superficie de los lotes del sector norte
 * sobre la del polígono del macrolote. Sale del loteo y del polígono vigentes, nunca escrita a mano. Sin superficie de
 * algún lote o sin polígono, null (sin dato).
 */
export function parteDelSectorPrivada(): number | null {
  const lotes = lotesDelGrupo("norte");
  const poligono = macrolote7();
  if (!poligono || lotes.length === 0) return null;
  if (lotes.some((l) => typeof l.superficieM2 !== "number")) return null;
  const lotesM2 = lotes.reduce((s, l) => s + (l.superficieM2 as number), 0);
  const total = areaM2(poligono.anillo);
  return total > 0 ? lotesM2 / total : null;
}

export type EntradaCobertura = {
  /** USD por año. */
  costoAnual: number;
  /** USD por lote por año. */
  expensa: number;
  lotes: number;
};

export type Cobertura = {
  costoAnual: number;
  /** Aporte único repartido en los años de venta, por año. */
  aporteAnual: number;
  /** Expensas de todos los lotes, por año. */
  expensasAnual: number;
  /** Lo que entra por año durante los años de venta: aporte más expensas. */
  duranteLaVenta: number;
  /** Lo que entra por año después: solo expensas (el aporte no se repite). */
  despues: number;
  /** Fracción del costo (1 = todo el costo). Puede pasar de 1. */
  fraccionDuranteLaVenta: number;
  fraccionDespues: number;
  /** Lo que la venta no cubre, por año; 0 si cubre todo. */
  restoDuranteLaVenta: number;
  restoDespues: number;
};

const valido = (n: number) => typeof n === "number" && Number.isFinite(n);

/** Qué parte del costo anual cubre la venta. Con un dato inválido (costo ≤ 0, lotes ≤ 0, expensa < 0), null: sin dato. */
export function cobertura({ costoAnual, expensa, lotes }: EntradaCobertura): Cobertura | null {
  if (!valido(costoAnual) || !valido(expensa) || !valido(lotes)) return null;
  if (costoAnual <= 0 || lotes <= 0 || expensa < 0) return null;
  const aporteAnual = aportePrimerAnio(lotes);
  if (aporteAnual === null) return null;
  const expensasAnual = Math.round(lotes * expensa);
  const duranteLaVenta = aporteAnual + expensasAnual;
  const despues = expensasAnual;
  return {
    costoAnual,
    aporteAnual,
    expensasAnual,
    duranteLaVenta,
    despues,
    fraccionDuranteLaVenta: duranteLaVenta / costoAnual,
    fraccionDespues: despues / costoAnual,
    restoDuranteLaVenta: Math.max(0, costoAnual - duranteLaVenta),
    restoDespues: Math.max(0, costoAnual - despues),
  };
}

/** La cobertura de un escenario con los valores de ejemplo del módulo y los lotes del sector. */
export const coberturaDeEscenario = (id: IdEscenario): Cobertura | null =>
  cobertura({ costoAnual: escenarioPorId(id).costoAnual, expensa: MODELO_LOTES.expensaAnual, lotes: lotesDelSector() });
