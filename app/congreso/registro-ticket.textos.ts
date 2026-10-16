// Textos fijos de RegistroTicket, en español (voseo) y en inglés. El español es el de siempre.
import type { Idioma } from "@/lib/congreso/idioma";

const ES = {
  titulo: "Tu ticket",
  demo: "Modo demostración: el registro queda solo en este navegador.",
  falloAlmacen:
    "Error: tu navegador no permite guardar datos en este sitio, así que el ticket no se puede registrar ni quitar acá. Revisá la configuración de privacidad o probá en otro navegador.",
  registrado: (codigo: string) => `Ticket ${codigo} registrado`,
  genesisPendiente: "Genesis pendiente",
  genesisPendienteResto: ": se confirma cuando el anfitrión escanea tu ticket en el territorio",
  quitar: "Quitar ticket",
  etiqueta: "Código de tu ticket (te llega por mail al comprarlo)",
  placeholder: "Ej.: LH27-8F3K-2Q",
  registrar: "Registrar",
  errorFormato: "Error: el código no tiene el formato LH27-XXXX-XX (letras y números).",
  nota: "¿Todavía no tenés ticket? Lo vende el organizador del Congreso.",
};

export type TextosRegistro = { [K in keyof typeof ES]: (typeof ES)[K] extends string ? string : (typeof ES)[K] };

const EN: TextosRegistro = {
  titulo: "Your ticket",
  demo: "Demo mode: the registration stays only in this browser.",
  falloAlmacen:
    "Error: your browser does not allow saving data on this site, so the ticket cannot be registered or removed here. Check your privacy settings or try another browser.",
  registrado: (codigo: string) => `Ticket ${codigo} registered`,
  genesisPendiente: "Genesis pending",
  genesisPendienteResto: ": confirmed when the host scans your ticket at the territory",
  quitar: "Remove ticket",
  etiqueta: "Your ticket code (it arrives by email when you buy it)",
  placeholder: "E.g.: LH27-8F3K-2Q",
  registrar: "Register",
  errorFormato: "Error: the code does not match the format LH27-XXXX-XX (letters and numbers).",
  nota: "Don't have a ticket yet? The Congress organizer sells it.",
};

export const TEXTOS_REGISTRO: Record<Idioma, TextosRegistro> = { es: ES, en: EN };
