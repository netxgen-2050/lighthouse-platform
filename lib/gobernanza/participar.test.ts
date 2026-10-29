import { describe, expect, it } from "vitest";
import { puedeParticiparEnGobernanza } from "./participar";

describe("puedeParticiparEnGobernanza", () => {
  it("sin adhesión al Lighthouse no puede", () => {
    expect(puedeParticiparEnGobernanza({})).toBe(false);
    expect(puedeParticiparEnGobernanza({ valle: "miembro" })).toBe(false);
  });
  it("con pedido o membresía en el Lighthouse puede", () => {
    expect(puedeParticiparEnGobernanza({ lighthouse: "pedido" })).toBe(true);
    expect(puedeParticiparEnGobernanza({ lighthouse: "miembro" })).toBe(true);
  });
});
