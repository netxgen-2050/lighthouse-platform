import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Rangos, escalaRangos } from "./rangos";

const pct = (n: number) => `${(n * 100).toFixed(1).replace(".", ",")} %`;
const filas = [
  { id: "v", etiqueta: "Viñedo", p10: -0.026, p50: 0.084, p90: 0.108 },
  { id: "a", etiqueta: "Agrovoltaica", p10: 0.012, p50: 0.085, p90: 0.14 },
];

describe("Rangos", () => {
  test("la escala incluye el 0 y el P10 negativo", () => {
    const { min, max } = escalaRangos(filas);
    expect(min).toBeLessThan(-0.026);
    expect(max).toBeGreaterThan(0.14);
    expect(escalaRangos([{ id: "a", etiqueta: "A", p10: 0.05, p50: 0.08, p90: 0.1 }]).min).toBeLessThan(0);
  });
  test("cada fila trae P10, P50 y P90 en texto", () => {
    const html = renderToStaticMarkup(<Rangos titulo="TIR" filas={filas} formato={pct} />);
    expect(html).toContain("Viñedo · P10 -2,6 % · P50 8,4 % · P90 10,8 %");
    expect(html).toContain("P90 14,0 %");
  });
  test("el SVG es decorativo", () => {
    const html = renderToStaticMarkup(<Rangos titulo="TIR" filas={filas} formato={pct} />);
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(2);
  });
  test("una fila con null dice sin dato y no dibuja", () => {
    const html = renderToStaticMarkup(
      <Rangos titulo="TIR" filas={[...filas, { id: "x", etiqueta: "Biochar", p10: null, p50: 0.05, p90: 0.1 }]} formato={pct} />,
    );
    expect(html).toContain("Biochar · sin dato");
    expect(html.match(/<svg/g)).toHaveLength(2);
    expect(html).toContain("<td class=\"pr-4\">sin dato</td>");
  });
  test("la tabla tiene Serie · P10 · P50 · P90", () => {
    const html = renderToStaticMarkup(<Rangos titulo="TIR" filas={filas} formato={pct} />);
    expect(html).toContain("Ver como tabla");
    for (const c of ["Serie", "P10", "P50", "P90"]) expect(html).toContain(`>${c}</th>`);
  });
});
