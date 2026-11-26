import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import { TablaDecisiones } from "./tabla-decisiones";

// Hoy las ocho decisiones están abiertas, así que el e2e no ve el caso "decidida": acá se cubre con una fila decidida.
describe("TablaDecisiones", () => {
  const html = renderToStaticMarkup(
    <ProveedorIdioma idioma="es">
      <TablaDecisiones
        caption="Las decisiones"
        columnas={{ pregunta: "Decisión", recomendacion: "Recomendación", estado: "Estado" }}
        filas={[
          { id: "d1", pregunta: "¿Una?", recomendacion: "Sí.", estado: "abierta" },
          { id: "d2", pregunta: "¿Dos?", recomendacion: "No.", estado: "decidida", detalleEstado: "decidida el 1 de diciembre de 2026 por Gus" },
        ]}
      />
    </ProveedorIdioma>,
  );

  it("la línea de quién y cuándo decidió se lee a 16 px (sin text-sm)", () => {
    const m = /<span([^>]*)>decidida el 1 de diciembre de 2026 por Gus<\/span>/.exec(html);
    expect(m).not.toBeNull();
    expect(m![1]).not.toContain("text-sm");
    expect(m![1]).not.toContain("text-xs");
  });

  it("cada fila lleva su chip de estado", () => {
    expect(html).toContain('data-estado="abierta"');
    expect(html).toContain('data-estado="decidida"');
  });
});
