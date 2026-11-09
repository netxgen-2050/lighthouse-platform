import { describe, expect, it } from "vitest";
import { biencomun } from "./bien-comun";

describe("esperaAnios", () => {
  it("maneja el singular y el plural en español", () => {
    expect(biencomun.es.esperaAnios(1)).toBe("1 año");
    expect(biencomun.es.esperaAnios(2)).toBe("2 años");
  });

  it("maneja el singular y el plural en inglés", () => {
    expect(biencomun.en.esperaAnios(1)).toBe("1 year");
    expect(biencomun.en.esperaAnios(2)).toBe("2 years");
  });
});
