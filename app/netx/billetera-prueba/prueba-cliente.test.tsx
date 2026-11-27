import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/sesion/contexto", () => ({ useSesion: () => ({ cabeceras: async () => ({}) }) }));

import { PruebaCliente } from "./prueba-cliente";

const html = (simulado: boolean, faltaConfigurar: boolean) => renderToStaticMarkup(<PruebaCliente simulado={simulado} faltaConfigurar={faltaConfigurar} />);

/** El `<button …>` de un texto, para mirar sus atributos. */
function boton(markup: string, texto: string): string {
  const m = new RegExp(`<button[^>]*>${texto}</button>`).exec(markup);
  if (!m) throw new Error(`No hay botón "${texto}"`);
  return m[0];
}

describe("PruebaCliente: modo real sin configurar", () => {
  it("dice 'Falta configurar Candide (ver el guion)', no pasa al modo simulado y apaga la primera operación", () => {
    const h = html(false, true);
    expect(h).toContain("Falta configurar Candide (ver el guion)");
    expect(h).not.toContain("Modo simulado");
    expect(boton(h, "Hacer la primera operación")).toContain("disabled");
    expect(boton(h, "Firmar una constancia fuera de la cadena")).toContain("disabled");
  });

  it("configurado y real: sin ningún aviso de Candide", () => {
    const h = html(false, false);
    expect(h).not.toContain("Falta configurar Candide");
    expect(h).not.toContain("Modo simulado");
    expect(h).toContain("Base Sepolia, red de prueba: nada de esto tiene valor");
  });

  it("modo simulado: muestra el aviso", () => {
    expect(html(true, false)).toContain("Modo simulado: no se habla con Candide ni con la red");
  });

  it("sin passkey, los tiempos dicen 'sin dato' y nunca 0", () => {
    const h = html(true, false);
    expect(h).toContain("sin dato");
    expect(h).not.toMatch(/>0([,.]0)? s</);
  });
});
