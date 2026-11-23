import { sinDato } from "@/lib/idioma/formatos";
import type { Idioma } from "@/lib/idioma/tipos";
import { usd } from "@/lib/series/formato";
import { MODELO_LOTES, precioCasa, type TipoCasa } from "./modelo";

// Qué es privado y qué es del bien común en el modelo híbrido (modelo-hibrido-procomun, design §2, §5, §10 y §11).
// Puro: sin React ni Next. Ningún número se escribe acá: salen de `modelo.ts`. Lo que no tiene valor dice "sin dato".

/** Versión del texto que la persona acepta al reservar (la guarda la reserva simulada y la muestra el boleto). */
export const VERSION_HIBRIDO = "hibrido-v0.1 · 2026-11-08";

type Bilingue = { es: string; en: string };
const t = (idioma: Idioma, b: Bilingue): string => (idioma === "en" ? b.en : b.es);

export type IdRubro =
  | "lote"
  | "casa"
  | "caminos"
  | "agua"
  | "aguas"
  | "basura"
  | "escuela"
  | "restauracion"
  | "produccion";

export type Rubro = {
  id: IdRubro;
  /** Se dice en texto: "Privado" o "Común" (nunca solo con color). */
  tipo: "privado" | "comun";
  nombre: Bilingue;
  quienPaga: "quien-compra" | "presupuesto-comun";
  /** Quién lo cuidaría (propuesta C, 8-nov): solo lo común. */
  cuida: "consorcio" | "fundacion" | null;
};

export const RUBROS: readonly Rubro[] = [
  { id: "lote", tipo: "privado", nombre: { es: "Tu lote", en: "Your lot" }, quienPaga: "quien-compra", cuida: null },
  {
    id: "casa",
    tipo: "privado",
    nombre: { es: "Tu casa, si la construís", en: "Your house, if you build one" },
    quienPaga: "quien-compra",
    cuida: null,
  },
  { id: "caminos", tipo: "comun", nombre: { es: "Caminos", en: "Roads" }, quienPaga: "presupuesto-comun", cuida: "consorcio" },
  { id: "agua", tipo: "comun", nombre: { es: "Agua", en: "Water" }, quienPaga: "presupuesto-comun", cuida: "consorcio" },
  {
    id: "aguas",
    tipo: "comun",
    nombre: { es: "Aguas grises y negras", en: "Grey and black water" },
    quienPaga: "presupuesto-comun",
    cuida: "consorcio",
  },
  { id: "basura", tipo: "comun", nombre: { es: "Basura", en: "Waste" }, quienPaga: "presupuesto-comun", cuida: "consorcio" },
  { id: "escuela", tipo: "comun", nombre: { es: "Escuela", en: "School" }, quienPaga: "presupuesto-comun", cuida: "fundacion" },
  {
    id: "restauracion",
    tipo: "comun",
    nombre: { es: "Restauración", en: "Restoration" },
    quienPaga: "presupuesto-comun",
    cuida: "fundacion",
  },
  {
    id: "produccion",
    tipo: "comun",
    nombre: { es: "Producción", en: "Production" },
    quienPaga: "presupuesto-comun",
    cuida: "fundacion",
  },
];

export const rubrosPrivados = (): Rubro[] => RUBROS.filter((r) => r.tipo === "privado");
export const rubrosComunes = (): Rubro[] => RUBROS.filter((r) => r.tipo === "comun");

export const nombreDeRubro = (r: Rubro, idioma: Idioma): string => t(idioma, r.nombre);

export const textoTipo = (r: Rubro, idioma: Idioma): string =>
  r.tipo === "privado" ? (idioma === "en" ? "Private" : "Privado") : idioma === "en" ? "Common" : "Común";

export const textoQuienPaga = (r: Rubro, idioma: Idioma): string =>
  r.quienPaga === "quien-compra"
    ? idioma === "en"
      ? "Whoever buys"
      : "Quien compra"
    : idioma === "en"
      ? "Common budget"
      : "Presupuesto común";

export const textoQuienCuida = (r: Rubro, idioma: Idioma): string => {
  if (r.cuida === null) return idioma === "en" ? "Its owner" : "Quien lo compra";
  if (r.cuida === "consorcio") return idioma === "en" ? "Owners' association" : "Consorcio de propietarios";
  return idioma === "en" ? "Foundation (does not exist yet)" : "Fundación (todavía no existe)";
};

