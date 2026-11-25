import { describe, expect, it } from "vitest";
import { crearOrdenDePedidos } from "./ultimo-pedido";

describe("crearOrdenDePedidos", () => {
  it("solo el pedido más reciente es el último", () => {
    const orden = crearOrdenDePedidos();
    const a = orden.nuevo();
    const b = orden.nuevo();
    expect(orden.esElUltimo(a)).toBe(false);
    expect(orden.esElUltimo(b)).toBe(true);
  });

  it("un pedido nuevo (por ejemplo una escritura) deja viejos a los anteriores", () => {
    const orden = crearOrdenDePedidos();
    const lectura = orden.nuevo();
    orden.nuevo();
    expect(orden.esElUltimo(lectura)).toBe(false);
  });
});
