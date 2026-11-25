import { describe, expect, test } from "vitest";
import { cargar, reducir } from "./estado";
import { describirCantidad, describirCompromiso } from "./formato";
import { armarMercado, AUTOR_EJEMPLO, EJEMPLOS_MERCADO, filtrarMercado } from "./mercado";
import type { Borrador, Compromiso } from "./tipos";
import { nuevoId, validarCompromiso } from "./validar";
import { afterEach, vi } from "vitest";

describe("nuevoId", () => {
  afterEach(() => vi.unstubAllGlobals());
  test("usa un respaldo sin crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {});
    const a = nuevoId();
    const b = nuevoId();
    expect(a).toMatch(/^c-/);
    expect(a).not.toBe(b);
  });
});

const base: Borrador = {
  tipo: "ofrezco",
  clase: "tiempo",
  descripcion: "Taller de compost",
  horas: "8",
  bienes: "",
  monto: "",
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

describe("plata", () => {
  const p: Borrador = { ...base, clase: "plata", horas: "999", bienes: "x", monto: "500" };
  test("monto válido guarda montoUsd y descarta lo de otras clases", () => {
    const r = validarCompromiso(p, "x");
    expect(r.ok && r.compromiso.montoUsd).toBe(500);
    expect(r.ok && r.compromiso.horasPorMes).toBeUndefined();
    expect(r.ok && r.compromiso.cantidadBienes).toBeUndefined();
  });
  test("monto 0, 1000001, 2,5 y texto no valen; 1 y 1000000 sí", () => {
    for (const m of ["0", "1000001", "2,5", "-3", "abc"]) {
      expect(errores({ ...p, monto: m })?.monto, m).toBeTruthy();
    }
    expect(errores({ ...p, monto: "1" })).toBeNull();
    expect(errores({ ...p, monto: "1000000" })).toBeNull();
  });
  test("monto vacío no guarda monto y se describe como sin dato", () => {
    const r = validarCompromiso({ ...p, monto: "" }, "x");
    expect(r.ok && r.compromiso.montoUsd).toBeUndefined();
    expect(r.ok && describirCompromiso(r.compromiso)).toBe("Ofrezco · Plata · Taller de compost · sin dato");
  });
  test("monto se describe en USD", () => {
    const r = validarCompromiso(p, "x");
    expect(r.ok && describirCompromiso(r.compromiso)).toContain("USD 500");
  });
  test("cargar acepta la clase plata", () => {
    const e: Compromiso[] = [
      { id: "a", tipo: "ofrezco", clase: "plata", descripcion: "a", montoUsd: 5, creado: "2026-10-07T10:00:00Z" },
    ];
    expect(cargar(JSON.stringify(e))).toEqual(e);
  });
});

function comp(id: string, creado: string): Compromiso {
  return { id, tipo: "necesito", clase: "bienes", descripcion: id, creado };
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
  test("tiempo", () => {
    const r = validarCompromiso(base, "x");
    expect(r.ok && describirCompromiso(r.compromiso)).toBe("Ofrezco · Tiempo · Taller de compost · 8 h/mes");
  });
  test("sin cantidad dice sin dato", () => {
    const r = validarCompromiso(
      { ...base, tipo: "necesito", clase: "bienes", descripcion: "Herramientas de poda" },
      "x",
    );
    expect(r.ok && describirCompromiso(r.compromiso)).toBe("Necesito · Bienes · Herramientas de poda · sin dato");
  });
  test("tiempo sin horas dice sin dato", () => {
    const r = validarCompromiso({ ...base, horas: "" }, "x");
    expect(r.ok && describirCompromiso(r.compromiso)).toContain("sin dato");
  });
  test("trueque no lleva cantidad ni descarta nada de otras clases", () => {
    const r = validarCompromiso({ ...base, clase: "trueque", horas: "999", bienes: "x", monto: "5" }, "x");
    expect(r.ok && r.compromiso.horasPorMes).toBeUndefined();
    expect(r.ok && r.compromiso.cantidadBienes).toBeUndefined();
    expect(r.ok && r.compromiso.montoUsd).toBeUndefined();
    expect(r.ok && describirCompromiso(r.compromiso)).toBe("Ofrezco · Trueque · Taller de compost");
  });
  test("cargar acepta trueque y compromisos viejos con para", () => {
    const e = [
      { id: "a", tipo: "ofrezco", clase: "trueque", descripcion: "a", creado: "2026-10-07T10:00:00Z" },
      { id: "b", tipo: "ofrezco", clase: "tiempo", descripcion: "b", para: "lighthouse", creado: "2026-10-07T10:00:00Z" },
    ];
    expect(cargar(JSON.stringify(e))).toHaveLength(2);
  });
});

