import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./neon-auth-cliente", () => ({ clienteNeonAuth: () => ({}) }));

import { BotonGoogle } from "./boton-google";
import { FormularioLogin } from "./formulario-login";

// No hay Testing Library ni jsdom en el repo: se prueba el marcado y se llama al manejador del elemento directamente.
// El clic real, Enter en el email y el foco los cubre e2e/login-neon-auth.spec.ts.
describe("BotonGoogle", () => {
  it("tiene como nombre accesible 'Continuar con Google' y el logo no aporta nombre", () => {
    const html = renderToStaticMarkup(<BotonGoogle ocupado={false} onClick={() => {}} />);
    expect(html).toContain("<span>Continuar con Google</span>");
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);
    expect(html).not.toContain("<title");
    expect(html).not.toContain("aria-label");
    // Los cuatro trazos de colores del logo.
    expect(html.match(/<path fill="#[0-9A-Fa-f]{6}"/g)).toHaveLength(4);
  });

  it("usa tokens del tema, sin colores sueltos en el botón", () => {
    const html = renderToStaticMarkup(<BotonGoogle ocupado={false} onClick={() => {}} />);
    expect(html).toContain("bg-google-fondo");
    expect(html).toContain("border-google-borde");
    expect(html).toContain("text-google-texto");
    expect(html).toContain("h-10");
  });

  it("con ocupado marca aria-disabled y el clic no llama al manejador", () => {
    const onClick = vi.fn();
    const html = renderToStaticMarkup(<BotonGoogle ocupado onClick={onClick} />);
    expect(html).toContain('aria-disabled="true"');
    BotonGoogle({ ocupado: true, onClick }).props.onClick();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("sin ocupado, el clic llama al manejador una vez", () => {
    const onClick = vi.fn();
    BotonGoogle({ ocupado: false, onClick }).props.onClick();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("FormularioLogin, paso del email", () => {
  const html = renderToStaticMarkup(<FormularioLogin alEntrar={() => {}} alCancelar={() => {}} />);

  it("pone Google primero, luego el separador 'o', el email y 'Mandame el código'", () => {
    const orden = ["Continuar con Google", ">o</p>", "Tu email", "Mandame el código"].map((t) => html.indexOf(t));
    expect(orden.every((i) => i >= 0)).toBe(true);
    expect([...orden].sort((a, b) => a - b)).toEqual(orden);
  });

  it("el botón de Google no está dentro del formulario 'Entrar con un código por email'", () => {
    const inicio = html.indexOf('<form');
    const fin = html.indexOf("</form>");
    expect(html.indexOf("Continuar con Google")).toBeLessThan(inicio);
    expect(html.slice(inicio, fin)).not.toContain("Google");
    expect(html.slice(inicio, fin)).toContain('aria-label="Entrar con un código por email"');
  });

  it("ya no tiene el texto ni el botón viejos", () => {
    expect(html).not.toContain("O entrá con tu cuenta de Google");
    expect(html).not.toContain("Entrar con Google");
  });
});
