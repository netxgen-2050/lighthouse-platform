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
import { Indicador } from "@/components/ui/indicador";
import { CurvaDevolucion } from "./curva-devolucion";
import { FILAS_VISIBLES, filtrarLibroBarrio, LibroBarrio } from "./libro-barrio";

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
  const t = textos("invertir", "es").libro;
  const filasDe = (h: string) => {
    const tbody = h.slice(h.indexOf("<tbody>"), h.indexOf("</tbody>"));
    return (tbody.match(/<tr/g) ?? []).length;
  };

  test("la tabla trae una fila por movimiento, con 'mes N', motivo y monto", () => {
    const filas = norte.libro.map((f) => ({
      fecha: t.mes(enteroEn(f.mes, "es")),
      motivo: t.motivos[f.motivo],
      monto: f.monto === null ? null : usdEn(f.monto, "es"),
    }));
    const h = html(<TablaLibro titulo={t.titulo} filas={filas} />);
    expect(filasDe(h)).toBe(norte.libro.length);
    expect(h).toContain("mes 3");
    expect(h).toContain(t.motivos.devolucion);
    expect(h).toContain(t.titulo);
  });

  test("hay más movimientos que las 8 filas visibles, así que el libro se pagina", () => {
    expect(norte.libro.length).toBeGreaterThan(FILAS_VISIBLES);
  });

  test("muestra 8 filas y el enlace 'Ver todo el libro (N movimientos)'", () => {
    const h = html(<LibroBarrio libro={norte.libro} />);
    expect(filasDe(h)).toBe(FILAS_VISIBLES);
    expect(h).toContain(t.verTodo(enteroEn(norte.libro.length, "es")));
  });

  test("abierto muestra todos los movimientos", () => {
    expect(filasDe(html(<LibroBarrio libro={norte.libro} abiertoInicial />))).toBe(norte.libro.length);
  });

  test("el filtro deja solo los movimientos del tipo elegido", () => {
    const comun = filtrarLibroBarrio(norte.libro, "comun");
    expect(comun.length).toBeGreaterThan(0);
    expect(comun.every((m) => m.motivo === "comun")).toBe(true);
    expect(filtrarLibroBarrio(norte.libro, "todo")).toHaveLength(norte.libro.length);
  });

  test("las pastillas del filtro llevan aria-pressed y 'Todo' arranca elegida", () => {
    const h = html(<LibroBarrio libro={norte.libro} />);
    expect(h).toContain(`aria-label="${t.filtro}"`);
    expect(h.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(h.match(/aria-pressed="false"/g)).toHaveLength(3);
  });
});

describe("Indicador del pool", () => {
  test("el grande va en mono a 40 px y 'sin dato' sigue siendo texto, no 0", () => {
    const grande = html(<Indicador etiqueta="Meta" valor="USD 1" mono tamano="grande" />);
    expect(grande).toContain("text-[40px]");
    expect(grande).toContain("font-mono");
    const sinDato = html(<Indicador etiqueta="Juntado" valor={null} mono tamano="chico" />);
    expect(sinDato).toContain("sin dato");
    expect(sinDato).toContain("text-xl");
  });
});

describe("Avisos de Invertir", () => {
  test("el aviso es una sola línea con 'no es una oferta' y sin las tres etiquetas de antes", () => {
    const t = textos("invertir", "es").aviso;
    expect(t.texto("v0.1")).toBe("Propuesta v0.1 en discusión · no es una oferta");
    expect(Object.keys(textos("invertir", "es"))).not.toContain("sellos");
  });
});
