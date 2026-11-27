import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { EstadosAdministrativos } from "./estados-administrativos";

const texto = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const cuenta = (html: string, parte: string) => html.split(parte).length - 1;

describe("EstadosAdministrativos", () => {
  test("agrupa los proyectos en un solo bloque legal, cada uno con su region y su aria-label de siempre", () => {
    const h = renderToStaticMarkup(<EstadosAdministrativos proyectos={["soluna", "lighthouse-norte"]} />);
    expect(cuenta(h, 'data-tono="legal"')).toBe(1);
    expect(h).toContain('aria-label="Estado administrativo · Chacras de Soluna"');
    expect(h).toContain('aria-label="Estado administrativo · Lighthouse VRN"');
    expect(cuenta(h, "<section")).toBe(2);
  });

  test("mismo texto que el estado suelto: Norte no otorgada y sin dato, Soluna pendiente", () => {
    const t = texto(renderToStaticMarkup(<EstadosAdministrativos proyectos={["soluna", "lighthouse-norte"]} />));
    expect(t).toContain("supuesto de trabajo, no otorgada");
    expect(t).toContain("Aprobación municipal: pendiente");
    expect(t).toContain("Expediente: sin dato");
    expect(t).not.toMatch(/aprobada/);
  });

  test("el bloque no repite un role propio: las regiones son las que se anuncian", () => {
    const h = renderToStaticMarkup(<EstadosAdministrativos proyectos={["lighthouse-norte"]} />);
    expect(h).not.toContain('role="note"');
  });

  test("en inglés Norte sale en inglés y Soluna sigue en español", () => {
    const h = renderToStaticMarkup(<EstadosAdministrativos proyectos={["soluna", "lighthouse-norte"]} idioma="en" />);
    expect(h).toContain('aria-label="Administrative status · Lighthouse VRN"');
    expect(h).toContain('aria-label="Estado administrativo · Chacras de Soluna"');
    expect(texto(h)).toContain("not granted");
  });
});
