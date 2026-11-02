import { describe, expect, test } from "vitest";
import { fogon, nombreDelLugar } from "./fogon";

test("el nombre del lugar junta círculo y tribu, y sin tribu es solo el círculo", () => {
  expect(nombreDelLugar("Economía", "Valle Solar")).toBe("Economía · Valle Solar");
  expect(nombreDelLugar("Economía", null)).toBe("Economía");
});

describe.each([
  ["es", fogon.es, "en "],
  ["en", fogon.en, "in "],
] as const)("lugar de una propuesta (%s)", (_idioma, t, prefijo) => {
  test("el prefijo viene del diccionario", () => {
    expect(t.enPrefijo).toBe(prefijo);
  });

  test("la frase completa es el prefijo más el nombre", () => {
    expect(t.enCirculo("Economía", "Valle Solar")).toBe(`${t.enPrefijo}${nombreDelLugar("Economía", "Valle Solar")}`);
    expect(t.enCirculo("Economía", null)).toBe(`${t.enPrefijo}Economía`);
  });
});
