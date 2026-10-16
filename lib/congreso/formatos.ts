// Funciones puras de formato del evento: fechas, cuenta regresiva y precios.
import type { TipoEntrada } from "./evento";
import type { Idioma } from "./idioma";

const MESES: Record<Idioma, string[]> = {
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
const MESES_CORTOS: Record<Idioma, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function partes(iso: string): { anio: number; mes: number; dia: number } {
  const [anio, mes, dia] = iso.slice(0, 10).split("-").map(Number);
  return { anio, mes: mes - 1, dia };
}

/** "5–9" + "febrero 2027" / "February 2027"; si cruza de mes, "28 ene – 2 feb" + "2027". Las fechas son sin hora. */
export function rangoFechas(inicio: string, fin: string, idioma: Idioma = "es"): { dias: string; mesAnio: string } {
  const a = partes(inicio);
  const b = partes(fin);
  if (a.anio === b.anio && a.mes === b.mes) {
    return { dias: a.dia === b.dia ? String(a.dia) : `${a.dia}–${b.dia}`, mesAnio: `${MESES[idioma][a.mes]} ${a.anio}` };
  }
  const cortos = MESES_CORTOS[idioma];
  const dias = `${a.dia} ${cortos[a.mes]} – ${b.dia} ${cortos[b.mes]}`;
  return { dias, mesAnio: a.anio === b.anio ? String(a.anio) : `${a.anio}–${b.anio}` };
}

/** Tiempo que falta hasta el momento (ISO con desfase); "paso" si ya llegó. */
export function tiempoRestante(
  metaIso: string,
  ahora: Date | number,
): { dias: number; horas: number; minutos: number } | "paso" {
  const dif = new Date(metaIso).getTime() - (typeof ahora === "number" ? ahora : ahora.getTime());
  if (!Number.isFinite(dif) || dif <= 0) return "paso";
  return {
    dias: Math.floor(dif / 864e5),
    horas: Math.floor(dif / 36e5) % 24,
    minutos: Math.floor(dif / 6e4) % 60,
  };
}

/** "USD 290", "USD 250 c/u" / "USD 250 each" o "Precio sin dato" / "Price not available". La unidad viene del contenido. */
export function textoPrecio(tipo: Pick<TipoEntrada, "precio">, idioma: Idioma = "es"): string {
  const p = tipo.precio;
  if (!p || !(p.monto > 0)) return idioma === "en" ? "Price not available" : "Precio sin dato";
  const monto = new Intl.NumberFormat(idioma === "en" ? "en-US" : "es-AR").format(p.monto);
  return `${p.moneda} ${monto}${p.unidad ? ` ${p.unidad}` : ""}`;
}
