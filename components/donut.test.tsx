import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { calcularArcos, Donut } from "./donut";

const porciones = [
  { id: "a", etiqueta: "Regeneración ecológica", valor: 36 },
  { id: "b", etiqueta: "Accesibilidad", valor: 9 },
  { id: "c", etiqueta: "Retorno económico", valor: 1 },
];

describe("calcularArcos", () => {
  test("incluye el resto, suma 100 % y cierra la vuelta", () => {
    const arcos = calcularArcos(porciones, { etiqueta: "Sin usar", valor: 54 });
    expect(arcos.map((a) => a.etiqueta)).toEqual(["Regeneración ecológica", "Accesibilidad", "Retorno económico", "Sin usar"]);
    expect(arcos.reduce((s, a) => s + a.pct, 0)).toBe(100);
    expect(arcos.map((a) => a.numero)).toEqual([1, 2, 3, null]);
    expect(arcos[0].desde).toBe(0);
    expect(arcos.at(-1)!.hasta).toBe(1);
    expect(arcos[1].desde).toBeCloseTo(arcos[0].hasta);
  });
  test("ignora porciones sin valor y un resto de 0", () => {
    const arcos = calcularArcos([...porciones, { id: "d", etiqueta: "Nada", valor: 0 }], { etiqueta: "Sin usar", valor: 0 });
    expect(arcos.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });
  test("total 0: sin arcos", () => {
    expect(calcularArcos([{ id: "a", etiqueta: "A", valor: 0 }], { etiqueta: "Sin usar", valor: 0 })).toEqual([]);
  });
  test("los tonos son clases de tokens y se repiten con más de siete opciones", () => {
    const muchas = Array.from({ length: 9 }, (_, i) => ({ id: `o${i}`, etiqueta: `O${i}`, valor: 1 }));
    const arcos = calcularArcos(muchas);
    expect(arcos[7].tono).toBe(arcos[0].tono);
    for (const a of arcos) expect(a.tono).toMatch(/^stroke-(deep|gold|blue|violet|clay|rose|green)$/);
  });
});

describe("Donut", () => {
  test("la leyenda lista número, etiqueta y % en orden, con Sin usar", () => {
    const html = renderToStaticMarkup(
      <Donut titulo="Mis créditos" porciones={porciones} resto={{ etiqueta: "Sin usar", valor: 54 }} />,
    );
    const a = html.indexOf("1 · Regeneración ecológica · 36 %");
    const b = html.indexOf("2 · Accesibilidad · 9 %");
    const c = html.indexOf("3 · Retorno económico · 1 %");
    const d = html.indexOf("Sin usar · 54 %");
    expect(a).toBeGreaterThan(-1);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(d).toBeGreaterThan(c);
    expect(html).toContain("Ver como tabla");
    expect(html).toContain('aria-hidden="true"');
  });
  test("solo las porciones de 5 % o más llevan el número dibujado", () => {
    const html = renderToStaticMarkup(<Donut titulo="T" porciones={porciones} resto={{ etiqueta: "Sin usar", valor: 54 }} />);
    expect(html.match(/<text/g)).toHaveLength(2);
  });
  test("total 0 muestra sin dato", () => {
    const html = renderToStaticMarkup(<Donut titulo="T" porciones={[{ id: "a", etiqueta: "A", valor: 0 }]} />);
    expect(html).toContain("sin dato");
    expect(html).not.toContain("Ver como tabla");
  });
  test("solo usa clases de tokens, sin colores sueltos", () => {
    const html = renderToStaticMarkup(<Donut titulo="T" porciones={porciones} resto={{ etiqueta: "Sin usar", valor: 54 }} />);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b|stroke="|fill="(?!none)/);
  });
});
