import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SelloBilletera } from "./sello-billetera";

describe("SelloBilletera", () => {
  it("no dibuja nada sin billetera", () => {
    expect(renderToStaticMarkup(<SelloBilletera billetera={null} />)).toBe("");
  });

  it("muestra el sello obtenido con la dirección abreviada", () => {
    const html = renderToStaticMarkup(<SelloBilletera billetera="0x1234567890abcdef1234567890abcdef12345678" />);
    expect(html).toContain("Billetera creada");
    expect(html).toContain("Obtenido");
    expect(html).toContain("0x1234…5678");
    expect(html).toContain('data-sello="billetera"');
    expect(html).not.toContain("0x1234567890abcdef");
  });
});
