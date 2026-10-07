import { describe, expect, it } from "vitest";
import { borrarDemo } from "../demo/borrar";
import { CLAVES } from "../demo/claves";
import { agregar, crearPedido, leerBandeja, MOTIVOS, validar } from "./pedidos";
import type { Borrador, Pedido } from "./tipos";

const base: Borrador = {
  motivo: "consulta-lote",
  referencia: "Finca 502",
  canal: "whatsapp",
  momento: "",
  mensaje: "",
  estadoMostrado: "Loteo en trámite · Ord. 173/2026",
};

describe("validar", () => {
  it("el canal es obligatorio", () => {
    expect(validar({ canal: "", mensaje: "" }).canal).toBe("Elegí cómo preferís que te contactemos");
  });
  it("acepta un mensaje de 500 y rechaza uno de 501 caracteres", () => {
    expect(validar({ canal: "email", mensaje: "a".repeat(500) })).toEqual({});
    expect(validar({ canal: "email", mensaje: "a".repeat(501) }).mensaje).toBe(
      "El mensaje puede tener hasta 500 caracteres",
    );
  });
});

describe("crearPedido", () => {
  const ahora = new Date("2026-10-07T12:00:00Z");
  it("el destino sale del motivo", () => {
    expect(crearPedido(base, ahora, "a").destino).toBe("BioPueblo, vía NetX como agencia");
    expect(crearPedido({ ...base, motivo: "invitacion-circulo" }, ahora, "b").destino).toBe("Equipo NetX");
    expect(crearPedido({ ...base, motivo: "charla-netx" }, ahora, "c").destino).toBe("Equipo NetX");
  });
  it("lo opcional que falta no se guarda", () => {
    const p = crearPedido({ ...base, estadoMostrado: undefined }, ahora, "a");
    expect(p).not.toHaveProperty("momento");
    expect(p).not.toHaveProperty("mensaje");
    expect(p).not.toHaveProperty("estadoMostrado");
    expect(p.fecha).toBe("2026-10-07T12:00:00.000Z");
  });
  it("guarda momento, mensaje y estado mostrado", () => {
    const p = crearPedido({ ...base, momento: "tarde", mensaje: " hola " }, ahora, "a");
    expect(p.momento).toBe("tarde");
    expect(p.mensaje).toBe("hola");
    expect(p.estadoMostrado).toBe("Loteo en trámite · Ord. 173/2026");
  });
  it("tiene etiqueta para cada motivo", () => {
    expect(MOTIVOS["consulta-lote"].etiqueta).toBe("Consulta por un lote");
  });
});

describe("leerBandeja", () => {
  it("JSON inválido o que no es lista devuelve vacío", () => {
    expect(leerBandeja(null)).toEqual([]);
    expect(leerBandeja("{no es json")).toEqual([]);
    expect(leerBandeja('{"a":1}')).toEqual([]);
  });
  it("descarta los elementos inválidos", () => {
    const ok = crearPedido(base, new Date(), "a");
    expect(leerBandeja(JSON.stringify([ok, { id: 1 }, null]))).toEqual([ok]);
  });
  it("descarta pedidos con mensaje, estado o momento de tipo raro", () => {
    const ok = crearPedido(base, new Date(), "a");
    const raros = [
      { ...ok, id: "b", mensaje: {} },
      { ...ok, id: "c", estadoMostrado: 5 },
      { ...ok, id: "d", momento: "madrugada" },
    ];
    expect(leerBandeja(JSON.stringify([ok, ...raros]))).toEqual([ok]);
  });
  it("no acepta claves heredadas como motivo o canal", () => {
    const ok = crearPedido(base, new Date(), "a");
    const raros = [
      { ...ok, id: "b", motivo: "toString" },
      { ...ok, id: "c", canal: "constructor" },
    ];
    expect(leerBandeja(JSON.stringify(raros))).toEqual([]);
  });
});

describe("agregar", () => {
  it("deja el más nuevo primero", () => {
    const a: Pedido = crearPedido(base, new Date(), "a");
    const b: Pedido = crearPedido(base, new Date(), "b");
    expect(agregar([a], b).map((p) => p.id)).toEqual(["b", "a"]);
  });
});

describe("borrarDemo", () => {
  it("quita lh-contactos", () => {
    const quitadas: string[] = [];
    borrarDemo((c) => quitadas.push(c));
    expect(quitadas).toContain(CLAVES.contactos);
    expect(CLAVES.contactos).toBe("lh-contactos");
  });
});
