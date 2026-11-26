import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { caminosDePortada } from "@/lib/portada";
import { CaminosPublico } from "./caminos-publico";
import { DibujoCapital } from "./dibujos";
import { FranjaCapitales } from "./franja-capitales";
import { FranjaCifras } from "./franja-cifras";
import { FranjaPilares } from "./franja-pilares";

describe("franja de pilares", () => {
  test("tres columnas con dibujo decorativo, título y texto", () => {
    const html = renderToStaticMarkup(
      <FranjaPilares
        pilares={[
          { id: "agua", titulo: "Agua.", texto: "a" },
          { id: "trabajo", titulo: "Trabajo.", texto: "b" },
          { id: "comunidad", titulo: "Comunidad.", texto: "c" },
        ]}
      />,
    );
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(3);
    expect(html.match(/<h2/g)).toHaveLength(3);
    expect(html).toContain("sm:grid-cols-3");
  });
});

describe("franja de cifras", () => {
  const cifra = { id: "lluvia", valor: "VALOR", texto: "de lluvia", fuente: "FUENTE" };

  test("muestra el valor tal como llega, con su fuente debajo, sobre surface-2", () => {
    const html = renderToStaticMarkup(<FranjaCifras titulo="Cifras del sitio" etiquetaFuente="Fuente" cifras={[cifra]} />);
    expect(html).toContain("bg-surface-2");
    expect(html).toContain("VALOR");
    expect(html).toContain("Fuente: <span lang=\"es\">FUENTE</span>");
  });

  test("sin cifras no dibuja nada (el dato que falta no es cero)", () => {
    expect(renderToStaticMarkup(<FranjaCifras titulo="x" etiquetaFuente="Fuente" cifras={[]} />)).toBe("");
  });
});

describe("franja de capitales", () => {
  test("una fila desplazable con snap, un ítem por capital y la fuente al final", () => {
    const capitales = ["natural", "humano", "social", "construido", "financiero"].map((id) => ({ id, nombre: id, texto: "t" }));
    const html = renderToStaticMarkup(<FranjaCapitales titulo="Capitales" etiquetaFuente="Fuente" fuente="FUENTE" capitales={capitales} />);
    expect(html).toContain("snap-x");
    expect(html).toContain('tabindex="0"');
    expect(html.match(/<h3/g)).toHaveLength(5);
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(5);
    expect(html.indexOf("FUENTE")).toBeGreaterThan(html.lastIndexOf("</ul>"));
  });

  test("los cinco dibujos son distintos", () => {
    const dibujos = ["natural", "humano", "social", "construido", "financiero"].map((id) => renderToStaticMarkup(<DibujoCapital id={id} />));
    expect(new Set(dibujos).size).toBe(5);
  });
});

describe("caminos por público", () => {
  test("cada camino es un solo enlace y el recomendado se marca una vez", () => {
    const caminos = caminosDePortada();
    const html = renderToStaticMarkup(
      <CaminosPublico idTitulo="x" titulo="Por dónde empezar" caminos={caminos} recomendadoId="invertir" textoRecomendado="Recomendado para vos" />,
    );
    expect(html.match(/<a /g)).toHaveLength(3);
    expect(html.match(/Recomendado para vos/g)).toHaveLength(1);
    expect(html).toContain('href="/invertir"');
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)).toHaveLength(3);
  });
});
