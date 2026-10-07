import { describe, expect, it } from "vitest";
import { borrarDemo } from "./borrar";
import { CLAVES } from "./claves";

describe("borrarDemo", () => {
  it("quita una vez cada clave", () => {
    const quitadas: string[] = [];
    borrarDemo((c) => quitadas.push(c));
    expect(quitadas.sort()).toEqual(Object.values(CLAVES).sort());
  });
});
