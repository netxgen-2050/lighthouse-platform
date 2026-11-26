import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { IndicePagina, IndicePaginaMovil, LINEA_DE_LECTURA, seccionActiva } from "./indice-pagina";

// Sin jsdom en el repo: acá va la regla de la sección activa y el marcado inicial; el seguimiento al hacer scroll, la hoja
// y el salto a una sección plegada los cubre e2e/bien-comun.spec.ts en un navegador.
const items = [
  { id: "a", titulo: "Uno" },
  { id: "b", titulo: "Dos" },
  { id: "c", titulo: "Tres" },
];

describe("seccionActiva", () => {
  it("sin ninguna que haya pasado la línea, la primera", () => {
    expect(seccionActiva(["a", "b", "c"], [400, 900, 1500])).toBe("a");
  });
  it("la última que ya pasó la línea de lectura", () => {
    expect(seccionActiva(["a", "b", "c"], [-800, 20, 600])).toBe("b");
    expect(seccionActiva(["a", "b", "c"], [-1800, -900, LINEA_DE_LECTURA])).toBe("c");
  });
  it("al fondo de la página, el último título que se ve, aunque no llegue a la línea de lectura", () => {
    // Los dos últimos títulos quedan abajo de la línea de 140 px, pero a la vista en una ventana de 900 px.
    expect(seccionActiva(["a", "b", "c"], [-1500, 500, 700])).toBe("a");
    expect(seccionActiva(["a", "b", "c"], [-1500, 500, 700], LINEA_DE_LECTURA, { alto: 900 })).toBe("c");
    expect(seccionActiva(["a", "b", "c"], [-1500, 500, 1200], LINEA_DE_LECTURA, { alto: 900 })).toBe("b");
  });
  it("sin secciones no hay activa", () => {
    expect(seccionActiva([], [])).toBeNull();
  });
});

describe("IndicePagina", () => {
  it("es un nav con nombre y un enlace por sección, la primera marcada con aria-current", () => {
    const html = renderToStaticMarkup(<IndicePagina items={items} etiqueta="En esta página" />);
    expect(html).toContain('<nav aria-label="En esta página"');
    expect(html).toContain('href="#a"');
    expect(html).toContain('href="#c"');
    expect(html.match(/aria-current="location"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="location"[^>]*>Uno/);
    // No solo color: la marcada lleva negrita y barra.
    expect(html).toContain("font-bold");
    expect(html).toContain("border-l-2");
  });
});

describe("IndicePaginaMovil", () => {
  it("cerrado es solo el botón con el nombre del índice; la hoja no se dibuja", () => {
    const html = renderToStaticMarkup(<IndicePaginaMovil items={items} etiqueta="En esta página" etiquetaCerrar="Cerrar" />);
    expect(html).toContain("En esta página");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="dialog"');
  });
});
