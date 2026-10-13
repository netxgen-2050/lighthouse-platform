import { describe, expect, it } from "vitest";
import { ESTADO_INICIAL, reducir } from "./estado";
import {
  PERFIL_VACIO,
  MAX,
  basicosCompletos,
  borradorInicial,
  cargarPerfil,
  datosCompletos,
  iniciales,
  leer,
  migrarDeEntrevista,
  normalizar,
  perfilVacio,
  validar,
  type Perfil,
} from "./modelo";

const ANA: Perfil = { ...PERFIL_VACIO, nombre: "Ana Pérez", lugar: "Mendoza", frase: "Quiero vivir en comunidad" };

function entrevistaCon(respuestas: string[], confirmar: number[] = []) {
  let e = ESTADO_INICIAL;
  for (const r of respuestas) e = reducir(e, { tipo: "responder", texto: r });
  for (const i of confirmar) e = reducir(e, { tipo: "confirmar", indice: i });
  return e;
}

describe("borradorInicial (nombre de Privy)", () => {
  it("precarga el nombre de la cuenta si el perfil no tiene nombre", () => {
    expect(borradorInicial(PERFIL_VACIO, "Ana de Google").nombre).toBe("Ana de Google");
  });
  it("no pisa un nombre ya guardado", () => {
    expect(borradorInicial(ANA, "Otra").nombre).toBe("Ana Pérez");
  });
  it("sin nombre de cuenta deja el perfil como está", () => {
    expect(borradorInicial(PERFIL_VACIO, null)).toBe(PERFIL_VACIO);
    expect(borradorInicial(PERFIL_VACIO, "   ")).toBe(PERFIL_VACIO);
  });
  it("recorta al máximo permitido", () => {
    expect(borradorInicial(PERFIL_VACIO, "x".repeat(200)).nombre).toHaveLength(MAX.nombre);
  });
});

describe("validar", () => {
  it("el nombre es obligatorio", () => {
    expect(validar(PERFIL_VACIO).nombre).toBeDefined();
    expect(validar({ ...PERFIL_VACIO, nombre: "   " }).nombre).toBeDefined();
    expect(validar(ANA)).toEqual({});
  });
  it("respeta los largos máximos", () => {
    expect(validar({ ...ANA, frase: "a".repeat(141) }).frase).toBeDefined();
    expect(validar({ ...ANA, frase: "a".repeat(140) }).frase).toBeUndefined();
  });
  it("el rol Otro pide que cuentes cuál", () => {
    expect(validar({ ...ANA, roles: ["otro"] }).rolOtro).toBeDefined();
    expect(validar({ ...ANA, roles: ["otro"], rolOtro: "Apicultura" }).rolOtro).toBeUndefined();
    expect(validar({ ...ANA, roles: ["jardineria"] }).rolOtro).toBeUndefined();
    // Con "Otro" marcado, el largo se controla.
    expect(validar({ ...ANA, roles: ["otro"], rolOtro: "x".repeat(81) }).rolOtro).toBeDefined();
    // Con "Otro" desmarcado, el texto largo no bloquea el guardado y no se guarda.
    const largo = { ...ANA, roles: ["jardineria" as const], rolOtro: "x".repeat(200) };
    expect(validar(largo)).toEqual({});
    expect(normalizar(largo).rolOtro).toBe("");
  });
});

describe("normalizar", () => {
  it("recorta, ordena los roles como en Pactos y borra el texto de Otro si ya no está", () => {
    const p = normalizar({ ...ANA, nombre: "  Ana ", roles: ["jardineria", "facilitacion", "jardineria"], rolOtro: "x" });
    expect(p.nombre).toBe("Ana");
    expect(p.roles).toEqual(["facilitacion", "jardineria"]);
    expect(p.rolOtro).toBe("");
  });
});

describe("completitud", () => {
  it("vacío no tiene ningún dato (sin dato, no cero inventado)", () => {
    expect(perfilVacio(PERFIL_VACIO)).toBe(true);
    expect(datosCompletos(PERFIL_VACIO)).toBe(0);
  });
  it("cuenta los 6 datos y los básicos son nombre, lugar y frase", () => {
    expect(basicosCompletos(ANA)).toBe(true);
    expect(basicosCompletos({ ...ANA, lugar: "" })).toBe(false);
    expect(datosCompletos(ANA)).toBe(3);
    const todo = { ...ANA, roles: ["jardineria" as const], decision: "Consenso", noNegociables: "El agua" };
    expect(datosCompletos(todo)).toBe(6);
  });
});

describe("iniciales", () => {
  it("toma hasta dos", () => {
    expect(iniciales("ana pérez gómez")).toBe("AP");
    expect(iniciales("  Ana ")).toBe("A");
    expect(iniciales("")).toBe("");
  });
});

describe("leer", () => {
  it("tolera basura", () => {
    expect(leer(null)).toBeNull();
    expect(leer("no es json")).toBeNull();
    expect(leer("[1]")).toBeNull();
    expect(leer('{"nombre":1,"roles":"x"}')).toEqual(PERFIL_VACIO);
  });
  it("descarta roles desconocidos y vuelve lo que se guardó", () => {
    expect(leer(JSON.stringify({ ...ANA, roles: ["jardineria", "inventado"] }))?.roles).toEqual(["jardineria"]);
    expect(leer(JSON.stringify(ANA))).toEqual(ANA);
  });
});

describe("migración de la entrevista anterior", () => {
  it("sin entrevista no hay nada que migrar", () => {
    expect(migrarDeEntrevista(ESTADO_INICIAL)).toBeNull();
  });
  it("Lo que aportás pasa a qué ofrecés, y el resto a sus campos", () => {
    const e = entrevistaCon(["Vivir en comunidad", "Montaña", "Por consenso", "Huerta y compost", "10 horas", "El agua"], [3]);
    const p = migrarDeEntrevista(e);
    expect(p?.ofrezco).toBe("Huerta y compost");
    expect(p?.frase).toBe("Vivir en comunidad");
    expect(p?.decision).toBe("Por consenso");
    expect(p?.noNegociables).toBe("El agua");
    expect(p?.nombre).toBe("");
  });
  it("respuestas a medias dejan sin dato lo que falta", () => {
    const p = migrarDeEntrevista(entrevistaCon(["Uno", "Dos"]));
    expect(p?.frase).toBe("Uno");
    expect(p?.ofrezco).toBe("");
  });
  it("cargarPerfil prefiere lo nuevo, después la entrevista, y si no hay nada devuelve vacío", () => {
    const vieja = JSON.stringify(entrevistaCon(["Uno"]));
    expect(cargarPerfil(JSON.stringify(ANA), vieja)).toEqual(ANA);
    expect(cargarPerfil(null, vieja).frase).toBe("Uno");
    expect(cargarPerfil(null, null)).toEqual(PERFIL_VACIO);
    expect(cargarPerfil("{roto", "{roto")).toEqual(PERFIL_VACIO);
  });
});
