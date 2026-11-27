import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/idioma/cliente", async () => {
  const { textos } = await import("@/lib/idioma/textos");
  return { useTextos: (zona: "explorar") => textos(zona, "es"), useIdioma: () => "es" as const };
});

import { listarLotes } from "@/lib/territorios/loteo";
import { PlanoLote, puntosDelPlano } from "./plano-lote";
import { TarjetaLote } from "./tarjeta-lote";

const lote = listarLotes().find((l) => l.superficieM2 !== undefined)!;

describe("TarjetaLote", () => {
  it("dice el número, la superficie y el estado en texto, con un solo enlace a la ficha", () => {
    const html = renderToStaticMarkup(<TarjetaLote lote={lote} estado="reservado" />);
    expect(html).toContain(`Lote ${lote.numero}`);
    expect(html).toContain("m²");
    expect(html).toContain("Reservado");
    expect(html).toContain('data-estado="reservado"');
    expect([...html.matchAll(/<a /g)]).toHaveLength(1);
    expect(html).toContain(`href="/lotes/${lote.id}"`);
  });

  it("marca la tarjeta elegida con aria-current", () => {
    expect(renderToStaticMarkup(<TarjetaLote lote={lote} estado="disponible" seleccionada />)).toContain('aria-current="true"');
    expect(renderToStaticMarkup(<TarjetaLote lote={lote} estado="disponible" />)).not.toContain("aria-current");
  });

  it("el precio sale marcado como ejemplo y el plano es decorativo", () => {
    const html = renderToStaticMarkup(<TarjetaLote lote={lote} estado="disponible" />);
    expect(html).toMatch(/desde .* · ejemplo/);
    expect(html).toContain('aria-hidden="true"');
  });

  it("sin superficie dice sin dato y no inventa precio", () => {
    const html = renderToStaticMarkup(<TarjetaLote lote={{ ...lote, superficieM2: undefined }} estado="disponible" />);
    expect(html).toContain("sin dato");
    expect(html).not.toContain("ejemplo");
  });
});

describe("PlanoLote", () => {
  it("normaliza el polígono dentro del cuadrado, con aire", () => {
    const pts = puntosDelPlano(lote.anillo, 64, 4)
      .split(" ")
      .flatMap((p) => p.split(",").map(Number));
    expect(pts.length).toBe(lote.anillo.length * 2);
    for (const n of pts) {
      expect(n).toBeGreaterThanOrEqual(4 - 0.1);
      expect(n).toBeLessThanOrEqual(60 + 0.1);
    }
  });

  it("sin polígono no dibuja nada", () => {
    expect(puntosDelPlano([[0, 0], [1, 1]])).toBe("");
    expect(renderToStaticMarkup(<PlanoLote anillo={[]} />)).not.toContain("<polygon");
  });
});
