import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Una página que todavía no está en `RUTAS_TRADUCIDAS`.
let rutaActual = "/fogon/consultas";
vi.mock("next/navigation", () => ({
  usePathname: () => rutaActual,
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
}));
vi.mock("./contexto", () => ({ useSesion: () => ({ estado: "sin-sesion", consentimiento: "cargando" }) }));

import { TerminoLegal } from "@/components/termino-legal";
import { ProveedorIdioma } from "@/lib/idioma/cliente";
import { Contenido } from "./puerta";

const dibujar = (idioma: "es" | "en", ruta: string) => {
  rutaActual = ruta;
  return renderToStaticMarkup(
    <ProveedorIdioma idioma={idioma}>
      <Contenido>
        <TerminoLegal clave="membresia" />
      </Contenido>
    </ProveedorIdioma>,
  );
};

describe("Contenido: página sin traducir con la plataforma en inglés", () => {
  it("muestra el aviso y deja la página marcada como español", () => {
    const html = dibujar("en", "/fogon/consultas");
    expect(html).toContain("This page is only available in Spanish for now.");
    expect(html).toContain('<div lang="es">');
  });

  it("una página ya traducida no lleva aviso ni envoltorio", () => {
    const html = dibujar("en", "/tribus");
    expect(html).not.toContain("only available in Spanish");
    expect(html).not.toContain('<div lang="es">');
  });

  it("el ⚖ de esa página sale en español, sin versión inglesa", () => {
    const html = dibujar("en", "/fogon/consultas");
    expect(html).toContain("Qué significa legalmente: Membresía de la red");
    expect(html).not.toContain("What it means legally");
  });

  it("en español no hay aviso ni envoltorio", () => {
    const html = dibujar("es", "/fogon/consultas");
    expect(html).not.toContain("only available in Spanish");
    expect(html).not.toContain('lang="es"');
  });

  it("el aviso se oculta si lo que sigue es la pantalla de no encontrado", () => {
    // La pantalla de 404 ya está traducida: lleva `data-no-encontrada` y el aviso trae la regla que lo esconde.
    expect(dibujar("en", "/fogon/no-existe")).toContain("has-[+div_[data-no-encontrada]]:hidden");
  });
});