const CASAS: readonly TipoCasa[] = ["modular", "familiar", "amplia"];

/** Cuánto cuesta cada rubro: el lote y la casa, un rango del módulo (de ejemplo); lo común, "sin dato". */
export function costoDeRubro(r: Rubro, idioma: Idioma): string {
  if (r.id === "lote") return `${usd(MODELO_LOTES.precioLote.min)} – ${usd(MODELO_LOTES.precioLote.max)}`;
  if (r.id === "casa") {
    const precios = CASAS.map(precioCasa);
    return `${usd(Math.min(...precios))} – ${usd(Math.max(...precios))}`;
  }
  return sinDato(idioma);
}

// ---------------------------------------------------------------------------------------------------------------------
// Resguardos (doc 18 §4): lo que el modelo híbrido pide. Todos dicen que todavía no están hechos.

export type IdResguardo = "servidumbres" | "reglamento" | "reventa" | "rio";

export type Resguardo = { id: IdResguardo; nombre: Bilingue; texto: Bilingue; estado: Bilingue; aparte?: Bilingue };

const TODAVIA_NO: Bilingue = { es: "Todavía no está hecho", en: "Not done yet" };

export const RESGUARDOS: readonly Resguardo[] = [
  {
    id: "servidumbres",
    nombre: { es: "Servidumbres", en: "Easements" },
    texto: { es: "Se registran antes de la primera venta.", en: "They are registered before the first sale." },
    estado: TODAVIA_NO,
  },
  {
    id: "reglamento",
    nombre: { es: "Mismo reglamento y aporte", en: "Same regulation and contribution" },
    texto: {
      es: "Quien compra cumple el mismo reglamento y hace el mismo aporte que todos.",
      en: "Whoever buys follows the same regulation and makes the same contribution as everyone.",
    },
    estado: TODAVIA_NO,
  },
  {
    id: "reventa",
    nombre: { es: "Preferencia de reventa", en: "Resale preference" },
    texto: {
      es: "Si alguien revende, hay una preferencia acordada de antemano.",
      en: "If someone resells, there is a preference agreed in advance.",
    },
    estado: TODAVIA_NO,
  },
  {
    id: "rio",
    nombre: { es: "Franja del río", en: "River strip" },
    texto: { es: "Ninguna venta sobre la franja del río.", en: "No sale on the river strip." },
    estado: TODAVIA_NO,
    aparte: {
      es: "El loteo provisorio no considera la costa ni la línea de inundación: todavía no está verificado (sin dato).",
      en: "The provisional subdivision does not consider the shore or the flood line: it is not verified yet (no data).",
    },
  },
];

export const nombreDeResguardo = (r: Resguardo, idioma: Idioma): string => t(idioma, r.nombre);
export const textoDeResguardo = (r: Resguardo, idioma: Idioma): string => t(idioma, r.texto);
export const estadoDeResguardo = (r: Resguardo, idioma: Idioma): string => t(idioma, r.estado);
export const apartadoDeResguardo = (r: Resguardo, idioma: Idioma): string | null => (r.aparte ? t(idioma, r.aparte) : null);

// ---------------------------------------------------------------------------------------------------------------------
// Resumen de la ficha de cada lote (design §11): tres líneas.

export type ValoresResumen = { aporte: string; expensa: string };

/** Las tres líneas de "Lo que compartís y lo que pagás". Los valores llegan formateados desde el módulo del modelo. */
export function lineasDelResumen(idioma: Idioma, v: ValoresResumen): [string, string, string] {
  return idioma === "en"
    ? [
        "Your lot and your house are yours; roads, water, the corridor and production belong to everyone.",
        `You pay the one-off contribution to the commons (${v.aporte}) and common charges (${v.expensa} per year).`,
        "You follow the same regulation as everyone.",
      ]
    : [
        "Tu lote y tu casa son tuyos; caminos, agua, corredor y producción son de todos.",
        `Pagás el aporte único al bien común (${v.aporte}) y las expensas (${v.expensa} por año).`,
        "Cumplís el mismo reglamento que todos.",
      ];
}
