import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/lotes/hibrido" }));
vi.mock("./sesion/contexto", () => ({ useSesion: () => ({ estado: "ok", sesion: { rol: "persona" } }) }));

import { ProveedorIdioma } from "@/lib/idioma/cliente";
import { BarraInferiorCliente } from "./barra-inferior-cliente";

// Sin Testing Library ni jsdom en el repo: acá se prueba el marcado inicial; abrir Más, Escape, el foco de vuelta y el
// arrastre los cubre e2e/marco.spec.ts y e2e/barra-inferior.spec.ts en un navegador real.
const i = (href: string, etiqueta: string, secciones?: string[]) => ({ href, etiqueta, icono: <svg />, secciones });
const barra = [i("/", "Inicio"), i("/explorar", "Explorar", ["/lotes"]), i("/participa", "Participa"), i("/invertir", "Invertir"), i("/mi-tierra", "Mi tierra")];
const dibujar = () =>
  renderToStaticMarkup(
    <ProveedorIdioma idioma="es">
      <BarraInferiorCliente
        barra={barra}
        mas={[i("/bien-comun", "Bien común"), i("/sumarte", "Sumarte")]}
        persona={[{ href: "/perfil", etiqueta: "Perfil", icono: <svg /> }]}
        admin={i("/admin", "Admin")}
        etiquetaNavegacion="Principal"
      />
    </ProveedorIdioma>,
  );

it("dibuja los cinco destinos y Más, con la navegación nombrada", () => {
  const html = dibujar();
  expect(html).toContain('aria-label="Principal"');
  for (const n of ["Inicio", "Explorar", "Participa", "Invertir", "Mi tierra", "Más"]) expect(html).toContain(n);
  expect(html.match(/<li /g)).toHaveLength(6);
});

it("marca como actual el destino cuya sección contiene la ruta, y solo ese", () => {
  const html = dibujar();
  expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  expect(html).toMatch(/href="\/explorar"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/explorar"/);
  expect(html).toContain("font-bold");
});

it("cada ítem mide al menos 48 px y la barra solo se ve por debajo de 768 px", () => {
  const html = dibujar();
  expect(html.match(/min-h-12/g)).toHaveLength(6);
  expect(html).toContain("md:hidden");
  expect(html).toContain("safe-area-inset-bottom");
});

it("cerrada no dibuja la hoja Más (ni Admin)", () => {
  const html = dibujar();
  expect(html).toContain('aria-expanded="false"');
  expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain("Admin");
});
