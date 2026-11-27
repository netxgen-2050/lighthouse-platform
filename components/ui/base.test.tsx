import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Boton } from "./boton";
import { EstadoVacio } from "./estado-vacio";
import { Esqueleto } from "./esqueleto";
import { destinoDeTecla, Pestanas } from "./pestanas";
import { Seccion } from "./seccion";

describe("Boton", () => {
  test("cada variante tiene su estilo", () => {
    expect(renderToStaticMarkup(<Boton>x</Boton>)).toContain("bg-deep");
    expect(renderToStaticMarkup(<Boton variante="secundario">x</Boton>)).toContain("border-line");
    expect(renderToStaticMarkup(<Boton variante="texto">x</Boton>)).toContain("hover:underline");
  });
  test("sin href es un button de tipo button; con href, un enlace", () => {
    expect(renderToStaticMarkup(<Boton>x</Boton>)).toMatch(/<button[^>]*type="button"/);
    const a = renderToStaticMarkup(<Boton href="/x">x</Boton>);
    expect(a).toMatch(/^<a [^>]*href="\/x"/);
    expect(a).not.toContain("<button");
  });
  test("tamaño s solo achica en compu; en celular conserva 44 px", () => {
    const s = renderToStaticMarkup(<Boton tamano="s">x</Boton>);
    expect(s).toContain("min-h-11");
    expect(s).toContain("sm:min-h-9");
  });
});

describe("Pestanas", () => {
  const items = [
    { clave: "a", etiqueta: "Uno" },
    { clave: "b", etiqueta: "Dos" },
  ];
  test("con paneles: tablist, tab seleccionada y solo ella en el orden de tabulación", () => {
    const h = renderToStaticMarkup(<Pestanas aria="Vistas" items={items} actual="b" />);
    expect(h).toContain('role="tablist"');
    expect(h).toContain('aria-label="Vistas"');
    expect(h.match(/role="tab"/g)).toHaveLength(2);
    expect(h).toMatch(/id="pestana-b"[^>]*aria-selected="true"[^>]*aria-controls="panel-b"[^>]*tabindex="0"/);
    expect(h).toMatch(/id="pestana-a"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
  });
  test("con href: nav con aria-current solo en la actual, y la activa en negrita", () => {
    const h = renderToStaticMarkup(
      <Pestanas
        aria="Secciones"
        actual="b"
        items={[
          { clave: "a", etiqueta: "Uno", href: "/uno" },
          { clave: "b", etiqueta: "Dos", href: "/dos" },
        ]}
      />,
    );
    expect(h).toContain("<nav");
    expect(h).not.toContain("tablist");
    expect(h.match(/aria-current="page"/g)).toHaveLength(1);
    expect(h).toMatch(/href="\/dos"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/dos"/);
    expect(h.match(/font-bold/g)).toHaveLength(1);
  });
  test("flechas, Inicio y Fin con vuelta", () => {
    expect(destinoDeTecla("ArrowRight", 1, 2)).toBe(0);
    expect(destinoDeTecla("ArrowLeft", 0, 2)).toBe(1);
    expect(destinoDeTecla("Home", 1, 3)).toBe(0);
    expect(destinoDeTecla("End", 0, 3)).toBe(2);
    expect(destinoDeTecla("a", 0, 3)).toBeNull();
  });
});

describe("EstadoVacio", () => {
  test("texto, acción y vista previa atenuada con su etiqueta", () => {
    const h = renderToStaticMarkup(
      <EstadoVacio
        titulo="Nada todavía"
        texto="Lo que hagas va a aparecer acá."
        accion={<Boton href="/x">Empezar</Boton>}
        vistaPrevia={<p>Fila de ejemplo</p>}
        etiquetaVistaPrevia="Así se va a ver"
        dibujo={<svg />}
      />,
    );
    expect(h).toContain("Nada todavía");
    expect(h).toContain("Lo que hagas va a aparecer acá.");
    expect(h).toContain('href="/x"');
    expect(h).toContain("Así se va a ver");
    expect(h).toContain("opacity-60");
    expect(h).toContain('aria-hidden="true"');
  });
  test("solo con texto no inventa título ni vista previa", () => {
    const h = renderToStaticMarkup(<EstadoVacio texto="Vacío" />);
    expect(h).not.toMatch(/<h\d/);
    expect(h).not.toContain("opacity-60");
  });
});

describe("Esqueleto", () => {
  test("avisa que está cargando: aria-busy y texto oculto", () => {
    const h = renderToStaticMarkup(<Esqueleto cargando="Cargando…" />);
    expect(h).toContain('aria-busy="true"');
    expect(h).toContain("sr-only");
    expect(h).toContain("Cargando…");
  });
  test("dibuja las líneas pedidas, ocultas al lector", () => {
    const h = renderToStaticMarkup(<Esqueleto lineas={4} />);
    expect(h.match(/esqueleto /g)).toHaveLength(4);
    expect(h).toContain("bg-surface-2");
  });
});

describe("Seccion", () => {
  test("h2 enlazado a la sección, bajada y sin caja", () => {
    const h = renderToStaticMarkup(
      <Seccion id="s1" titulo="Barrios" bajada="Dónde vivir">
        <p>contenido</p>
      </Seccion>,
    );
    expect(h).toContain('aria-labelledby="s1"');
    expect(h).toMatch(/<h2 id="s1"[^>]*>Barrios<\/h2>/);
    expect(h).toContain("Dónde vivir");
    expect(h).not.toMatch(/border|bg-surface/);
  });
});
