import { describe, expect, it } from "vitest";
import { CLAVES } from "./claves";

describe("CLAVES", () => {
  it("conserva los valores que ya están guardados en los navegadores", () => {
    expect(CLAVES.perfil).toBe("lh-perfil-entrevista");
    expect(CLAVES.compromisos).toBe("lighthouse.compromisos.v1");
    expect(CLAVES.congreso).toBe("lh-congreso-ticket");
    expect(CLAVES.sumarte).toBe("lh-sumarte");
  });
});
