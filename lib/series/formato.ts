// Formato de números del simulador (es-AR escrito a mano: punto de miles, coma decimal). Lo que no se puede calcular
// (null, NaN, ±Infinity) se muestra "sin dato": el dato que falta no es cero, y tampoco "NaN".

export const SIN_DATO = "sin dato";

/** Número con miles y decimales fijos. No acepta null: usar los formatos de abajo. */
export function numero(n: number, decimales = 0): string {
  const fijo = Math.abs(n).toFixed(decimales);
  const [entera, decimal] = fijo.split(".");
  const miles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const signo = n < 0 && Number(fijo) !== 0 ? "-" : "";
  return signo + miles + (decimal ? `,${decimal}` : "");
}

function finito(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** "USD 1.290.250". */
export function usd(n: number | null | undefined): string {
  return finito(n) ? `USD ${numero(n)}` : SIN_DATO;
}

/** Una fracción como porcentaje con un decimal: 0.092 → "9,2 %". */
export function pct(fraccion: number | null | undefined): string {
  return finito(fraccion) ? `${numero(fraccion * 100, 1)} %` : SIN_DATO;
}

/** "2,66x". */
export function multiplo(n: number | null | undefined): string {
  return finito(n) ? `${numero(n, 2)}x` : SIN_DATO;
}
