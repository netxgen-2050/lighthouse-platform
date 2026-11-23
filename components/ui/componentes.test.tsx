import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import type { Idioma } from "@/lib/idioma/tipos";
import { BarraAvance, tonoDeAvance } from "./barra-avance";
import { ChipEstado, ESTADOS_CHIP } from "./chip-estado";
import { Indicador } from "./indicador";
import { PanelVidrio } from "./panel-vidrio";
import { SelloPrototipo } from "./sello-prototipo";
import { TablaLibro } from "./tabla-libro";

const html = (nodo: ReactNode, idioma: Idioma = "es") =>
  renderToStaticMarkup(<ProveedorIdioma idioma={idioma}>{nodo}</ProveedorIdioma>);

describe("Indicador", () => {
  test("muestra el número con su etiqueta, la etiqueta antes en el DOM", () => {
    const h = html(<Indicador etiqueta="Lotes disponibles" valor="12" />);
    expect(h).toContain("<dt");
    expect(h.indexOf("Lotes disponibles")).toBeLessThan(h.indexOf(">12<"));
  });
  test("sin número dice 'sin dato', nunca 0", () => {
    const h = html(<Indicador etiqueta="Lotes disponibles" valor={null} />);
    expect(h).toContain("sin dato");
    expect(h).not.toContain(">0<");
    expect(html(<Indicador etiqueta="Lots" valor={null} />, "en")).toContain("no data");
  });
  test("mono pide monoespaciada", () => {
    expect(html(<Indicador etiqueta="x" valor="1" mono />)).toContain("font-mono");
  });
});

