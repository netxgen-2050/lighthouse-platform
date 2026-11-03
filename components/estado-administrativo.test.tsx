import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { EstadoAdministrativo } from "./estado-administrativo";

// Quita las etiquetas y junta los espacios: lo que ve una persona.
const texto = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("EstadoAdministrativo", () => {
  test("Norte completo: supuesto de trabajo, no otorgada, y todo lo demás sin dato", () => {
    const t = texto(renderToStaticMarkup(<EstadoAdministrativo proyecto="lighthouse-norte" />));
    expect(t).toContain("Lighthouse VRN · sector norte");
    expect(t).toContain("supuesto de trabajo, no otorgada");
    expect(t).toContain("Titular: sin dato");
    expect(t).toContain("Expediente: sin dato");
    expect(t).toContain("Fecha: sin dato");
    expect(t).not.toContain("Aprobación municipal: aprobada");
    expect(t).not.toMatch(/aprobada/);
  });

  test("Norte compacto", () => {
    const t = texto(renderToStaticMarkup(<EstadoAdministrativo proyecto="lighthouse-norte" compacto />));
    expect(t).toContain("Loteo provisorio · Aprobación municipal: supuesto de trabajo, no otorgada");
  });

  test("Norte en inglés dice not granted", () => {
    const t = texto(renderToStaticMarkup(<EstadoAdministrativo proyecto="lighthouse-norte" idioma="en" />));
    expect(t).toContain("not granted");
    expect(t).toContain("Holder: no data");
    expect(t).not.toContain("Aprobación municipal");
  });

  test("Norte usa el ⚖ loteonorte (completo y compacto), con su aviso de borrador", () => {
    for (const compacto of [false, true]) {
      const html = renderToStaticMarkup(<EstadoAdministrativo proyecto="lighthouse-norte" compacto={compacto} />);
      expect(html).toContain("Loteo provisorio de Lighthouse VRN");
      expect(html).not.toContain("Estado del loteo");
    }
    const en = renderToStaticMarkup(<EstadoAdministrativo proyecto="lighthouse-norte" idioma="en" />);
    expect(en).toContain("Provisional subdivision of Lighthouse VRN");
  });

  test("Soluna no cambia", () => {
    const t = texto(renderToStaticMarkup(<EstadoAdministrativo proyecto="soluna" />));
    expect(t).toContain("Aprobación municipal: pendiente");
    expect(t).toContain("Titular: BioPueblo");
    expect(t).toContain("Expediente: sin dato");
  });
});
