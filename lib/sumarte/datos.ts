// Planes de Sumarte de la fase 1 (sumarte-planes-v2, Gus 27-nov-2026): Explorador, Amigo, Fundador y Aliados.
// Todos los precios, cupos y reglas del FARO de prepago viven acá: la página no escribe ningún número a mano.
// Valores de ejemplo, a validar con Vagner: ningún flujo cobra de verdad.
import type { Bilingue } from "@/lib/idioma/tipos";

/** Nivel del Fundador guardado en el estado. Los niveles Semilla/Brote/Raíz del modelo anterior ya no existen. */
export type NivelPase = "fundador";

/** Precio del Amigo (USD): el anual es 10 veces el mensual ("2 meses gratis"). */
export const AMIGO = { mensual: 9, anual: 90 } as const;

/** Precio único del Fundador (USD) y su cohorte limitada. `vendidos` es un valor de ejemplo. */
export const FUNDADOR = { precio: 1500, cupo: 100, vendidos: 37 } as const;

/**
 * FARO de prepago (tercera puerta de FARO, "Prepagando servicios"). Borrador: Gus, 27-nov-2026, reglas como placeholders.
 * Mientras `borrador` sea `true`, cada número de las reglas se muestra con "(a definir)".
 */
export const FARO_PREPAGO = {
  borrador: true,
  precioUsd: 1, // 1 FARO = USD 1 a precio de lista
  amigoPorMes: 5,
  fundadorDeUnaVez: 1200,
  venceAmigoMeses: 12,
  venceFundadorMeses: 36,
  parteServicioAmigo: 0.45, // de la cuota: servicio de NetX; el resto se acredita como FARO para el bien común
  daVoz: false,
} as const;

/** Cuántos pases quedan en la cohorte del Fundador (con el pase de la persona, si lo activó). */
export function pasesQueQuedan(activo: boolean): number {
  return Math.max(0, FUNDADOR.cupo - FUNDADOR.vendidos - (activo ? 1 : 0));
}

/** Cómo se reparte lo que paga la persona: servicio de NetX y FARO que se reserva para el bien común (USD). */
export function repartoDelPago(plan: "amigo" | "fundador", facturacion: "mensual" | "anual"): { servicio: number; faro: number } {
  if (plan === "fundador") {
    return { servicio: FUNDADOR.precio - FARO_PREPAGO.fundadorDeUnaVez, faro: FARO_PREPAGO.fundadorDeUnaVez };
  }
  const meses = facturacion === "anual" ? 12 : 1;
  const faro = FARO_PREPAGO.amigoPorMes * meses;
  return { servicio: (facturacion === "anual" ? AMIGO.anual : AMIGO.mensual) - faro, faro };
}

/** Qué hace cada plan con una función: la incluye, no la incluye o todavía no existe ("próximamente"). */
export type Estado = "si" | "no" | "pronto";

export type Fila = { texto: Bilingue; incluye: readonly [Estado, Estado, Estado] };

/** Columnas: Explorador, Amigo, Fundador. El inglés está pendiente de revisión nativa. */
export const FILAS: readonly Fila[] = [
  {
    texto: { es: "Mapa y lotes en vitrina", en: "Map and lots on display" },
    incluye: ["si", "si", "si"],
  },
  {
    texto: { es: "Bien común: leer números y propuestas", en: "Common good: read the numbers and proposals" },
    incluye: ["si", "si", "si"],
  },
  {
    texto: {
      es: "Participa: sumarte a un equipo y adherir al manifiesto",
      en: "Participa: join a team and sign on to the manifesto",
    },
    incluye: ["si", "si", "si"],
  },
  {
    texto: { es: "Mi tierra, Hifa y novedades mensuales", en: "My land, Hifa and monthly news" },
    incluye: ["si", "si", "si"],
  },
  {
    texto: { es: "Bitácora de obra y masterplan", en: "Construction log and masterplan" },
    incluye: ["no", "pronto", "pronto"],
  },
  {
    texto: { es: "Una sesión al mes con el equipo", en: "One session a month with the team" },
    incluye: ["no", "pronto", "pronto"],
  },
  {
    texto: {
      es: "Cupo antes que nadie en visitas y eventos (nunca en lotes)",
      en: "First access to visits and events (never to lots)",
    },
    incluye: ["no", "pronto", "pronto"],
  },
  {
    texto: { es: "FARO de prepago, para canjear por servicios", en: "Prepaid FARO, to redeem for services" },
    incluye: ["no", "si", "si"],
  },
  {
    texto: { es: "Visita guiada al sitio", en: "Guided visit to the site" },
    incluye: ["no", "no", "pronto"],
  },
  {
    texto: { es: "Nombre en el registro Génesis", en: "Your name in the Genesis registry" },
    incluye: ["no", "no", "si"],
  },
];

/** Lo que ofrece Aliados (organizaciones): todo es "próximamente". */
export const BENEFICIOS_ALIADOS: readonly Bilingue[] = [
  { es: "Patrocinar un proyecto de regeneración", en: "Sponsor a regeneration project" },
  { es: "Talleres para equipos", en: "Workshops for teams" },
  { es: "Acceso a datos para investigación", en: "Access to data for research" },
];

/** Número con punto de miles (es-AR), sin depender del locale del entorno. */
export function miles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