describe("tonoDeAvance", () => {
  test("quintos", () => {
    expect([0, 0.19, 0.2, 0.39, 0.4, 0.45, 0.6, 0.79, 0.8, 1].map(tonoDeAvance)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
  test("el tono sigue al porcentaje redondeado que se ve, también cerca de 20, 40, 60 y 80", () => {
    expect([0.199, 0.195, 0.194].map(tonoDeAvance)).toEqual([2, 2, 1]);
    expect([0.399, 0.394].map(tonoDeAvance)).toEqual([3, 2]);
    expect([0.599, 0.594].map(tonoDeAvance)).toEqual([4, 3]);
    expect([0.799, 0.794].map(tonoDeAvance)).toEqual([5, 4]);
  });
  test("con 0,199 se ve '20 %' y el tono de 20 % (no terracota)", () => {
    const h = html(<BarraAvance etiqueta="Obra" fraccion={0.199} />);
    expect(h).toContain(">20 %<");
    expect(h).toContain("bg-regen-2");
    expect(h).not.toContain("bg-regen-1");
  });
  test("sin dato o fuera de rango no tiene tono", () => {
    for (const f of [null, -0.1, 1.3, NaN, Infinity]) expect(tonoDeAvance(f)).toBeNull();
  });
});

describe("BarraAvance", () => {
  test("45 %: tono oliva, porcentaje visible y valores para el lector", () => {
    const h = html(<BarraAvance etiqueta="Obra del barrio" fraccion={0.45} />);
    expect(h).toContain('role="meter"');
    expect(h).toContain('aria-label="Obra del barrio"');
    expect(h).toContain('aria-valuenow="45"');
    expect(h).toContain('aria-valuemin="0"');
    expect(h).toContain('aria-valuemax="100"');
    expect(h).toContain('aria-valuetext="45 %"');
    expect(h).toContain("bg-regen-3");
    expect(h).toContain(">45 %<");
  });
  test("el lector no oye dos veces etiqueta y porcentaje: la fila visible va aria-hidden y el meter los trae", () => {
    const h = html(<BarraAvance etiqueta="Obra" fraccion={0.5} />);
    expect(h).toMatch(/<div aria-hidden="true" class="flex items-baseline/);
    expect(h).toContain('aria-label="Obra"');
    expect(h).toContain('aria-valuetext="50 %"');
  });
  test("sin dato la fila visible sí se lee", () => {
    expect(html(<BarraAvance etiqueta="Obra" fraccion={null} />)).not.toMatch(/<div aria-hidden="true" class="flex items-baseline/);
  });
  test("0 es un avance real: relleno vacío pero con 0 % y tono terracota", () => {
    const h = html(<BarraAvance etiqueta="Obra" fraccion={0} />);
    expect(h).toContain('aria-valuenow="0"');
    expect(h).toContain("bg-regen-1");
  });
  test("sin fracción o fuera de rango: 'sin dato' y ningún relleno", () => {
    for (const f of [null, 1.3, -0.2]) {
      const h = html(<BarraAvance etiqueta="Obra" fraccion={f} />);
      expect(h).toContain("sin dato");
      expect(h).not.toContain("role=\"meter\"");
      expect(h).not.toContain("bg-regen");
    }
  });
});

describe("PanelVidrio", () => {
  test("usa la clase de vidrio y el contenido", () => {
    const h = html(<PanelVidrio>Hola</PanelVidrio>);
    expect(h).toContain("panel-vidrio");
    expect(h).toContain("Hola");
  });
  test("con transparencia reducida (o sin desenfoque) el fondo es el sólido de la superficie", () => {
    const css = readFileSync(path.resolve(__dirname, "..", "..", "app", "globals.css"), "utf8");
    // Base sin @supports: fondo sólido.
    expect(css).toMatch(/\.panel-vidrio \{\s*background: var\(--color-surface\);/);
    // El vidrio solo se aplica dentro de @supports de backdrop-filter...
    expect(css).toMatch(/@supports \(backdrop-filter: blur\(1px\)\)[^{]*\{\s*\.panel-vidrio \{\s*background: var\(--color-vidrio\);/);
    // ...y prefers-reduced-transparency lo vuelve a la superficie sólida y quita el desenfoque.
    expect(css).toMatch(
      /@media \(prefers-reduced-transparency: reduce\) \{\s*\.panel-vidrio \{\s*background: var\(--color-surface\);\s*-webkit-backdrop-filter: none;\s*backdrop-filter: none;/,
    );
  });
});

describe("TablaLibro", () => {
  test("título, encabezados y filas", () => {
    const h = html(
      <TablaLibro
        titulo="Movimientos"
        filas={[
          { fecha: "2026-11-01", motivo: "Reserva", monto: "USD 500" },
          { fecha: "2026-11-02", motivo: "Cuota", monto: null },
        ]}
      />,
    );
    expect(h).toContain("<caption");
    expect(h).toContain("Movimientos");
    expect(h.match(/<th scope="col"/g)).toHaveLength(3);
    expect(h).toContain("Fecha");
    expect(h).toContain("Motivo");
    expect(h).toContain("Monto");
    expect(h).toContain("USD 500");
    expect(h).toContain("sin dato");
    expect(h.match(/<tbody>.*<\/tbody>/)![0].match(/<tr/g)).toHaveLength(2);
  });
  test("el contenedor se desplaza solo y no es parada de Tab mientras no desborda", () => {
    const h = html(<TablaLibro titulo="Movimientos" filas={[]} />);
    expect(h).toContain("overflow-x-auto");
    expect(h).not.toContain("tabindex");
    expect(h).toContain('data-desborda="false"');
  });
});

describe("SelloPrototipo", () => {
  test("general: solo el aviso", () => {
    const h = html(<SelloPrototipo />);
    expect(h).toContain("Prototipo interno · datos de ejemplo");
    expect(h).not.toContain("aprobación municipal");
  });
  test("venta: suma venta simulada y aprobación pendiente", () => {
    const h = html(<SelloPrototipo variante="venta" />);
    expect(h).toContain("Prototipo interno · datos de ejemplo");
    expect(h).toContain("venta simulada · aprobación municipal pendiente");
    expect(h).not.toMatch(/otorgada|aprobada/);
  });
  test("en inglés", () => {
    expect(html(<SelloPrototipo variante="venta" />, "en")).toContain("simulated sale · municipal approval pending");
  });
});

describe("ChipEstado", () => {
  test("cada estado tiene texto e ícono propio", () => {
    const iconos = new Set<string>();
    for (const e of ESTADOS_CHIP) {
      const h = html(<ChipEstado estado={e} />);
      expect(h).toContain(`data-estado="${e}"`);
      expect(h).toContain("<svg");
      expect(h.replace(/<[^>]+>/g, "").trim().length).toBeGreaterThan(2);
      iconos.add(/class="([^"]*lucide[^"]*)"/.exec(h)?.[1] ?? e);
    }
    expect(iconos.size).toBe(ESTADOS_CHIP.length);
  });
  test("en cuotas en inglés", () => {
    expect(html(<ChipEstado estado="enCuotas" />, "en")).toContain("In instalments");
    expect(html(<ChipEstado estado="enCuotas" />)).toContain("En cuotas");
  });
  test("reservado y vendido se distinguen por texto", () => {
    expect(html(<ChipEstado estado="reservado" />)).toContain("Reservado");
    expect(html(<ChipEstado estado="vendido" />)).toContain("Vendido");
  });
});
