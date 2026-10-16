// Textos fijos de las piezas portables del evento (los que no vienen del contenido), en español (voseo) y en inglés.
// TypeScript obliga a que el inglés tenga todas las claves del español. Módulo puro, sin dependencias de NetX.
import type { Idioma } from "./idioma";

const ES = {
  seccionesDelEvento: "Secciones del evento",
  entradas: "Entradas",
  cuentaEtiqueta: "Cuenta regresiva al eclipse",
  cuentaCalculando: "Calculando la cuenta regresiva",
  dias: "días",
  horas: "horas",
  minutos: "min",
  llegoElDia: "Llegó el día",
  destacado: "Destacado: ",
  ejemplo: "ejemplo",
  desde: "Desde",
  precioSinDato: "Precio sin dato",
  reservarMiLugar: "Reservar mi lugar",
  llegarConMiTribu: "Llegar con mi tribu",
  sinDato: "sin dato",
  quieroIr: "Quiero ir",
  verElRecorrido: "Ver el recorrido",
  diaDelEclipse: "Día del eclipse",
  confirmada: "Confirmada",
  porConfirmar: "Por confirmar",
};

type Textos = { [K in keyof typeof ES]: string };

const EN: Textos = {
  seccionesDelEvento: "Event sections",
  entradas: "Tickets",
  cuentaEtiqueta: "Countdown to the eclipse",
  cuentaCalculando: "Calculating the countdown",
  dias: "days",
  horas: "hours",
  minutos: "min",
  llegoElDia: "The day has come",
  destacado: "Featured: ",
  ejemplo: "sample",
  desde: "From",
  precioSinDato: "Price not available",
  reservarMiLugar: "Reserve my spot",
  llegarConMiTribu: "Arrive with my tribe",
  sinDato: "no data",
  quieroIr: "I want to go",
  verElRecorrido: "See the itinerary",
  diaDelEclipse: "Eclipse day",
  confirmada: "Confirmed",
  porConfirmar: "To be confirmed",
};

export type TextosEvento = Textos;

export function textosEvento(idioma: Idioma = "es"): TextosEvento {
  return idioma === "en" ? EN : ES;
}

/** Los dos diccionarios, para los tests de completitud. */
export const DICCIONARIOS_EVENTO: Record<Idioma, TextosEvento> = { es: ES, en: EN };
