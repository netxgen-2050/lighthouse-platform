import { describe, expect, test } from "vitest";
import { RETORNO_SERIE_MADRE, caminoDelVino, recorridoVino, valorFuturo } from "./recorridos";

// Referencia: NS_Tokenomics/RESULTS_series_waterfall.md, "Journey" (v0.1, 2026-10-17).
const cerca = (a: number | null, b: number, tol = 1) => {
  expect(a).not.toBeNull();
  expect(Math.abs((a as number) - b)).toBeLessThanOrEqual(tol);
};

describe("valorFuturo", () => {
  test("USD 10.000 a 10 años", () => {
    const [a, b, c] = RETORNO_SERIE_MADRE.valores.map((r) => valorFuturo(10000, r, 10));
    cerca(a, 13439);
    cerca(b, 17908);
    cerca(c, 23674);
  });
  test("USD 30.000 a 10 años", () => {
    const [a, b, c] = RETORNO_SERIE_MADRE.valores.map((r) => valorFuturo(30000, r, 10));
    cerca(a, 40317);
    cerca(b, 53725);
    cerca(c, 71021);
  });
  test("sin dato cuando falta algo o el retorno es −100 % o menos", () => {
    expect(valorFuturo(null, 0.06, 10)).toBeNull();
    expect(valorFuturo(10000, null, 10)).toBeNull();
    expect(valorFuturo(10000, 0.06, null)).toBeNull();
    expect(valorFuturo(10000, NaN, 10)).toBeNull();
    expect(valorFuturo(10000, -1, 10)).toBeNull();
    expect(valorFuturo(10000, -2, 10)).toBeNull();
  });
  test("la Serie Madre tiene fuente y quién confirma", () => {
    expect(RETORNO_SERIE_MADRE.fuente).toContain("doc 28");
    expect(RETORNO_SERIE_MADRE.aConfirmar).toBe("Vagner");
  });
});

describe("camino del vino", () => {
  const v = recorridoVino();
  test("con la partida: unas 302 botellas y USD 850 el año 15", () => {
    expect(v?.camino).not.toBeNull();
    expect(Math.round(v!.camino!.botellas)).toBe(302);
    cerca(v!.camino!.plataUltimoAnio, 850);
    expect(v!.camino!.anioUltimo).toBe(15);
  });
  test("el recorrido B: USD 2.663 y 9,2 %", () => {
    cerca(v!.total, 2663);
    expect(Math.abs(v!.tir! - 0.092)).toBeLessThanOrEqual(0.0005);
  });
  test("precio 0, negativo o inválido → null", () => {
    expect(caminoDelVino(v!.flujos, 0)).toBeNull();
    expect(caminoDelVino(v!.flujos, -3)).toBeNull();
    expect(caminoDelVino(v!.flujos, NaN)).toBeNull();
    expect(caminoDelVino(v!.flujos, null)).toBeNull();
  });
  test("flujos incompletos → null", () => {
    expect(caminoDelVino(null, 6)).toBeNull();
    expect(caminoDelVino([-1000, 5], 6)).toBeNull();
  });
});
