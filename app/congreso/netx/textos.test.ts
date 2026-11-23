import { describe, expect, it } from "vitest";
import { esNeutro } from "@/lib/congreso/idioma";
import { TEXTOS_REGISTRO } from "../registro-ticket.textos";
import { TEXTOS_NETX, todosLosTextos } from "./textos";

/** Todas las rutas hoja ("ticket.pasos.0.titulo") de un diccionario, con funciones evaluadas de ejemplo. */
function hojas(v: unknown, ruta = ""): Record<string, string> {
  if (typeof v === "string") return { [ruta]: v };
  if (typeof v === "function") return { [ruta]: (v as (...a: unknown[]) => string)(2, 5) };
  if (Array.isArray(v)) return Object.assign({}, ...v.map((x, i) => hojas(x, `${ruta}.${i}`)));
  if (v && typeof v === "object")
    return Object.assign({}, ...Object.entries(v).map(([k, x]) => hojas(x, ruta ? `${ruta}.${k}` : k)));
  return {};
}

describe.each([
  ["textos de NetX", TEXTOS_NETX],
  ["textos del registro del ticket", TEXTOS_REGISTRO],
] as const)("%s", (_nombre, dic) => {
  const es = hojas(dic.es);
  const en = hojas(dic.en);

  it("el inglés tiene exactamente las mismas claves que el español", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
  });

  it("ningún texto está vacío", () => {
    for (const v of [...Object.values(es), ...Object.values(en)]) expect(v.trim()).not.toBe("");
  });

  it("ningún texto en inglés es una copia del español, salvo neutros", () => {
    // Los `id` no son textos: son identificadores.
    const copias = Object.keys(es).filter((k) => !k.endsWith(".id") && es[k] === en[k] && !esNeutro(es[k]));
    expect(copias).toEqual([]);
  });
});

describe("todosLosTextos", () => {
  it("devuelve textos en los dos idiomas", () => {
    expect(todosLosTextos("es")).toContain("Prototipo interno · datos de ejemplo");
    expect(todosLosTextos("en")).toContain("Internal prototype · sample data");
  });
});
