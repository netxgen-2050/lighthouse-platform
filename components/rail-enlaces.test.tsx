import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

const ruta = vi.hoisted(() => ({ actual: "/pactos" }));
vi.mock("next/navigation", () => ({ usePathname: () => ruta.actual }));

import { RailEnlaces, claseEtiqueta, claseIcono } from "./rail-enlaces";

const items = [
  { href: "/pactos", etiqueta: "Pactos", icono: <svg data-i="p" /> },
  { href: "/semillas", etiqueta: "Semillas", icono: <svg data-i="s" /> },
];

describe("rail: destino actual", () => {
  test("el activo lleva píldora deep, ícono on-deep, etiqueta ink y negrita", () => {
    expect(claseIcono(true)).toContain("bg-deep");
    expect(claseIcono(true)).toContain("text-on-deep");
    expect(claseEtiqueta(true)).toContain("font-bold");
    expect(claseEtiqueta(true)).toContain("text-ink");
  });
  test("en reposo no hay píldora ni negrita; el fondo surface-2 aparece solo con hover", () => {
    expect(claseIcono(false)).not.toMatch(/(^|\s)bg-deep/);
    expect(claseIcono(false)).toContain("group-hover:bg-surface-2");
    expect(claseEtiqueta(false)).not.toContain("font-bold");
  });
  test("solo el destino actual tiene aria-current y la píldora", () => {
    ruta.actual = "/pactos";
    const h = renderToStaticMarkup(<RailEnlaces items={items} />);
    expect(h.match(/aria-current="page"/g)).toHaveLength(1);
    expect(h.match(/bg-deep/g)).toHaveLength(1);
    expect(h.match(/font-bold/g)).toHaveLength(1);
    expect(h.indexOf('aria-current="page"')).toBeLessThan(h.indexOf("Semillas"));
  });
});