describe("en inglés", () => {
  const en = (b: Borrador) => {
    const r = validarCompromiso(b, "x", new Date("2026-10-07T00:00:00Z"), "en");
    return r.ok ? null : r.errores;
  };
  test("los mensajes de validación salen en inglés y en español por defecto", () => {
    expect(en({ ...base, descripcion: "" })?.descripcion).toBe("Write a description.");
    expect(en({ ...base, descripcion: "a".repeat(141) })?.descripcion).toBe("The description can have up to 140 characters.");
    expect(en({ ...base, horas: "161" })?.horas).toBe("Hours per month must be a whole number between 1 and 160, or leave it empty.");
    expect(en({ ...base, clase: "plata", monto: "0" })?.monto).toBe(
      "The amount must be a whole number of USD between 1 and 1000000, or leave it empty.",
    );
    expect(en({ ...base, clase: "bienes", bienes: "a".repeat(61) })?.bienes).toBe("The quantity can have up to 60 characters.");
    expect(errores({ ...base, descripcion: "" })?.descripcion).toBe("Escribí una descripción.");
  });
  test("un borrador válido se guarda igual en los dos idiomas", () => {
    expect(validarCompromiso(base, "x", new Date("2026-10-07T00:00:00Z"), "en")).toEqual(
      validarCompromiso(base, "x", new Date("2026-10-07T00:00:00Z"), "es"),
    );
  });
  test("los formatos salen en inglés; el texto de la persona va tal cual", () => {
    const r = validarCompromiso(base, "x");
    expect(r.ok && describirCompromiso(r.compromiso, "en")).toBe("I offer · Time · Taller de compost · 8 h/month");
    const sin = validarCompromiso({ ...base, horas: "" }, "x");
    expect(sin.ok && describirCompromiso(sin.compromiso, "en")).toBe("I offer · Time · Taller de compost · no data");
    const plata = validarCompromiso({ ...base, clase: "plata", monto: "500" }, "x");
    expect(plata.ok && describirCantidad(plata.compromiso, "en")).toBe("USD 500");
    const trueque = validarCompromiso({ ...base, clase: "trueque" }, "x");
    expect(trueque.ok && describirCompromiso(trueque.compromiso, "en")).toBe("I offer · Barter · Taller de compost");
    const bienes = validarCompromiso({ ...base, clase: "bienes", bienes: "20 kg por mes" }, "x");
    expect(bienes.ok && describirCantidad(bienes.compromiso, "en")).toBe("20 kg por mes");
  });
  test("las ofertas de ejemplo tienen su inglés y las propias no", () => {
    const m = armarMercado([comp("mio", "2026-10-08T10:00:00Z")]);
    expect(m[0].descripcion.en).toBeUndefined();
    for (const i of m.slice(1)) {
      expect(i.descripcion.en?.trim(), i.compromiso.id).toBeTruthy();
      expect(i.descripcion.original).toBe("es");
      if (i.compromiso.clase === "bienes") expect(i.bienes?.en?.trim(), i.compromiso.id).toBeTruthy();
    }
  });
});

describe("mercado", () => {
  const propio = comp("mio", "2026-10-08T10:00:00Z");
  test("incluye los propios y los de ejemplo, marcando de quién son", () => {
    const m = armarMercado([propio]);
    expect(m[0]).toMatchObject({ autor: "Vos", propio: true });
    expect(m.length).toBe(1 + EJEMPLOS_MERCADO.length);
    expect(m.slice(1).every((i) => !i.propio && i.autor === AUTOR_EJEMPLO)).toBe(true);
  });
  test("los ejemplos cubren cada tipo y cada medio", () => {
    for (const tipo of ["ofrezco", "necesito"] as const) {
      for (const clase of ["tiempo", "bienes", "plata", "trueque"] as const) {
        expect(EJEMPLOS_MERCADO.some((c) => c.tipo === tipo && c.clase === clase), `${tipo} ${clase}`).toBe(true);
      }
    }
  });
  test("filtra por tipo y por medio", () => {
    const m = armarMercado([propio]);
    const r = filtrarMercado(m, { tipo: "necesito", clase: "tiempo" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((i) => i.compromiso.tipo === "necesito" && i.compromiso.clase === "tiempo")).toBe(true);
    expect(filtrarMercado(m, { tipo: "todos", clase: "todas" })).toHaveLength(m.length);
  });
});
