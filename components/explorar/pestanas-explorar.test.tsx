import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

let ruta = "/explorar/territorio";
vi.mock("next/navigation", () => ({ usePathname: () => ruta }));
vi.mock("@/lib/idioma/cliente", async () => {
  const { textos } = await import("@/lib/idioma/textos");
  return { useTextos: (zona: "explorar") => textos(zona, "es") };
});

import { PestanasExplorar } from "./pestanas-explorar";

const dibujar = () => renderToStaticMarkup(<PestanasExplorar />);
const actuales = (html: string) => [...html.matchAll(/<a [^>]*aria-current="page"[^>]*href="([^"]+)"|<a [^>]*href="([^"]+)"[^>]*aria-current="page"/g)].map((m) => m[1] ?? m[2]);

beforeEach(() => {
  ruta = "/explorar/territorio";
});

describe("PestanasExplorar", () => {
  it("dibuja tres enlaces a las páginas, sin anclas", () => {
    const html = dibujar();
    expect(html).toContain('href="/explorar/territorio"');
    expect(html).toContain('href="/explorar/barrio-norte"');
    expect(html).toContain('href="/explorar/lotes"');
    expect(html).not.toContain('href="#');
    expect(html).toContain('aria-label="Secciones de Explorar"');
  });

  it.each(["/explorar/territorio", "/explorar/barrio-norte", "/explorar/lotes"])("en %s solo esa pestaña es la actual", (r) => {
    ruta = r;
    expect(actuales(dibujar())).toEqual([r]);
  });

  it("la pestaña actual va en negrita y con borde, no solo con color", () => {
    ruta = "/explorar/lotes";
    expect(dibujar()).toMatch(/aria-current="page"[^>]*class="[^"]*border-ink font-bold/);
  });

  it("con barra final sigue marcando la actual", () => {
    ruta = "/explorar/lotes/";
    expect(actuales(dibujar())).toEqual(["/explorar/lotes"]);
  });
});
