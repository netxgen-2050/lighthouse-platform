import { describe, expect, it } from "vitest";
import { buscarTribu, listarTribus } from "./datos";

describe("datos de tribus", () => {
  const tribus = listarTribus();
  it("son 12", () => expect(tribus).toHaveLength(12));
  it("ids únicos", () => expect(new Set(tribus.map((t) => t.id)).size).toBe(12));
  it("barrios 1..12 sin repetir y en orden", () =>
    expect(tribus.map((t) => t.barrio)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
  it("ninguna vacante tiene declaración ni pozo", () => {
    const vacantes = tribus.filter((t) => t.estado === "vacante");
    expect(vacantes.length).toBeGreaterThan(0);
    for (const v of vacantes) {
      expect(v.declaracion).toBeUndefined();
      expect(v.pozo).toBeUndefined();
    }
  });
  it("buscarTribu", () => {
    expect(buscarTribu("valle")?.nombre).toBe("Valle Solar");
    expect(buscarTribu("no-existe")).toBeUndefined();
  });
});
