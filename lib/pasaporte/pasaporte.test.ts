import { describe, expect, it } from "vitest";
import { leerDatos } from "./datos";

describe("leerDatos", () => {
  it("vacío o roto vuelve a vacío", () => {
    expect(leerDatos(null)).toEqual({});
    expect(leerDatos("no es json")).toEqual({});
  });
  it("descarta valores raros campo por campo", () => {
    const d = leerDatos(JSON.stringify({ nacionalidad: "marte", residencia: "exterior", horas: -3, origenFondos: "  " }));
    expect(d.nacionalidad).toBeUndefined();
    expect(d.residencia).toBe("exterior");
    expect(d.horas).toBeUndefined();
    expect(d.origenFondos).toBeUndefined();
  });
});
