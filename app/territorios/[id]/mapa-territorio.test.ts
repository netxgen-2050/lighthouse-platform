import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MapaTerritorio } from "./mapa-territorio";

describe("MapaTerritorio", () => {
  it("sin geometría muestra 'Mapa: sin dato', no un mapa vacío", () => {
    const html = renderToStaticMarkup(
      createElement(MapaTerritorio, { territorioId: "no-existe", nombre: "Territorio X", tribus: [] }),
    );
    expect(html).toContain("Mapa: sin dato");
    expect(html).not.toContain("mapa-titulo");
  });
});
