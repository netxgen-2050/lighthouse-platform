import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MapaTerritorio } from "./mapa-territorio";

describe("MapaTerritorio con geometría", () => {
  it("muestra título y leyenda con los cuatro estados", () => {
    const html = renderToStaticMarkup(
      createElement(MapaTerritorio, { territorioId: "lighthouse", nombre: "Lighthouse", tribus: [] }),
    );
    expect(html).toContain("Mapa del Lighthouse");
    for (const t of ["Tribu activa", "En formación", "Busca tribu", "Núcleo común"]) {
      expect(html).toContain(t);
    }
    expect(html).not.toContain("sin dato");
  });
});
