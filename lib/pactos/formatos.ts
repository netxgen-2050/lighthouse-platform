// Formatos de pacto que acepta cada comunidad (openspec/changes/pacto-puntual, design §1). Datos de EJEMPLO que Gus aprobó
// el 28-oct. Son de la comunidad, no un dato descriptivo de la tribu. `pactos-horas-variables` suma "variable".
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";

export type FormatoPacto = "fijo" | "puntual";

const SOLO_FIJO: readonly FormatoPacto[] = ["fijo"];
const FIJO_Y_PUNTUAL: readonly FormatoPacto[] = ["fijo", "puntual"];

const FORMATOS: Readonly<Record<string, readonly FormatoPacto[]>> = {
  semilla: FIJO_Y_PUNTUAL,
  monte: FIJO_Y_PUNTUAL,
  agua: FIJO_Y_PUNTUAL,
  valle: FIJO_Y_PUNTUAL,
  taller: FIJO_Y_PUNTUAL,
  avelan: FIJO_Y_PUNTUAL,
  puerto: FIJO_Y_PUNTUAL,
  // Para mostrar el caso de una tribu que no toma puntuales.
  barda: SOLO_FIJO,
  [COMUNIDAD_LIGHTHOUSE]: SOLO_FIJO,
};

/** Los formatos de una comunidad. Sin dato (o un id raro como `__proto__`) es "solo fijo". */
export function formatosDe(comunidad: string): readonly FormatoPacto[] {
  return Object.hasOwn(FORMATOS, comunidad) ? FORMATOS[comunidad] : SOLO_FIJO;
}

export function aceptaFormato(comunidad: string, formato: FormatoPacto): boolean {
  return formatosDe(comunidad).includes(formato);
}
