import { describe, expect, it } from "vitest";
import { tribusConTicket } from "./tribus-con-ticket";

describe("tribusConTicket", () => {
  const lista = tribusConTicket();

  it("trae tres tribus del catálogo", () => {
    expect(lista.map((t) => t.tribu.id)).toEqual(["valle", "agua", "taller"]);
  });

  it("nunca hay más con ticket que el total, y el total no es 0", () => {
    for (const t of lista) {
      expect(t.conTicket).toBeLessThanOrEqual(t.total);
      expect(t.total).toBeGreaterThan(0);
    }
  });

  it("el total es el de roles cubiertos de la tribu", () => {
    for (const t of lista) expect(t.total).toBe(t.tribu.roles.cubiertos);
  });

  it("está marcada como ejemplo", () => {
    expect(lista.every((t) => t.esEjemplo)).toBe(true);
  });
});
