import { describe, expect, it } from "vitest";
import { rangoFechas, textoPrecio, tiempoRestante } from "./formatos";

describe("rangoFechas", () => {
  it("5 al 9 de febrero", () => {
    expect(rangoFechas("2027-02-05", "2027-02-09")).toEqual({ dias: "5–9", mesAnio: "febrero 2027" });
  });
  it("en inglés", () => {
    expect(rangoFechas("2027-02-05", "2027-02-09", "en")).toEqual({ dias: "5–9", mesAnio: "February 2027" });
    expect(rangoFechas("2027-01-28", "2027-02-02", "en")).toEqual({ dias: "28 Jan – 2 Feb", mesAnio: "2027" });
  });
  it("cruza de mes", () => {
    expect(rangoFechas("2027-01-28", "2027-02-02")).toEqual({ dias: "28 ene – 2 feb", mesAnio: "2027" });
  });
});

describe("tiempoRestante", () => {
  const meta = "2027-02-06T12:00:00-03:00";
  it("10 d 3 h 5 min antes", () => {
    const ahora = new Date(meta).getTime() - ((10 * 24 + 3) * 60 + 5) * 60000;
    expect(tiempoRestante(meta, ahora)).toEqual({ dias: 10, horas: 3, minutos: 5 });
  });
  it("momento pasado", () => {
    expect(tiempoRestante(meta, new Date("2027-02-07T00:00:00Z"))).toBe("paso");
  });
});

describe("textoPrecio", () => {
  it("USD 290", () => {
    expect(textoPrecio({ precio: { monto: 290, moneda: "USD" } })).toBe("USD 290");
  });
  it("USD 250 c/u", () => {
    expect(textoPrecio({ precio: { monto: 250, moneda: "USD", unidad: "c/u" } })).toBe("USD 250 c/u");
  });
  it("sin precio", () => {
    expect(textoPrecio({})).toBe("Precio sin dato");
  });
  it("separador de miles es-AR", () => {
    expect(textoPrecio({ precio: { monto: 12500, moneda: "USD" } })).toBe("USD 12.500");
  });
  it("en inglés: separador en-US, unidad del contenido y sin precio", () => {
    expect(textoPrecio({ precio: { monto: 1200, moneda: "USD" } }, "en")).toBe("USD 1,200");
    expect(textoPrecio({ precio: { monto: 250, moneda: "USD", unidad: "each" } }, "en")).toBe("USD 250 each");
    expect(textoPrecio({}, "en")).toBe("Price not available");
  });
});
