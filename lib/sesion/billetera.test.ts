import { describe, expect, it } from "vitest";
import { abreviarDireccion } from "./billetera";

describe("abreviarDireccion", () => {
  it("deja los primeros 6 y los últimos 4 caracteres", () => {
    expect(abreviarDireccion("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234…5678");
  });
  it("no toca una dirección corta", () => {
    expect(abreviarDireccion("0xabc")).toBe("0xabc");
  });
});
