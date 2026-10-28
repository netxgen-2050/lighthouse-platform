import { afterEach, describe, expect, it } from "vitest";
import { CLAVES, CLAVES_COMPARTIDAS, establecerPersona } from "@/lib/demo/claves";
import { afirmaComunidad, afirmaPersona, sobreDe, type Nueva } from "./constancias";
import {
  agregarEnNavegador,
  constanciasDe,
  leerDelNavegador,
  quitarConstanciasDe,
  type Almacen,
} from "./registro-compartido";

const T = "2026-10-28T10:00:00.000Z";
const A = "prueba:a@prueba.test";
const B = "prueba:b@prueba.test";
const LIDER = "prueba:admin@prueba.test";

function almacenEnMemoria(inicial: string | null = null): Almacen & { valor: string | null } {
  const a = {
    valor: inicial,
    getItem: () => a.valor,
    setItem: (_k: string, v: string) => {
      a.valor = v;
    },
  };
  return a;
}

const propone = (id: string): Nueva => ({ esquema: "pacto-propone", afirma: afirmaPersona(id), por: id, sobre: sobreDe("valle", id), version: 1 });

afterEach(() => establecerPersona(null));

describe("clave compartida", () => {
  it("no lleva el prefijo de la persona en sesión", () => {
    establecerPersona(A);
    expect(CLAVES_COMPARTIDAS.pactosConstancias).toBe("compartido:pactos-constancias");
    expect(CLAVES.pactos.startsWith("u:")).toBe(true);
  });
});

describe("registro compartido", () => {
  it("lee null si el navegador no deja y lista vacía si no hay nada", () => {
    expect(leerDelNavegador(null)).toBeNull();
    expect(leerDelNavegador({ getItem: () => { throw new Error("no"); }, setItem: () => {} })).toBeNull();
    expect(leerDelNavegador(almacenEnMemoria())).toEqual([]);
  });

  it("agregar con lo guardado roto no pierde la constancia nueva", () => {
    const a = almacenEnMemoria("{roto");
    const lista = agregarEnNavegador(propone(A), T, a);
    expect(lista).toHaveLength(1);
    expect(leerDelNavegador(a)).toHaveLength(1);
  });

  it("agregar relee antes de escribir", () => {
    const a = almacenEnMemoria();
    agregarEnNavegador(propone(A), T, a);
    agregarEnNavegador(propone(B), T, a);
    expect(leerDelNavegador(a)?.map((c) => c.id)).toEqual(["p1-pacto-propone", "p2-pacto-propone"]);
  });

  it("quitarConstanciasDe saca solo las de una persona y anonimiza al que respondió", () => {
    const a = almacenEnMemoria();
    agregarEnNavegador(propone(A), T, a);
    agregarEnNavegador(propone(B), T, a);
    agregarEnNavegador({ esquema: "pacto-acepta", afirma: afirmaComunidad("valle"), por: LIDER, sobre: sobreDe("valle", B), version: 1, apuntaA: "p2-pacto-propone" }, T, a);
    expect(quitarConstanciasDe(A, a)).toBe(true);
    const lista = leerDelNavegador(a) ?? [];
    expect(lista).toHaveLength(2);
    expect(constanciasDe(lista, A)).toHaveLength(0);
    expect(constanciasDe(lista, B)).toHaveLength(2);
    expect(quitarConstanciasDe(LIDER, a)).toBe(true);
    const despues = leerDelNavegador(a) ?? [];
    expect(despues).toHaveLength(2);
    expect(despues[1].esquema).toBe("pacto-acepta");
    expect(despues[1].por).toBe("persona-borrada");
    expect(JSON.stringify(despues)).not.toContain(LIDER);
  });

  it("la descarga trae solo las suyas", () => {
    const a = almacenEnMemoria();
    agregarEnNavegador(propone(A), T, a);
    agregarEnNavegador(propone(B), T, a);
    expect(constanciasDe(leerDelNavegador(a) ?? [], A).map((c) => c.por)).toEqual([A]);
  });
});
