import { describe, expect, test } from "vitest";
import { multiplo, numero, pct, usd } from "./formato";

describe("formato", () => {
  test("montos con USD y punto de miles", () => {
    expect(usd(1290250)).toBe("USD 1.290.250");
    expect(usd(2663)).toBe("USD 2.663");
    expect(usd(0)).toBe("USD 0");
    expect(usd(-1500)).toBe("USD -1.500");
  });
  test("porcentajes con un decimal y coma", () => {
    expect(pct(0.092)).toBe("9,2 %");
    expect(pct(9)).toBe("900,0 %");
    expect(pct(0)).toBe("0,0 %");
  });
  test("múltiplo con dos decimales", () => {
    expect(multiplo(2.663)).toBe("2,66x");
  });
  test("lo que no se puede calcular dice sin dato, nunca NaN ni ∞", () => {
    for (const f of [usd, pct, multiplo]) {
      expect(f(null)).toBe("sin dato");
      expect(f(Number.NaN)).toBe("sin dato");
      expect(f(Number.POSITIVE_INFINITY)).toBe("sin dato");
      expect(f(Number.NEGATIVE_INFINITY)).toBe("sin dato");
      expect(f(undefined)).toBe("sin dato");
    }
  });
  test("numero agrupa miles y no muestra -0", () => {
    expect(numero(1234567.891, 2)).toBe("1.234.567,89");
    expect(numero(-0.001, 1)).toBe("0,0");
  });
});
