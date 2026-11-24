import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/lotes/hibrido" }));
vi.mock("./sesion/contexto", () => ({ useSesion: () => ({ estado: "ok", sesion: { rol: "persona" } }) }));

import { MenuCelular } from "./menu-celular";

// Sin Testing Library ni jsdom en el repo (y sin dependencias nuevas en este cambio): acá se prueba el marcado inicial;
// abrir, elegir, Escape y el foco de vuelta los cubre e2e/marco.spec.ts en un navegador real.
const items = [
  { href: "/", etiqueta: "Explorar", icono: <svg />, secciones: ["/lotes"] },
  { href: "/sumarte", etiqueta: "Sumarte", icono: <svg /> },
];
const dibujar = () =>
  renderToStaticMarkup(
    <MenuCelular
      items={items}
      admin={{ href: "/admin", etiqueta: "Admin", icono: <svg /> }}
      etiquetaMenu="Menú"
      etiquetaNavegacion="Principal"
    />,
  );

it("cerrado: botón Menú con aria-expanded en falso y sin panel", () => {
  const html = dibujar();
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('aria-controls="menu-celular"');
  expect(html).toContain("Menú");
  expect(html).not.toContain("<nav");
  expect(html).not.toContain("Admin");
});

it("solo se ve por debajo de 768 px", () => {
  expect(dibujar()).toContain("md:hidden");
});
