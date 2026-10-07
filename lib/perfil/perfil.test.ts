import { describe, expect, it } from "vitest";
import { CHATS } from "./preguntas";
import { propuestaDePerfil } from "./propuesta";
import { ESTADO_INICIAL, cantidadConfirmados, estaCompleta, leerGuardado, reducir } from "./estado";

describe("preguntas", () => {
  it("son las 6 del mock-up, en orden", () => {
    expect(CHATS.map((c) => c.etiqueta)).toEqual([
      "Qué te trae", "Bioregión", "Cómo decidir", "Lo que aportás", "Tiempo", "No negociables",
    ]);
    expect(CHATS[0].texto).toBe("¿Qué te trae a BioPueblo?");
  });
});

describe("propuestaDePerfil", () => {
  it("deja igual un texto corto", () => {
    expect(propuestaDePerfil(CHATS[0], "  Vivir en comunidad ")).toBe("Vivir en comunidad");
  });
  it("recorta a 80 sin cortar palabras", () => {
    const largo = "palabra ".repeat(30);
    const r = propuestaDePerfil(CHATS[0], largo);
    expect(r.length).toBeLessThanOrEqual(80);
    expect(r.endsWith("…")).toBe(true);
    expect(r.slice(0, -1).split(" ").every((p) => p === "palabra")).toBe(true);
  });
  it("corta duro si no hay espacios", () => {
    const r = propuestaDePerfil(CHATS[0], "a".repeat(200));
    expect(r.length).toBe(80);
  });
  it("texto de exactamente 80 no se recorta", () => {
    expect(propuestaDePerfil(CHATS[0], "a".repeat(80))).toBe("a".repeat(80));
  });
});

describe("estado", () => {
  it("responder agrega y propone sin confirmar", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "responder", texto: " hola " });
    expect(e.items).toEqual([{ respuesta: "hola", propuesta: "hola", confirmado: null }]);
    expect(cantidadConfirmados(e)).toBe(0);
  });
  it("ignora respuestas vacías y no pasa de 6", () => {
    expect(reducir(ESTADO_INICIAL, { tipo: "responder", texto: "   " })).toBe(ESTADO_INICIAL);
    let e = ESTADO_INICIAL;
    for (let i = 0; i < 8; i++) e = reducir(e, { tipo: "responder", texto: "x" });
    expect(e.items).toHaveLength(6);
    expect(estaCompleta(e)).toBe(true);
  });
  it("confirmar marca el dato", () => {
    let e = reducir(ESTADO_INICIAL, { tipo: "responder", texto: "hola" });
    e = reducir(e, { tipo: "confirmar", indice: 0 });
    expect(e.items[0].confirmado).toBe("hola");
    expect(cantidadConfirmados(e)).toBe(1);
  });
  it("corregir confirma el texto nuevo; vacío o índice inválido no cambian", () => {
    let e = reducir(ESTADO_INICIAL, { tipo: "responder", texto: "hola" });
    e = reducir(e, { tipo: "corregir", indice: 0, texto: " chau " });
    expect(e.items[0].confirmado).toBe("chau");
    expect(reducir(e, { tipo: "corregir", indice: 0, texto: " " })).toBe(e);
    expect(reducir(e, { tipo: "confirmar", indice: 5 })).toBe(e);
  });
  it("borrar vuelve al inicio", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "responder", texto: "hola" });
    expect(reducir(e, { tipo: "borrar" })).toEqual(ESTADO_INICIAL);
  });
  it("leerGuardado tolera basura", () => {
    expect(leerGuardado(null)).toEqual(ESTADO_INICIAL);
    expect(leerGuardado("no es json")).toEqual(ESTADO_INICIAL);
    expect(leerGuardado('{"items":[{"respuesta":1}]}')).toEqual(ESTADO_INICIAL);
    const e = reducir(ESTADO_INICIAL, { tipo: "responder", texto: "hola" });
    expect(leerGuardado(JSON.stringify(e))).toEqual(e);
  });
});
