import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import type { Idioma } from "@/lib/idioma/tipos";

const ruta = vi.hoisted(() => ({ actual: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => ruta.actual }));

import { Aviso } from "./aviso";
import { CintaPrototipo, esRutaDeVenta } from "./cinta-prototipo";

const html = (nodo: ReactNode, idioma: Idioma = "es") =>
  renderToStaticMarkup(<ProveedorIdioma idioma={idioma}>{nodo}</ProveedorIdioma>);

describe("Aviso", () => {
  test("es una nota con texto e ícono, sin borde punteado", () => {
    const h = html(<Aviso tono="info">Datos de ejemplo</Aviso>);
    expect(h).toContain('role="note"');
    expect(h).toContain("Datos de ejemplo");
    expect(h).toContain("<svg");
    expect(h).toContain('aria-hidden="true"');
    expect(h).not.toContain("dashed");
  });
  test("cada tono se marca en el DOM y tiene su propio ícono", () => {
    const iconos = new Set<string>();
    for (const tono of ["info", "atencion", "legal"] as const) {
      const h = html(<Aviso tono={tono}>x</Aviso>);
      expect(h).toContain(`data-tono="${tono}"`);
      iconos.add(/<svg[^>]*class="([^"]*)"/.exec(h)?.[1] ?? "");
    }
    expect(iconos.size).toBe(3);
  });
  test("atención y legal usan el fondo de advertencia; info, la superficie", () => {
    expect(html(<Aviso tono="atencion">x</Aviso>)).toContain("bg-warn-bg");
    expect(html(<Aviso tono="legal">x</Aviso>)).toContain("bg-warn-bg");
    expect(html(<Aviso tono="info">x</Aviso>)).toContain("bg-surface-2");
  });
  test("muestra el enlace opcional", () => {
    expect(html(<Aviso enlace={<a href="/x">Ver más</a>}>x</Aviso>)).toContain('href="/x"');
  });
});

describe("CintaPrototipo", () => {
  test("general: solo el aviso de prototipo", () => {
    ruta.actual = "/mi-recorrido";
    const h = html(<CintaPrototipo />);
    expect(h).toContain('role="note"');
    expect(h).toContain("Prototipo interno · datos de ejemplo");
    expect(h).not.toContain("aprobación municipal");
  });
  test("en rutas de venta suma venta simulada y aprobación pendiente, nunca otorgada", () => {
    ruta.actual = "/explorar";
    const h = html(<CintaPrototipo />);
    expect(h).toContain("venta simulada · aprobación municipal pendiente");
    expect(h).not.toMatch(/otorgada|aprobada/);
  });
  test("en inglés", () => {
    ruta.actual = "/invertir";
    const h = html(<CintaPrototipo />, "en");
    expect(h).toContain("Internal prototype · sample data");
    expect(h).toContain("simulated sale · municipal approval pending");
  });
  test("qué rutas son de venta", () => {
    expect(esRutaDeVenta("/lotes/norte-1")).toBe(true);
    expect(esRutaDeVenta("/mi-tierra")).toBe(true);
    expect(esRutaDeVenta("/")).toBe(false);
    expect(esRutaDeVenta("/explorarx")).toBe(false);
    expect(esRutaDeVenta(null)).toBe(false);
  });
});
