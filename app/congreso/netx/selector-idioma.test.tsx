import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
vi.mock("@/components/sesion/contexto", () => ({ useSesion: () => ({ estado: "sin-sesion" }) }));

import { SelectorIdioma } from "./selector-idioma";

describe("SelectorIdioma", () => {
  it("son dos enlaces con nombre accesible, lang y hreflang", () => {
    const html = renderToStaticMarkup(<SelectorIdioma idioma="en" />);
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Idioma · Language"');
    expect(html).toContain("ES · Español");
    expect(html).toContain("EN · English");
    expect(html).toContain('href="/congreso"');
    expect(html).toContain('href="/congreso/en"');
    expect(html).toContain('lang="es"');
    expect(html).toContain('lang="en"');
    expect(html).toContain('hrefLang="es"');
    expect(html).toContain('hrefLang="en"');
  });

  it("marca con aria-current solo el idioma actual", () => {
    const en = renderToStaticMarkup(<SelectorIdioma idioma="en" />);
    expect(en.match(/aria-current="true"/g)).toHaveLength(1);
    expect(en).toMatch(/href="\/congreso\/en"[^>]*aria-current="true"|aria-current="true"[^>]*href="\/congreso\/en"/);
    const es = renderToStaticMarkup(<SelectorIdioma idioma="es" />);
    expect(es).toMatch(/href="\/congreso"[^>]*aria-current="true"|aria-current="true"[^>]*href="\/congreso"/);
    expect(es.match(/aria-current="true"/g)).toHaveLength(1);
  });
});
