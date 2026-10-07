import { describe, expect, it } from "vitest";
import { esCodigoValido, normalizarCodigo } from "./ticket";

describe("ticket", () => {
  it("acepta códigos válidos", () => {
    expect(esCodigoValido("LH27-8F3K-2Q")).toBe(true);
    expect(esCodigoValido("LH27-0000-ZZ")).toBe(true);
  });
  it("acepta minúsculas y espacios alrededor", () => {
    expect(esCodigoValido("lh27-8f3k-2q")).toBe(true);
    expect(normalizarCodigo("  lh27-8f3k-2q ")).toBe("LH27-8F3K-2Q");
  });
  it("rechaza inválidos", () => {
    const malos = ["", "1234", "LH27-8F3K", "LH27-8F3K-2", "LH27-8F3K-2QX", "LH26-8F3K-2Q", "LH27-8F_K-2Q", "LH27 8F3K 2Q"];
    for (const c of malos) {
      expect(esCodigoValido(c), c).toBe(false);
    }
  });
});
