import { describe, expect, it } from "vitest";
import {
  CLAVE_IMPORTACION_RESUELTA,
  corresponderOfrecerImportacion,
  descartarImportacion,
  importarDatosPrevios,
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
