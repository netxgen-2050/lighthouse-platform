import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { caminosDePortada, descripcionBarrios } from "./portada";
import { tribusDeTerritorio } from "./territorios/datos";

describe("portada", () => {
  it("devuelve los tres caminos en orden, con sus destinos", () => {
    expect(caminosDePortada().map((c) => [c.id, c.href])).toEqual([
      ["vivir", "/explorar/territorio"],
      ["invertir", "/invertir"],
      ["cuidar", "/participa"],
    ]);
  });

  it("los valores de ?camino= de campañas anteriores marcan un solo camino", () => {
    const cuenta = (valor: "lotes" | "territorio" | "tribus") =>
      caminosDePortada().filter((c) => c.recomendadoPara.includes(valor)).map((c) => c.id);
    expect(cuenta("lotes")).toEqual(["vivir"]);
    expect(cuenta("territorio")).toEqual(["vivir"]);
    expect(cuenta("tribus")).toEqual(["cuidar"]);
  });

  it("la cantidad de barrios de la tarjeta del bien común sale de los datos", () => {
    const n = tribusDeTerritorio("lighthouse").length;
    expect(caminosDePortada()[2].descripcion).toContain(`${n} barrios`);
  });

  it("con un solo barrio usa el singular", () => {
    expect(descripcionBarrios(1)).toBe("1 barrio y las comunidades que lo están formando.");
  });

  it("en inglés: singular, plural y sin datos", () => {
    expect(descripcionBarrios(1, "en")).toBe("1 neighborhood and the communities forming it.");
    expect(descripcionBarrios(12, "en")).toBe("12 neighborhoods and the communities forming them.");
    const sinDatos = descripcionBarrios(0, "en");
    expect(sinDatos).not.toMatch(/\d/);
    expect(sinDatos).toBe("The neighborhoods and the communities forming them.");
  });

  it("los caminos en inglés tienen los mismos destinos y textos en inglés", () => {
    const caminos = caminosDePortada("en");
    expect(caminos.map((c) => c.href)).toEqual(["/explorar/territorio", "/invertir", "/participa"]);
    expect(caminos.map((c) => c.titulo)).toEqual([
      "Where would I live and what does it cost?",
      "What do I fund and how am I paid back?",
      "What belongs to everyone and who decides?",
    ]);
  });

  it("sin datos no muestra número ni 0", () => {
    const texto = descripcionBarrios(0);
    expect(texto).not.toMatch(/\d/);
    expect(texto).toBe("Los barrios y las comunidades que los están formando.");
  });

  it("la página y sus textos no escriben cifras: salen de lib/portada-vrn.ts", () => {
    for (const archivo of ["idioma/textos/portada.ts", "../app/page.tsx"]) {
      const contenido = readFileSync(path.join(__dirname, archivo), "utf8");
      expect(contenido, archivo).not.toMatch(/[0-9]+ ?(mm|ha|km|%)/);
    }
  });
});
