import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import type { ErrorLectura, Lectura, RepositorioConsultas } from "@/lib/fogon/consultas/repositorio";
import { ErrorDeLectura } from "./error-lectura";

// Un repositorio falso que siempre falla con el error que se le pide: las pantallas muestran lo que corresponde.
function repositorioQueFalla(error: ErrorLectura): RepositorioConsultas {
  const mal = async (): Promise<Lectura<never>> => ({ ok: false, error });
  return {
    listar: mal,
    abrir: mal,
    guardarReparto: async () => ({ ok: false, error: "falla" }),
    cerrar: async () => ({ ok: false }),
  };
}

async function pantalla(error: ErrorLectura) {
  const lectura = await repositorioQueFalla(error).abrir("u1");
  if (lectura.ok) throw new Error("no debía salir bien");
  return renderToStaticMarkup(<ErrorDeLectura error={lectura.error} />);
}

describe("ErrorDeLectura", () => {
  test("consulta que no existe", async () => {
    const html = await pantalla("no-encontrada");
    expect(html).toContain("No encontramos esta consulta");
    expect(html).toContain('role="alert"');
  });
  test("sin sesión: invita a entrar", async () => {
    const html = await pantalla("sin-sesion");
    expect(html).toContain("Entrá");
    expect(html).toContain(">Entrar<");
    expect(html).toContain('role="alert"');
  });
  test("falla de carga: aviso con role alert, sin listas ni números", async () => {
    const html = await pantalla("falla");
    expect(html).toContain("No pudimos cargar las consultas. Probá de nuevo.");
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<ul");
    expect(html).not.toMatch(/\b0\b/);
  });
});
