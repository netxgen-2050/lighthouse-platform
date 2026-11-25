/** Fecha y hora en palabras, en la zona del navegador ("15 de octubre de 2026, 21:05"). Un valor que no es fecha sale como "sin dato". */
export function fechaYHora(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "sin dato";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(new Date(t));
}
