import { describe, expect, it } from "vitest";
import type { Pedido } from "@/lib/contactos/tipos";
import type { Postulacion } from "@/lib/postulaciones/tipos";
import { contarPendientes } from "./pendientes";

const p = (n: number) => Array.from({ length: n }, () => ({}) as Postulacion);
const q = (n: number) => Array.from({ length: n }, () => ({}) as Pedido);

describe("contarPendientes", () => {
  it("si el navegador no deja leer, sin dato (null), no 0", () => {
    expect(contarPendientes(null, [])).toBeNull();
  });
  it("sin nada guardado, 0", () => {
    expect(contarPendientes([], [])).toBe(0);
  });
  it("suma postulaciones y pedidos", () => {
    expect(contarPendientes(p(2), q(1))).toBe(3);
  });
});
