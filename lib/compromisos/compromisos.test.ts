import { describe, expect, test } from "vitest";
import { cargar, reducir } from "./estado";
import { describirCompromiso } from "./formato";
import type { Borrador, Compromiso } from "./tipos";
import { validarCompromiso } from "./validar";

const base: Borrador = {
  tipo: "ofrezco",
  clase: "tiempo",
  descripcion: "Taller de compost",
  horas: "8",
  bienes: "",
  para: "semilla",
};

function errores(b: Borrador) {
  const r = validarCompromiso(b, "x");
  return r.ok ? null : r.errores;
}

describe("validar", () => {
  test("borrador válido", () => {
    const r = validarCompromiso(base, "id1", new Date("2026-10-07T00:00:00Z"));
    expect(r).toEqual({
      ok: true,
      compromiso: {
        id: "id1",
        tipo: "ofrezco",
        clase: "tiempo",
        descripcion: "Taller de compost",
        horasPorMes: 8,
        para: "semilla",
        creado: "2026-10-07T00:00:00.000Z",
      },
    });
  });
  test("descripción vacía o solo espacios", () => {
    expect(errores({ ...base, descripcion: "" })?.descripcion).toBeTruthy();
    expect(errores({ ...base, descripcion: "   " })?.descripcion).toBeTruthy();
  });
  test("descripción de 140 sí y de 141 no", () => {
    expect(errores({ ...base, descripcion: "a".repeat(140) })).toBeNull();
    expect(errores({ ...base, descripcion: "a".repeat(141) })?.descripcion).toBeTruthy();
  });
  test("horas 0, 161, 2,5 y 2.5 no valen", () => {
    for (const h of ["0", "161", "2,5", "2.5", "-3", "abc"]) {
      expect(errores({ ...base, horas: h })?.horas, h).toBeTruthy();
    }
  });
  test("horas 1, 160 y vacías valen; vacías no guardan horas", () => {
    expect(errores({ ...base, horas: "1" })).toBeNull();
    expect(errores({ ...base, horas: "160" })).toBeNull();
    const r = validarCompromiso({ ...base, horas: "" }, "x");
    expect(r.ok && r.compromiso.horasPorMes).toBeUndefined();
  });
  test("bienes: 60 sí, 61 no, vacío sin dato", () => {
    const b: Borrador = { ...base, clase: "bienes", horas: "999" };
    expect(errores({ ...b, bienes: "a".repeat(60) })).toBeNull();
    expect(errores({ ...b, bienes: "a".repeat(61) })?.bienes).toBeTruthy();
    const r = validarCompromiso({ ...b, bienes: "  " }, "x");
    expect(r.ok && r.compromiso.cantidadBienes).toBeUndefined();
    expect(r.ok && r.compromiso.horasPorMes).toBeUndefined();
  });
});

function comp(id: string, creado: string): Compromiso {
  return { id, tipo: "necesito", clase: "bienes", descripcion: id, para: "lighthouse", creado };
}

describe("estado", () => {
  test("registrar deja el más reciente primero", () => {
    let e: Compromiso[] = [];
    e = reducir(e, { tipo: "registrar", compromiso: comp("a", "2026-10-07T10:00:00Z") });
    e = reducir(e, { tipo: "registrar", compromiso: comp("b", "2026-10-07T11:00:00Z") });
    expect(e.map((c) => c.id)).toEqual(["b", "a"]);
  });
  test("quitar y borrar todo", () => {
    const e = [comp("b", "2026-10-07T11:00:00Z"), comp("a", "2026-10-07T10:00:00Z")];
    expect(reducir(e, { tipo: "quitar", id: "b" }).map((c) => c.id)).toEqual(["a"]);
    expect(reducir(e, { tipo: "borrarTodo" })).toEqual([]);
  });
  test("cargar con JSON inválido o de forma incorrecta devuelve vacío", () => {
    expect(cargar(null)).toEqual([]);
    expect(cargar("{no es json")).toEqual([]);
    expect(cargar('{"a":1}')).toEqual([]);
    expect(cargar('[{"id":1}]')).toEqual([]);
  });
  test("cargar devuelve lo guardado", () => {
    const e = [comp("a", "2026-10-07T10:00:00Z")];
    expect(cargar(JSON.stringify(e))).toEqual(e);
  });
});

describe("formato", () => {
  const tribus = [{ id: "semilla", nombre: "Semilla Viva" }];
  test("tiempo con tribu", () => {
    const r = validarCompromiso(base, "x");
    expect(r.ok && describirCompromiso(r.compromiso, tribus)).toBe(
      "Ofrezco · Tiempo · Taller de compost · 8 h/mes · Para: Semilla Viva",
    );
  });
  test("sin cantidad dice sin dato y destino Lighthouse", () => {
    const r = validarCompromiso(
      { ...base, tipo: "necesito", clase: "bienes", descripcion: "Herramientas de poda", para: "lighthouse" },
      "x",
    );
    expect(r.ok && describirCompromiso(r.compromiso, tribus)).toBe(
      "Necesito · Bienes · Herramientas de poda · sin dato · Para: El Lighthouse en general",
    );
  });
  test("tiempo sin horas dice sin dato", () => {
    const r = validarCompromiso({ ...base, horas: "" }, "x");
    expect(r.ok && describirCompromiso(r.compromiso, tribus)).toContain("sin dato");
  });
});
