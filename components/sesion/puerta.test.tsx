import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Una página que todavía no está en `RUTAS_TRADUCIDAS`.
let ruta = "/fogon";
vi.mock("next/navigation", () => ({
  usePathname: () => ruta,
  useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
}));
vi.mock("./contexto", () => ({ useSesion: () => ({ estado: "sin-sesion", consentimiento: "cargando" }) }));

import { ProveedorIdioma, useIdioma, useIdiomaDePlataforma } from "@/lib/idioma/cliente";
import type { Idioma } from "@/lib/idioma/tipos";
import { Contenido } from "./puerta";

function Sonda() {
  return (
    <span>
      contenido={useIdioma()};plataforma={useIdiomaDePlataforma()}
    </span>
  );
}

const dibujar = (idioma: Idioma) =>
  renderToStaticMarkup(
    <ProveedorIdioma idioma={idioma}>
      <Contenido>
        <Sonda />
      </Contenido>
    </ProveedorIdioma>,
  );

beforeEach(() => {
  ruta = "/fogon";
});

describe("página sin traducir con la plataforma en inglés", () => {
  it("muestra el aviso y envuelve el contenido en lang es", () => {
    const html = dibujar("en");
    expect(html).toContain("This page is only available in Spanish for now.");
    expect(html).toContain('<p lang="en"');
    expect(html).toContain('<div lang="es">');
  });

  it("dentro del envoltorio el idioma del contenido es español y el de la plataforma sigue en inglés", () => {
    const html = dibujar("en");
    expect(html).toContain("contenido=es;plataforma=en");
  });
});

describe("el resto de los casos no se toca", () => {
  it("en español no hay aviso ni envoltorio", () => {
    const html = dibujar("es");
    expect(html).not.toContain("only available in Spanish");
    expect(html).not.toContain('lang="es"');
    expect(html).toContain("contenido=es;plataforma=es");
  });

  it("una página traducida en inglés tampoco", () => {
    ruta = "/congreso/en";
    const html = dibujar("en");
    expect(html).not.toContain("only available in Spanish");
    expect(html).not.toContain('lang="es"');
    expect(html).toContain("contenido=en;plataforma=en");
  });
});
