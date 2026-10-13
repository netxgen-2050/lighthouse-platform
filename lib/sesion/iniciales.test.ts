import { describe, expect, it } from "vitest";
import { inicialesDeEmail } from "./iniciales";

describe("inicialesDeEmail", () => {
  it("toma hasta dos palabras de la parte local", () => {
    expect(inicialesDeEmail("ana.perez@x.com")).toBe("AP");
    expect(inicialesDeEmail("super@prueba.test")).toBe("S");
    expect(inicialesDeEmail("a-b-c@x.com")).toBe("AB");
  });
  it("ignora lo que no empieza con letra", () => {
    expect(inicialesDeEmail("123@x.com")).toBe("");
  });
  it("sin email, vacío", () => {
    expect(inicialesDeEmail(null)).toBe("");
    expect(inicialesDeEmail("")).toBe("");
  });
});
