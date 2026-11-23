// El mes ("AAAA-MM") de una fecha ISO, en la hora de Argentina. Nunca `slice(0, 7)`: el 30-nov a las 22 h de Argentina ya es
// diciembre en UTC y el período quedaría mal puesto. Lo reusa `pactos-horas-variables`.

const MES = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "America/Argentina/Buenos_Aires" });

/** "AAAA-MM" de `ahora` (ISO) en la hora de Argentina; "" si la fecha no es válida. */
export function mesDe(ahora: string): string {
  const t = Date.parse(ahora);
  if (Number.isNaN(t)) return "";
  const partes = MES.formatToParts(new Date(t));
  const anio = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  return anio && mes ? `${anio}-${mes}` : "";
}

/** ¿Es un mes con la forma "AAAA-MM" (mes de 01 a 12)? */
export function mesValido(x: unknown): x is string {
  return typeof x === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(x);
}
