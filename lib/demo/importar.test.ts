import { describe, expect, it } from "vitest";
import {
  CLAVE_IMPORTACION_RESUELTA,
  copiarClavesAnteriores,
  corresponderOfrecerImportacion,
  descartarImportacion,
  importarDatosPrevios,
  limpiarPaso2,
  type Almacen,
} from "./importar";

function almacen(inicial: Record<string, string> = {}): Almacen & { datos: Map<string, string> } {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  };
}

describe("importación de los datos previos al login", () => {
  it("se ofrece si hay datos sin prefijo y la persona no tiene los suyos", () => {
    expect(corresponderOfrecerImportacion(almacen({ "lh-pactos": "{}" }), "A")).toBe(true);
  });

  it("no se ofrece sin datos previos", () => {
    expect(corresponderOfrecerImportacion(almacen(), "A")).toBe(false);
  });

  it("no se ofrece si la persona ya tiene datos propios", () => {
    expect(corresponderOfrecerImportacion(almacen({ "lh-pactos": "{}", "u:A:lh-kyc": "{}" }), "A")).toBe(false);
  });

  it("importar copia a la persona, quita los originales y no se vuelve a ofrecer", () => {
    const a = almacen({ "lh-pactos": "p", "lh-membresia": "m" });
    expect(importarDatosPrevios(a, "A")).toBe(2);
    expect(a.getItem("u:A:lh-pactos")).toBe("p");
    expect(a.getItem("u:A:lh-membresia")).toBe("m");
    expect(a.getItem("lh-pactos")).toBeNull();
    expect(a.getItem(CLAVE_IMPORTACION_RESUELTA)).toBe("1");
    expect(corresponderOfrecerImportacion(a, "B")).toBe(false);
  });

  it("descartar no toca los datos y no se vuelve a ofrecer", () => {
    const a = almacen({ "lh-pactos": "p" });
    descartarImportacion(a);
    expect(a.getItem("lh-pactos")).toBe("p");
    expect(corresponderOfrecerImportacion(a, "A")).toBe(false);
  });
});

function almacenConClaves(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial));
  return {
    datos,
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
    key: (i: number) => [...datos.keys()][i] ?? null,
    get length() {
      return datos.size;
    },
  };
}

describe("limpiarPaso2 (lotes-en-la-base)", () => {
  it("borra lh-lotes y lh-consultas-lotes, pelados y con el prefijo de cualquier persona", () => {
    const a = almacenConClaves({
      "lh-lotes": "x",
      "lh-consultas-lotes": "x",
      "u:persona-uno:lh-lotes": "x",
      "u:persona-dos:lh-consultas-lotes": "x",
      "u:did:privy:abc:lh-lotes": "x",
      "u:uuid-nuevo:lh-lotes": "x",
    });
    expect(limpiarPaso2(a)).toBe(6);
    expect(a.datos.size).toBe(0);
  });

  it("no toca los compromisos, otras claves lh-* ni claves que solo se parecen", () => {
    const a = almacenConClaves({
      "lighthouse.compromisos.v1": "c",
      "u:A:lighthouse.compromisos.v1": "c",
      "lh-pactos": "p",
      "u:A:lh-membresia": "m",
      "lh-lotes-otra-cosa": "x",
      "mi-lh-lotes": "x",
      "otro:lh-lotes": "x",
    });
    expect(limpiarPaso2(a)).toBe(0);
    expect(a.datos.size).toBe(7);
  });

  it("correrla dos veces no rompe nada", () => {
    const a = almacenConClaves({ "u:A:lh-lotes": "x", "u:A:lh-pactos": "p" });
    expect(limpiarPaso2(a)).toBe(1);
    expect(limpiarPaso2(a)).toBe(0);
    expect(a.getItem("u:A:lh-pactos")).toBe("p");
  });

  it("después de copiarClavesAnteriores, la copia no resucita la clave nueva", () => {
    const a = almacenConClaves({ "u:did:privy:viejo:lh-lotes": "x", "u:did:privy:viejo:lh-pactos": "p" });
    copiarClavesAnteriores(a, "uuid-nuevo", ["did:privy:viejo"]);
    expect(a.getItem("u:uuid-nuevo:lh-lotes")).toBe("x");
    limpiarPaso2(a);
    expect(a.getItem("u:uuid-nuevo:lh-lotes")).toBeNull();
    expect(a.getItem("u:did:privy:viejo:lh-lotes")).toBeNull();
    expect(a.getItem("u:uuid-nuevo:lh-pactos")).toBe("p");
  });
});
