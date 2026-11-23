import { describe, expect, it } from "vitest";
import { leerNumero } from "./calculadora-barrio";

describe("leerNumero", () => {
  it("en español acepta miles con punto y decimales con coma", () => {
    expect(leerNumero("27.500,50", "es")).toBe(27500.5);
    expect(leerNumero("27.500", "es")).toBe(27500);
    expect(leerNumero("12,5", "es")).toBe(12.5);
    expect(leerNumero("12.5", "es")).toBe(12.5);
  });

  it("en inglés acepta miles con coma y decimales con punto", () => {
    expect(leerNumero("27,500.50", "en")).toBe(27500.5);
    expect(leerNumero("27,500", "en")).toBe(27500);
    expect(leerNumero("12.5", "en")).toBe(12.5);
  });

  it("lo que no es un número es NaN", () => {
    expect(leerNumero("", "es")).toBeNaN();
    expect(leerNumero("abc", "es")).toBeNaN();
    expect(leerNumero("1.2.3", "es")).toBeNaN();
  });
});
