import { esNeutro as esNeutroCongreso, NEUTROS as NEUTROS_CONGRESO } from "@/lib/congreso/idioma";

/** Valores que pueden ser iguales en español y en inglés: los del Congreso más nombres propios y marcas de la plataforma. */
export const NEUTROS: readonly string[] = [
  ...NEUTROS_CONGRESO,
  "Semillas",
  "Super admin",
  "Admin",
  "NetXGen",
  "Hifa",
  "Email",
  "Telegram",
  "WhatsApp",
  "Privy",
  "Soluna",
  "Macrolote 7",
  // Palabras que se escriben igual en los dos idiomas.
  "Compost",
  "Marketing",
  "Temazcal",
  "Valle Solar",
  "UnityHub",
  "Lighthouse",
  "NetX",
  "ES",
  "EN",
];

/** ¿Puede este valor ser igual en los dos idiomas? */
export function esNeutro(valor: string): boolean {
  return NEUTROS.includes(valor.trim()) || esNeutroCongreso(valor);
}
