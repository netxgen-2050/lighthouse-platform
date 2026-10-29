import { describe, expect, it } from "vitest";
import { borrarDemo } from "./borrar";
import { CLAVES, establecerPersona } from "./claves";

describe("borrarDemo", () => {
  it("quita una vez cada clave", () => {
    const quitadas: string[] = [];
    const fallidas = borrarDemo((c) => quitadas.push(c));
    expect(quitadas.sort()).toEqual(Object.values(CLAVES).sort());
    expect(fallidas).toEqual([]);
  });

  it("quita también lh-equipos, con el prefijo de la persona", () => {
    establecerPersona("A");
    const quitadas: string[] = [];
    borrarDemo((c) => quitadas.push(c));
    establecerPersona(null);
    expect(quitadas).toContain("u:A:lh-equipos");
  });

  it("sigue con las demás claves si una falla y devuelve la fallida", () => {
    const todas = Object.values(CLAVES);
    const quitadas: string[] = [];
    const fallidas = borrarDemo((c) => {
      if (c === todas[0]) throw new Error("no se puede");
      quitadas.push(c);
    });
    expect(fallidas).toEqual([todas[0]]);
    expect(quitadas.sort()).toEqual(todas.slice(1).sort());
  });
});
