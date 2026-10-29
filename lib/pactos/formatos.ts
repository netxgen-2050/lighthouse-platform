// Formatos de pacto que acepta cada comunidad (openspec/changes/pacto-puntual, design §1). Datos de EJEMPLO que Gus aprobó
// el 28-oct. Son de la comunidad, no un dato descriptivo de la tribu. `pactos-horas-variables` suma "variable" y el
// compromiso mínimo de cada comunidad.
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { COMPROMISO_MINIMO } from "./datos";

export type FormatoPacto = "fijo" | "puntual" | "variable";

const SOLO_FIJO: readonly FormatoPacto[] = ["fijo"];
const FIJO_Y_VARIABLE: readonly FormatoPacto[] = ["fijo", "variable"];
const FIJO_PUNTUAL_Y_VARIABLE: readonly FormatoPacto[] = ["fijo", "puntual", "variable"];
const FIJO_Y_PUNTUAL: readonly FormatoPacto[] = ["fijo", "puntual"];

const FORMATOS: Readonly<Record<string, readonly FormatoPacto[]>> = {
  semilla: FIJO_PUNTUAL_Y_VARIABLE,
  // Monte Nuevo y Barda Productiva solo toman horas fijas (Barda tampoco toma puntuales).
  monte: FIJO_Y_PUNTUAL,
  agua: FIJO_PUNTUAL_Y_VARIABLE,
  valle: FIJO_PUNTUAL_Y_VARIABLE,
  taller: FIJO_PUNTUAL_Y_VARIABLE,
  avelan: FIJO_PUNTUAL_Y_VARIABLE,
  puerto: FIJO_PUNTUAL_Y_VARIABLE,
  barda: SOLO_FIJO,
  [COMUNIDAD_LIGHTHOUSE]: FIJO_Y_VARIABLE,
};

/** Los formatos de una comunidad. Sin dato (o un id raro como `__proto__`) es "solo fijo". */
export function formatosDe(comunidad: string): readonly FormatoPacto[] {
  return Object.hasOwn(FORMATOS, comunidad) ? FORMATOS[comunidad] : SOLO_FIJO;
}

export function aceptaFormato(comunidad: string, formato: FormatoPacto): boolean {
  return formatosDe(comunidad).includes(formato);
}

export type CompromisoMeses = 1 | 2 | 3;

// Datos de EJEMPLO: todas 3 salvo Agua Clara (2) y Taller Común (1), para mostrar el rango. Lo acuerdan quienes administran
// cada holón (decisión de Gus, 28-oct); en el prototipo es un dato del código.
const COMPROMISO: Readonly<Record<string, CompromisoMeses>> = { agua: 2, taller: 1 };

/** El compromiso mínimo (en meses) de una comunidad. Sin dato, 3. */
export function compromisoMinimoDe(comunidad: string): CompromisoMeses {
  return Object.hasOwn(COMPROMISO, comunidad) ? COMPROMISO[comunidad] : COMPROMISO_MINIMO.porDefecto;
}

/** ¿Es 1, 2 o 3? */
export function esCompromisoValido(x: unknown): x is CompromisoMeses {
  return x === 1 || x === 2 || x === 3;
}
