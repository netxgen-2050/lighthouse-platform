// Arma el Resumen de la Vista NetX: junta los números de lib/financiamiento con correrSerie de lib/series (valores de
// partida). Función pura, sin React ni Next. El dato que falta es null, nunca 0.

import { ESCENARIOS, estadoDePartida, parametrosDesde } from "@/lib/series/escenarios";
import { correrSerie } from "@/lib/series/modelo";
import type { IdEscenario, ResultadoSerie } from "@/lib/series/tipos";
import { CONSUMO_MENSUAL_USD, CONTRATO_DISENO_BIOPUEBLO_USD, META_SAFE_USD } from "./fuentes";
import { capitalNecesario, comisionDesarrollo } from "./pista";
import {
  ESCENARIOS_PLATAFORMA,
  IDS_PLATAFORMA,
  correrPlataforma,
  recaudacionPase,
  type EscenarioPlataforma,
} from "./plataforma";
import { MONTE_CARLO } from "./riesgo";

export type Serie = IdEscenario;
export type DestinoReparto = "procomun" | "netx" | "unidades" | "primeraPerdida" | "notas";

export type Resumen = {
  netx: {
    safe: { min: number; max: number };
    gestionAnual: Record<Serie, number>;
    desarrolloAgrovoltaica: { min: number; max: number } | null;
    plataformaMes36: Record<EscenarioPlataforma, { ingreso: number; pctConsumo: number | null }>;
    contratoDiseno: null;
  };
  procomun: {
    vinedo: { total: number; anios: number };
    agrovoltaica: { total: number; anios: number };
    pase: Record<EscenarioPlataforma, { recaudado: number; alcanzaMinimo: boolean; destino: "procomun" }>;
  };
  inversores: {
    vinedo: { multiplo: number | null; tir: number | null; anios: number };
    agrovoltaica: { multiplo: number | null; tir: number | null; anios: number; notasTir: number | null };
    primeraPerdidaTir: Record<Serie, number | null>;
  };
  reparto: Record<Serie, { destino: DestinoReparto; monto: number | null }[]>;
  riesgo: Record<Serie, { p10: number; p50: number; p90: number; pPierden: number }>;
  pista: {
    consumoMensual: number | null;
    consumoAnual: number | null;
    capital15: number | null;
    capital10: number | null;
  };
  incomodos: {
    capital15: number | null;
    capital10: number | null;
    membresiasPct: Record<EscenarioPlataforma, number | null>;
    primeraNoRecupera: Record<Serie, number>;
    contratoDiseno: null;
  };
};

function correr(id: Serie): ResultadoSerie {
  const { decididos, medidos, supuestos } = parametrosDesde(id, estadoDePartida(id));
  return correrSerie(id, decididos, medidos, supuestos);
}

function repartoDe(r: ResultadoSerie): { destino: DestinoReparto; monto: number | null }[] {
  return [
    { destino: "procomun", monto: r.procomun.recibe },
    { destino: "netx", monto: r.netx.recibe },
    { destino: "unidades", monto: r.unidades.recibe },
    { destino: "primeraPerdida", monto: r.primeraPerdida.recibe },
    { destino: "notas", monto: r.notas ? r.notas.recibe : null },
  ];
}

export function armarResumen(): Resumen {
  const vinedo = correr("vinedo");
  const agro = correr("agrovoltaica");
  const consumo = CONSUMO_MENSUAL_USD.valor;

  const plataformaMes36 = {} as Resumen["netx"]["plataformaMes36"];
  const membresiasPct = {} as Resumen["incomodos"]["membresiasPct"];
  const pase = {} as Resumen["procomun"]["pase"];
  for (const id of IDS_PLATAFORMA) {
    const fila = correrPlataforma(ESCENARIOS_PLATAFORMA[id]).filas[35];
    plataformaMes36[id] = { ingreso: fila.ingreso, pctConsumo: fila.pctConsumo };
    membresiasPct[id] = fila.pctConsumo;
    pase[id] = recaudacionPase(id);
  }

  const capital15 = capitalNecesario(consumo, 0.015);
  const capital10 = capitalNecesario(consumo, 0.01);

  return {
    netx: {
      safe: { min: META_SAFE_USD.min, max: META_SAFE_USD.max },
      gestionAnual: {
        vinedo: vinedo.netx.recibe / ESCENARIOS.vinedo.horizonte,
        agrovoltaica: agro.netx.recibe / ESCENARIOS.agrovoltaica.horizonte,
      },
      desarrolloAgrovoltaica: comisionDesarrollo(agro.levantado),
      plataformaMes36,
      contratoDiseno: CONTRATO_DISENO_BIOPUEBLO_USD.valor as null,
    },
    procomun: {
      vinedo: { total: vinedo.procomun.recibe, anios: ESCENARIOS.vinedo.horizonte },
      agrovoltaica: { total: agro.procomun.recibe, anios: ESCENARIOS.agrovoltaica.horizonte },
      pase,
    },
    inversores: {
      vinedo: { multiplo: vinedo.unidades.multiplo, tir: vinedo.unidades.tir, anios: ESCENARIOS.vinedo.horizonte },
      agrovoltaica: {
        multiplo: agro.unidades.multiplo,
        tir: agro.unidades.tir,
        anios: ESCENARIOS.agrovoltaica.horizonte,
        notasTir: agro.notas ? agro.notas.tir : null,
      },
      primeraPerdidaTir: { vinedo: vinedo.primeraPerdida.tir, agrovoltaica: agro.primeraPerdida.tir },
    },
    reparto: { vinedo: repartoDe(vinedo), agrovoltaica: repartoDe(agro) },
    riesgo: {
      vinedo: { ...MONTE_CARLO.vinedo.tirUnidades, pPierden: MONTE_CARLO.vinedo.pPierden },
      agrovoltaica: { ...MONTE_CARLO.agrovoltaica.tirUnidades, pPierden: MONTE_CARLO.agrovoltaica.pPierden },
    },
    pista: {
      consumoMensual: consumo,
      consumoAnual: consumo === null ? null : consumo * 12,
      capital15,
      capital10,
    },
    incomodos: {
      capital15,
      capital10,
      membresiasPct,
      primeraNoRecupera: {
        vinedo: MONTE_CARLO.vinedo.pPrimeraNoSeRecupera,
        agrovoltaica: MONTE_CARLO.agrovoltaica.pPrimeraNoSeRecupera,
      },
      contratoDiseno: null,
    },
  };
}
