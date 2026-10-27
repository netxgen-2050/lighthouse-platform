import { describe, expect, test } from "vitest";
import { convertirSafu } from "./safu";

describe("convertirSafu", () => {
  test("USD 1.000 con 20 % dan 1.250", () => {
    expect(convertirSafu(1000, 0.2)).toBeCloseTo(1250, 2);
  });
  test("con 25 % da 1.333,33", () => {
    expect(convertirSafu(1000, 0.25)).toBeCloseTo(1333.33, 2);
  });
  test("con 0 % no cambia el monto", () => {
    expect(convertirSafu(1000, 0)).toBe(1000);
  });
  test("un descuento imposible da null", () => {
    expect(convertirSafu(1000, 1)).toBeNull();
    expect(convertirSafu(1000, -0.05)).toBeNull();
  });
  test("un número que no es finito da null", () => {
    expect(convertirSafu(1000, Number.NaN)).toBeNull();
    expect(convertirSafu(Number.NaN, 0.2)).toBeNull();
    expect(convertirSafu(Number.POSITIVE_INFINITY, 0.2)).toBeNull();
  });
});
