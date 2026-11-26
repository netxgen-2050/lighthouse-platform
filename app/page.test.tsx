import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

// Spec portada-narrativa, "Sin cifras": con la lista vacía la sección no se dibuja y no aparece ningún 0.
vi.mock("@/lib/portada-vrn", async (original) => ({
  ...(await original<typeof import("@/lib/portada-vrn")>()),
  cifrasDePortada: () => [],
}));
vi.mock("@/lib/idioma/servidor", () => ({ idiomaDelPedido: async () => "es" }));
vi.mock("next/image", () => ({ default: () => null }));

import Home from "./page";

describe("portada sin cifras", () => {
  test("no dibuja la sección de cifras ni ningún 0", async () => {
    const html = renderToStaticMarkup(await Home({ searchParams: Promise.resolve({}) }));
    expect(html).not.toContain('aria-labelledby="cifras"');
    expect(html).not.toContain('id="cifras"');
    expect(html).not.toContain("Cifras del sitio");
    expect(html).not.toMatch(/<strong[^>]*>\s*0\b/);
    // El resto de la portada sigue.
    expect(html).toContain('id="capitales"');
    expect(html).toContain('id="por-donde-empezar"');
  });

  test("el héroe es el único h1 y el aviso de Argentina va después de los capitales", async () => {
    const html = renderToStaticMarkup(await Home({ searchParams: Promise.resolve({}) }));
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.indexOf('id="por-donde-empezar"')).toBeLessThan(html.indexOf('id="capitales"'));
    expect(html.indexOf('id="capitales"')).toBeLessThan(html.indexOf('id="argentina"'));
  });
});
