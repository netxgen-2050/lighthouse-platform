import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/tribus",
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
}));
vi.mock("@/components/sesion/contexto", () => ({ useSesion: () => ({ estado: "sin-sesion", consentimiento: "cargando" }) }));

import { ProveedorIdioma } from "@/lib/idioma/cliente";
import { SelectorIdioma } from "./selector-idioma";

const dibujar = (idioma: "es" | "en") =>
  renderToStaticMarkup(
    <ProveedorIdioma idioma={idioma}>
      <SelectorIdioma />
    </ProveedorIdioma>,
  );

describe("SelectorIdioma de la barra superior", () => {
  it("son dos enlaces con ?lang, lang, hreflang y nombre accesible", () => {
    const html = dibujar("es");
    expect(html.match(/<a /g)).toHaveLength(2);
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Idioma · Language"');
    expect(html).toContain('href="/tribus?lang=es"');
    expect(html).toContain('href="/tribus?lang=en"');
    expect(html).toContain('lang="es"');
    expect(html).toContain('lang="en"');
    expect(html).toContain('hrefLang="es"');
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain("ES · Español");
    expect(html).toContain("EN · English");
  });

  it("marca con aria-current solo el idioma actual, también con subrayado", () => {
    const en = dibujar("en");
    expect(en.match(/aria-current="true"/g)).toHaveLength(1);
    expect(en).toMatch(/href="\/tribus\?lang=en"[^>]*aria-current="true"|aria-current="true"[^>]*href="\/tribus\?lang=en"/);
    expect(en).toContain("underline");
    const es = dibujar("es");
    expect(es).toMatch(/href="\/tribus\?lang=es"[^>]*aria-current="true"|aria-current="true"[^>]*href="\/tribus\?lang=es"/);
    expect(es.match(/aria-current="true"/g)).toHaveLength(1);
  });
});
