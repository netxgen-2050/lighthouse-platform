// Recorre un diccionario y devuelve todos sus textos con su ruta (lo usan los tests y la lista de revisión nativa).
export type Hoja = { ruta: string; valor: string };

/** Todos los textos de un diccionario. Las funciones se llaman con valores de prueba. */
export function hojas(v: unknown, ruta = ""): Hoja[] {
  if (typeof v === "string") return [{ ruta, valor: v }];
  if (typeof v === "function") {
    const texto = (v as (...a: unknown[]) => unknown)(3, 3, 3);
    return typeof texto === "string" ? [{ ruta: `${ruta}()`, valor: texto }] : [];
  }
  if (Array.isArray(v)) return v.flatMap((x, i) => hojas(x, `${ruta}.${i}`));
  if (v && typeof v === "object") {
    return Object.entries(v).flatMap(([k, x]) => hojas(x, ruta ? `${ruta}.${k}` : k));
  }
  return [];
}
