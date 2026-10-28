import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
let sesion: { estado: string; sesion: { rol: string } | null } = { estado: "ok", sesion: { rol: "superadmin" } };
vi.mock("./sesion/contexto", () => ({ useSesion: () => sesion }));
let pendientes: number | null | undefined = 3;
vi.mock("@/lib/admin/usar-pendientes", () => ({ usePendientes: () => pendientes }));

import { RailAdmin } from "./rail-admin";

const dibujar = () =>
  renderToStaticMarkup(<RailAdmin href="/admin" etiqueta="Admin" titulo="Interno" icono={<svg data-icono />} />);

beforeEach(() => {
  sesion = { estado: "ok", sesion: { rol: "superadmin" } };
  pendientes = 3;
});

describe("RailAdmin", () => {
  it("con rol persona no dibuja nada, ni un candado", () => {
    sesion = { estado: "ok", sesion: { rol: "persona" } };
    expect(dibujar()).toBe("");
  });
  it("mientras la sesión carga no dibuja nada", () => {
    sesion = { estado: "cargando", sesion: null };
    expect(dibujar()).toBe("");
  });
  it("con super admin dibuja el enlace a /admin", () => {
    const html = dibujar();
    expect(html).toContain('href="/admin"');
    expect(html).toContain("Admin");
  });
  it("con 3 pendientes: texto 3 y nombre 'Admin, 3 pendientes'", () => {
    const html = dibujar();
    expect(html).toContain('aria-label="Admin, 3 pendientes"');
    expect(html).toContain(">3<");
  });
  it("con 0 pendientes: sin pastilla", () => {
    pendientes = 0;
    const html = dibujar();
    expect(html).toContain('aria-label="Admin"');
    expect(html).not.toContain("rounded-full border border-on-deep-muted");
  });
  it("sin dato (null): lo dice, no es 0", () => {
    pendientes = null;
    const html = dibujar();
    expect(html).toContain("sin dato");
    expect(html).toContain('aria-label="Admin, pendientes sin dato"');
  });
  it("sin leer todavía (undefined): sin pastilla", () => {
    pendientes = undefined;
    expect(dibujar()).not.toContain("sin dato");
  });
});
