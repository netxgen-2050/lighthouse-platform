import { describe, expect, test } from "vitest";
import { formatearFecha, formatearNumero, LOCALES, sinDato } from "./formatos";

describe("formatearFecha", () => {
  test("español: 15 de octubre de 2026", () => {
    expect(formatearFecha("2026-10-15", "es")).toBe("15 de octubre de 2026");
  });
  test("inglés: October 15, 2026", () => {
    expect(formatearFecha("2026-10-15", "en")).toBe("October 15, 2026");
  });
  test("una fecha sin hora no corre un día por la zona horaria", () => {
    expect(formatearFecha("2026-01-01", "en")).toBe("January 1, 2026");
    expect(formatearFecha("2026-12-31", "es")).toBe("31 de diciembre de 2026");
  });
  test("una fecha inválida es sin dato", () => {
    expect(formatearFecha("no es fecha", "es")).toBe("sin dato");
    expect(formatearFecha("", "en")).toBe("no data");
  });
});

describe("formatearNumero", () => {
  test("punto de miles en español y coma en inglés", () => {
    expect(formatearNumero(1200, "es")).toBe("1.200");
    expect(formatearNumero(1200, "en")).toBe("1,200");
    expect(formatearNumero(2100000, "es")).toBe("2.100.000");
    expect(formatearNumero(2100000, "en")).toBe("2,100,000");
  });
  test("redondea y no agrupa los números chicos", () => {
    expect(formatearNumero(999.6, "es")).toBe("1.000");
    expect(formatearNumero(12, "en")).toBe("12");
  });
});

test("sin dato en los dos idiomas", () => {
  expect(sinDato("es")).toBe("sin dato");
  expect(sinDato("en")).toBe("no data");
});

test("los locales son es-AR y en-US", () => {
  expect(LOCALES).toEqual({ es: "es-AR", en: "en-US" });
});
