import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PasoAlta } from "./paso-alta";

const dibujar = (modo: "entrar" | "alta", formulario?: React.ReactNode) =>
  renderToStaticMarkup(<PasoAlta abierto modo={modo} alAceptar={() => true} alCancelar={() => {}} formulario={formulario} />);

describe("PasoAlta (casillas-una-sola-vez)", () => {
  it("Entrar abre el formulario sin casillas y avisa que la primera vez se pide aceptar después", () => {
    const html = dibujar("entrar", <p>formulario de login</p>);
    expect(html).toContain("Entrar");
    expect(html).toContain("formulario de login");
    expect(html).toContain("Si es tu primera vez, después te pedimos aceptar la política y los términos.");
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain("cada vez que entrás");
  });

  it("Crear tu cuenta sigue mostrando las casillas antes del login", () => {
    const html = dibujar("alta");
    expect(html).toContain("Crear tu cuenta");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("Aceptar y crear mi cuenta");
  });

  it("Crear tu cuenta, ya aceptado, dice que aceptó y deja elegir cómo entrar", () => {
    const html = dibujar("alta", <p>formulario de login</p>);
    expect(html).toContain("Aceptaste la política y los términos. Ahora elegí cómo entrar.");
  });
});
