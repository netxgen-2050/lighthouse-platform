import { describe, expect, it } from "vitest";
import { borrarDemo } from "./borrar";
import { anotar, huella, leer, TOPE_ENTRADAS, type Bitacora } from "./bitacora";
import { CLAVES } from "./claves";

const base = { ruta: "/sumarte", tipo: "termino-legal", clave: "pase", mostrado: "Pase", huella: "aaaaaaaa", borrador: false } as const;
const t0 = new Date("2026-10-07T12:00:00Z");
const min = (n: number) => new Date(t0.getTime() + n * 60_000);

describe("huella", () => {
  it("es estable y de 8 caracteres hexadecimales", () => {
    expect(huella("Título", "Texto")).toBe(huella("Título", "Texto"));
    expect(huella("Título", "Texto")).toMatch(/^[0-9a-f]{8}$/);
  });
  it("cambia si cambia una palabra", () => {
    expect(huella("Título", "Texto uno")).not.toBe(huella("Título", "Texto dos"));
  });
});

describe("leer", () => {
  it("JSON inválido o de otra forma da vacía", () => {
    expect(leer("{no")).toEqual([]);
    expect(leer('{"a":1}')).toEqual([]);
    expect(leer(null)).toEqual([]);
    expect(leer('[1,"x"]')).toEqual([]);
  });
  it("lee lo que anotó", () => {
    const b = anotar([], base, t0);
    expect(leer(JSON.stringify(b))).toEqual(b);
  });
});

describe("idioma de la entrada", () => {
  it("acepta la entrada con idioma y la vieja sin él", () => {
    const sin = anotar([], base, t0);
    const conEs = anotar([], { ...base, idioma: "es" }, t0);
    const conEn = anotar([], { ...base, idioma: "en", borrador: true }, t0);
    expect(leer(JSON.stringify(sin))).toEqual(sin);
    expect(leer(JSON.stringify(conEs))[0].idioma).toBe("es");
    expect(leer(JSON.stringify(conEn))[0].idioma).toBe("en");
  });
  it("descarta la entrada con un idioma que no es es ni en", () => {
    const mala = JSON.stringify([{ ...anotar([], base, t0)[0], idioma: "fr" }]);
    expect(leer(mala)).toEqual([]);
    const nula = JSON.stringify([{ ...anotar([], base, t0)[0], idioma: null }]);
    expect(leer(nula)).toEqual([]);
  });
  it("el mismo texto en otro idioma (otra huella) cuenta como otra cosa", () => {
    let b = anotar([], { ...base, idioma: "es" }, t0);
    b = anotar(b, { ...base, idioma: "en", huella: "cccccccc", borrador: true }, min(1));
    expect(b).toHaveLength(2);
  });
});

describe("anotar", () => {
  it("no repite lo mismo dentro de 30 minutos y a los 31 sí", () => {
    let b: Bitacora = anotar([], base, t0);
    b = anotar(b, base, min(2));
    b = anotar(b, base, min(30));
    expect(b).toHaveLength(1);
    b = anotar(b, base, min(31));
    expect(b).toHaveLength(2);
  });
  it("otra ruta, clave o huella cuenta como otra cosa", () => {
    let b = anotar([], base, t0);
    b = anotar(b, { ...base, ruta: "/panel" }, min(1));
    b = anotar(b, { ...base, huella: "bbbbbbbb" }, min(1));
    b = anotar(b, { ...base, clave: "otro" }, min(1));
    expect(b).toHaveLength(4);
  });
  it("el tope de 300 descarta la más vieja", () => {
    let b: Bitacora = [];
    for (let i = 0; i < TOPE_ENTRADAS; i++) b = anotar(b, { ...base, clave: `k${i}` }, t0);
    expect(b).toHaveLength(300);
    b = anotar(b, { ...base, clave: "nueva" }, t0);
    expect(b).toHaveLength(300);
    expect(b.some((e) => e.clave === "k0")).toBe(false);
    expect(b[299].clave).toBe("nueva");
  });
});

describe("clave de la bitácora", () => {
  it("es lh-bitacora y borrarDemo la quita", () => {
    expect(CLAVES.bitacora).toBe("lh-bitacora");
    const quitadas: string[] = [];
    borrarDemo((c) => quitadas.push(c));
    expect(quitadas).toContain("lh-bitacora");
  });
});
