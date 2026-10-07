import { describe, expect, it } from "vitest";
import {
  armarContexto,
  armarCuerpo,
  armarEtiquetas,
  armarTitulo,
  esBot,
  validarReporte,
  versionDesplegada,
} from "./reporte";

const valido = { tipo: "bug", quePaso: "  Se rompe el mapa ", esperabas: "", contacto: "", contexto: {} };

describe("validarReporte", () => {
  it("acepta un reporte mínimo y recorta espacios", () => {
    const r = validarReporte(valido);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.reporte.quePaso).toBe("Se rompe el mapa");
  });
  it("exige qué pasó", () => {
    const r = validarReporte({ ...valido, quePaso: "   " });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.quePaso).toBeTruthy();
  });
  it("rechaza tipo inválido y largos excedidos", () => {
    const r = validarReporte({ ...valido, tipo: "otro", quePaso: "a".repeat(2001), contacto: "a".repeat(201) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(["contacto", "quePaso", "tipo"]);
  });
  it("tolera entradas que no son objetos", () => {
    expect(validarReporte(null).ok).toBe(false);
  });
});

describe("esBot", () => {
  it("detecta el campo trampa", () => {
    expect(esBot({ sitioWeb: "http://spam" })).toBe(true);
    expect(esBot({ sitioWeb: "" })).toBe(false);
    expect(esBot({})).toBe(false);
  });
});

describe("contexto", () => {
  it("arma ruta, pantalla y fecha", () => {
    const c = armarContexto({
      url: "http://x.test/tribus/valle?a=1",
      titulo: "Valle",
      ancho: 1280,
      alto: 720,
      navegador: "UA",
      version: "abc1234",
      entorno: "preview",
      ahora: new Date("2026-10-07T10:00:00Z"),
    });
    expect(c.ruta).toBe("/tribus/valle?a=1");
    expect(c.pantalla).toBe("1280 × 720 px");
    expect(c.fecha).toBe("2026-10-07T10:00:00.000Z");
  });
  it("sin dato cuando falta algo", () => {
    const c = armarContexto({ url: "", titulo: "", ancho: NaN, alto: NaN, navegador: "", version: "", entorno: "" });
    expect(c.ruta).toBe("sin dato");
    expect(c.pantalla).toBe("sin dato");
    expect(c.titulo).toBe("sin dato");
  });
  it("versión local sin variables de Vercel", () => {
    expect(versionDesplegada({})).toEqual({ version: "local", entorno: "local" });
    expect(versionDesplegada({ VERCEL_GIT_COMMIT_SHA: "1234567890", VERCEL_ENV: "production" })).toEqual({
      version: "1234567",
      entorno: "producción",
    });
  });
});

describe("issue", () => {
  it("arma título, cuerpo y etiquetas", () => {
    const r = validarReporte({ ...valido, esperabas: "Que ande", contacto: "a@b.c" });
    if (!r.ok) throw new Error("debía ser válido");
    expect(armarTitulo(r.reporte)).toBe("[bug] Se rompe el mapa");
    const cuerpo = armarCuerpo(r.reporte);
    expect(cuerpo).toContain("Que ande");
    expect(cuerpo).toContain("a@b.c");
    expect(cuerpo).toContain("- Ruta:");
    expect(armarEtiquetas("idea")).toEqual(["reporte", "idea"]);
  });
  it("neutraliza menciones y referencias en título y cuerpo", () => {
    const r = validarReporte({
      ...valido,
      quePaso: "Avisen a @gus por el #12",
      esperabas: "ver @otra y #7",
      contacto: "@yo",
    });
    if (!r.ok) throw new Error("debía ser válido");
    const todo = `${armarTitulo(r.reporte)}\n${armarCuerpo(r.reporte)}`;
    expect(todo).not.toMatch(/@\w/);
    expect(todo).not.toMatch(/#\d/);
    expect(todo).toContain("gus");
    expect(todo).toContain("12");
  });
  it("URL y ruta quedan exactas, entre comillas invertidas", () => {
    const url = "http://x.test/tribus/@algo?q=1#2";
    const contexto = armarContexto({
      url,
      titulo: "T",
      ancho: 1,
      alto: 1,
      navegador: "UA",
      version: "v",
      entorno: "local",
    });
    const r = validarReporte({ ...valido, contexto });
    if (!r.ok) throw new Error("debía ser válido");
    const cuerpo = armarCuerpo(r.reporte);
    expect(cuerpo).toContain(`- URL: \`${url}\``);
    expect(cuerpo).toContain("- Ruta: `/tribus/@algo?q=1`");
    expect(cuerpo).not.toContain("​");
  });
  it("acorta títulos largos", () => {
    const t = armarTitulo({ tipo: "idea", quePaso: "palabra ".repeat(50) });
    expect(t.length).toBeLessThanOrEqual(90);
  });
});
