import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { BarrasReparto, calcularBarras } from "./barras-reparto";

const grupos = [
  {
    id: "a",
    etiqueta: "Serie A",
    items: [
      { id: "p", etiqueta: "Procomún", valor: 300 },
      { id: "n", etiqueta: "NetX", valor: 100 },
      { id: "x", etiqueta: "Notas Verdes", valor: null },
    ],
  },
  {
    id: "b",
    etiqueta: "Serie B",
    items: [
      { id: "p", etiqueta: "Procomún", valor: 1000 },
      { id: "n", etiqueta: "NetX", valor: 800 },
      { id: "x", etiqueta: "Notas Verdes", valor: 3688 },
    ],
  },
];

describe("BarrasReparto", () => {
  test("un destino null no dibuja barra y la tabla dice 'no tiene'", () => {
    expect(calcularBarras(grupos[0].items).map((b) => b.id)).toEqual(["p", "n"]);
    const html = renderToStaticMarkup(<BarrasReparto titulo="T" grupos={grupos} formatoValor={(n) => `USD ${n}`} />);
    expect(html).toContain("no tiene");
    expect(html).not.toContain("Notas Verdes · sin dato");
  });
  test("los porcentajes de cada grupo suman 100", () => {
    for (const g of grupos) expect(calcularBarras(g.items).reduce((s, b) => s + b.pct, 0)).toBe(100);
  });
  test("el SVG es aria-hidden y el texto lleva nombre, monto y porcentaje", () => {
    const html = renderToStaticMarkup(<BarrasReparto titulo="T" grupos={grupos} formatoValor={(n) => `USD ${n}`} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Procomún · USD 300 · 75 %");
    expect(html).toContain("NetX · USD 100 · 25 %");
  });
});
