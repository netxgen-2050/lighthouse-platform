import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cierraAlArrastrar, Hoja, UMBRAL_CIERRE } from "./hoja";

// Sin jsdom en el repo: acá va el marcado inicial y la regla del arrastre; foco atrapado, Escape y arrastre reales
// los cubre e2e/hoja.spec.ts en un navegador.
describe("Hoja", () => {
  it("cerrada no dibuja nada", () => {
    const html = renderToStaticMarkup(
      <Hoja abierta={false} alCerrar={() => {}} titulo="Más" etiquetaCerrar="Cerrar">
        <p>contenido</p>
      </Hoja>,
    );
    expect(html).toBe("");
  });

  it("abierta es un diálogo modal con título, asa y botón de cerrar", () => {
    const html = renderToStaticMarkup(
      <Hoja abierta alCerrar={() => {}} titulo="Más" etiquetaCerrar="Cerrar">
        <p>contenido</p>
      </Hoja>,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toMatch(/aria-labelledby="([^"]+)-titulo"/);
    const id = /aria-labelledby="([^"]+)"/.exec(html)![1];
    expect(html).toContain(`id="${id}"`);
    expect(html).toContain("Más");
    expect(html).toContain("Cerrar");
    expect(html).toContain("contenido");
    expect(html).toContain("max-h-[85dvh]");
    expect(html).toContain("w-9");
    expect(html).toContain("h-1");
  });

  it("persistente se ve siempre, sin ser un diálogo, y el asa expande", () => {
    const html = renderToStaticMarkup(
      <Hoja abierta={false} persistente alCerrar={() => {}} titulo="Lotes" etiquetaCerrar="Cerrar" etiquetaAsa="Ver más lotes">
        <p>lista</p>
      </Hoja>,
    );
    expect(html).not.toContain('role="dialog"');
    expect(html).toContain("lista");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Ver más lotes"');
  });
});

describe("arrastrar para cerrar", () => {
  it("cierra solo con más de 80 px hacia abajo", () => {
    expect(UMBRAL_CIERRE).toBe(80);
    expect(cierraAlArrastrar(81)).toBe(true);
    expect(cierraAlArrastrar(80)).toBe(false);
    expect(cierraAlArrastrar(-200)).toBe(false);
  });
});
