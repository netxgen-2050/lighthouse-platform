import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/sesion/contexto", () => ({ useSesion: () => ({ estado: "sin-sesion", consentimiento: "cargando" }) }));

import { ProveedorIdioma } from "@/lib/idioma/cliente";
import type { BilingueConOriginal, Idioma } from "@/lib/idioma/tipos";
import { TextoBilingue } from "./texto-bilingue";

const dibujar = (idioma: Idioma, valor: BilingueConOriginal) =>
  renderToStaticMarkup(
    <ProveedorIdioma idioma={idioma}>
      <TextoBilingue valor={valor} />
    </ProveedorIdioma>,
  );

describe("TextoBilingue", () => {
  it("en inglés con original español: el texto en inglés y la nota 'Translated from Spanish'", () => {
    const html = dibujar("en", { es: "Cuidamos la tierra", en: "We look after the land", original: "es" });
    expect(html).toContain("We look after the land");
    expect(html).toContain("Translated from Spanish");
    expect(html).not.toContain("Cuidamos");
  });

  it("el original se supone español", () => {
    expect(dibujar("en", { es: "Hola", en: "Hello" })).toContain("Translated from Spanish");
  });

  it("en español con original español: el texto, sin nota", () => {
    const html = dibujar("es", { es: "Cuidamos la tierra", en: "We look after the land", original: "es" });
    expect(html).toContain("Cuidamos la tierra");
    expect(html).not.toContain("Translated");
    expect(html).not.toContain("Traducido");
  });

  it("en español con original inglés: la traducción y la nota 'Traducido del inglés'", () => {
    const html = dibujar("es", { es: "Cuidamos la tierra", en: "We look after the land", original: "en" });
    expect(html).toContain("Cuidamos la tierra");
    expect(html).toContain("Traducido del inglés");
  });

  it("en inglés con original inglés: sin nota", () => {
    const html = dibujar("en", { es: "Hola", en: "Hello", original: "en" });
    expect(html).toContain("Hello");
    expect(html).not.toContain("Translated");
  });

  it("sin inglés: el español con lang es, la marca ES y el texto para lectores de pantalla", () => {
    const html = dibujar("en", { es: "Cuidamos la tierra" });
    expect(html).toContain('<span lang="es">Cuidamos la tierra</span>');
    expect(html).toContain(">ES</span>");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("(only available in Spanish)");
  });

  it("un inglés vacío cuenta como faltante, nunca se muestra vacío", () => {
    const html = dibujar("en", { es: "Hola", en: "   " });
    expect(html).toContain('<span lang="es">Hola</span>');
  });

  it("en español no hace falta el inglés", () => {
    const html = dibujar("es", { es: "Hola" });
    expect(html).toContain("Hola");
    expect(html).not.toContain(">ES</span>");
  });
});
