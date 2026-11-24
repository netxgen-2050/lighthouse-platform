import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, test } from "vitest";
import { TablaLibro } from "@/components/ui/tabla-libro";
import { enteroEn } from "@/lib/bien-comun/formato";
import { barriosEnFinanciamiento, curvaPorTrimestre } from "@/lib/invertir/barrios";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import { textos } from "@/lib/idioma/textos";
import { usdEn } from "@/lib/lotes/formato";
import type { Idioma } from "@/lib/idioma/tipos";
import { CurvaDevolucion } from "./curva-devolucion";

const html = (nodo: ReactNode, idioma: Idioma = "es") =>
  renderToStaticMarkup(<ProveedorIdioma idioma={idioma}>{nodo}</ProveedorIdioma>);
const norte = barriosEnFinanciamiento()[0];

describe("CurvaDevolucion", () => {
  const t = textos("invertir", "es").curva;
  const h = html(<CurvaDevolucion curva={norte.curva} />);

  test("tiene título 'caso de ejemplo' y descripción para el lector de pantalla", () => {
    expect(h).toContain('role="img"');
    expect(h).toMatch(/<title[^>]*>Curva de devolución · caso de ejemplo<\/title>/);
    expect(h).toContain(t.descripcion);
    expect(h).toMatch(/aria-labelledby="[^"]+ [^"]+"/);
  });

  test("distingue las dos series por el trazo, no solo por el color", () => {
    expect(h).toContain('stroke-dasharray="6 5"');
    expect(h).toContain("stroke-green");
    expect(h).toContain("stroke-ink");
  });

  test("llega hasta el final del horizonte: la tabla trae el último trimestre", () => {
    const ultimo = norte.curva.at(-1)!;
    expect(h).toContain(t.mes(enteroEn(ultimo.mes, "es")));
  });

  test("las filas de la tabla son las de la curva por trimestre", () => {
    const filas = curvaPorTrimestre(norte.curva);
    const tbody = h.slice(h.indexOf("<tbody>"), h.indexOf("</tbody>"));
    expect((tbody.match(/<tr/g) ?? []).length).toBe(filas.length);
    for (const p of filas) {
      expect(tbody).toContain(t.mes(enteroEn(p.mes, "es")));
      expect(tbody).toContain(usdEn(p.devuelto, "es"));
    }
  });

  test("sin curva no dibuja nada, ni 0", () => {
    expect(html(<CurvaDevolucion curva={[]} />)).toBe("");
  });

  test("en inglés usa los textos en inglés", () => {
    expect(html(<CurvaDevolucion curva={norte.curva} />, "en")).toContain("Repayment curve · sample case");
  });
});

describe("Libro del barrio", () => {
  test("la tabla trae una fila por movimiento, con 'mes N', motivo y monto", () => {
    const t = textos("invertir", "es").libro;
    const filas = norte.libro.map((f) => ({
      fecha: t.mes(enteroEn(f.mes, "es")),
      motivo: t.motivos[f.motivo],
      monto: f.monto === null ? null : usdEn(f.monto, "es"),
    }));
    const h = html(<TablaLibro titulo={t.titulo} filas={filas} />);
    const tbody = h.slice(h.indexOf("<tbody>"), h.indexOf("</tbody>"));
    expect((tbody.match(/<tr/g) ?? []).length).toBe(norte.libro.length);
    expect(tbody).toContain("mes 3");
    expect(tbody).toContain(t.motivos.devolucion);
    expect(h).toContain(t.titulo);
  });
});
