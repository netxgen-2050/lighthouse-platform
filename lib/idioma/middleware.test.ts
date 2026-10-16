import { describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { resolverIdioma } from "./middleware";

const u = (ruta: string) => new URL(`https://lh.test${ruta}`);
const destino = (r: ReturnType<typeof resolverIdioma>) => (r.redirigir ? r.redirigir.pathname + r.redirigir.search : null);

describe("resolverIdioma · ?lang=", () => {
  test("?lang=en con UTM: fija la cookie y redirige sin lang, con el resto de la query", () => {
    const r = resolverIdioma(u("/sumarte?lang=en&utm_source=mail"), undefined, null);
    expect(r.cookie).toBe("en");
    expect(destino(r)).toBe("/sumarte?utm_source=mail");
  });

  test("?lang=es en medio de otros parámetros", () => {
    const r = resolverIdioma(u("/tribus?a=1&lang=es&b=2"), "en", "en-US");
    expect(r.cookie).toBe("es");
    expect(destino(r)).toBe("/tribus?a=1&b=2");
  });

  test("?lang=fr: se quita sin tocar el idioma ni la cookie", () => {
    const r = resolverIdioma(u("/tribus?lang=fr"), "en", null);
    expect(r.cookie).toBeUndefined();
    expect(destino(r)).toBe("/tribus");
  });

  test("lang vacío también se quita", () => {
    const r = resolverIdioma(u("/tribus?lang="), undefined, null);
    expect(r.cookie).toBeUndefined();
    expect(destino(r)).toBe("/tribus");
  });

  test("/congreso?lang=en va a /congreso/en", () => {
    const r = resolverIdioma(u("/congreso?lang=en&utm_source=x"), undefined, "es-AR");
    expect(r.cookie).toBe("en");
    expect(destino(r)).toBe("/congreso/en?utm_source=x");
  });

  test("/congreso/en?lang=es va a /congreso", () => {
    const r = resolverIdioma(u("/congreso/en?lang=es"), undefined, "en-US");
    expect(r.cookie).toBe("es");
    expect(destino(r)).toBe("/congreso");
  });

  test("no se puede usar para salir del sitio", () => {
    const r = resolverIdioma(u("/sumarte?lang=en&next=https://otro.com"), undefined, null);
    expect(r.redirigir?.origin).toBe("https://lh.test");
    expect(destino(r)).toBe("/sumarte?next=https://otro.com");
    const r2 = resolverIdioma(u("/sumarte?lang=en&redirect=//otro.com"), undefined, null);
    expect(r2.redirigir?.origin).toBe("https://lh.test");
  });
});

describe("resolverIdioma · /congreso", () => {
  test("con cookie en: /congreso va a /congreso/en y conserva la query", () => {
    const r = resolverIdioma(u("/congreso?utm_source=x"), "en", "es-AR");
    expect(destino(r)).toBe("/congreso/en?utm_source=x");
    expect(r.cookie).toBeUndefined();
  });

  test("sin cookie y navegador en inglés: redirige y no escribe la cookie", () => {
    const r = resolverIdioma(u("/congreso"), undefined, "en-US");
    expect(destino(r)).toBe("/congreso/en");
    expect(r.cookie).toBeUndefined();
  });

  test("sin cookie y navegador en otro idioma: inglés", () => {
    expect(destino(resolverIdioma(u("/congreso"), undefined, "pt-BR"))).toBe("/congreso/en");
  });

  test("sin cookie y navegador en español: no redirige", () => {
    expect(resolverIdioma(u("/congreso"), undefined, "es-AR,es;q=0.9")).toEqual({});
  });

  test("con cookie es y navegador en inglés: no redirige", () => {
    expect(resolverIdioma(u("/congreso"), "es", "en-US")).toEqual({});
  });

  test("/congreso/en con cookie es: no redirige (la dirección explícita gana)", () => {
    expect(resolverIdioma(u("/congreso/en"), "es", "es-AR")).toEqual({});
  });

  test("una cookie inválida se ignora y manda el navegador", () => {
    expect(destino(resolverIdioma(u("/congreso"), "fr", "en-US"))).toBe("/congreso/en");
    expect(resolverIdioma(u("/congreso"), "fr", "es-AR")).toEqual({});
  });

  test("otras páginas no se redirigen nunca por idioma", () => {
    expect(resolverIdioma(u("/tribus"), "en", "en-US")).toEqual({});
    expect(resolverIdioma(u("/"), undefined, "en-US")).toEqual({});
  });

  test("la redirección que depende de la cookie no se guarda en cachés compartidas", () => {
    const r = resolverIdioma(u("/congreso"), "en", null);
    expect(r.cabeceras?.["Cache-Control"]).toBe("private, no-store");
    expect(r.cabeceras?.Vary).toBe("Cookie, Accept-Language");
  });
});

describe("middleware", () => {
  test("una excepción deja pasar el pedido", async () => {
    vi.resetModules();
    vi.doMock("@/lib/idioma/middleware", () => ({
      resolverIdioma: () => {
        throw new Error("falla");
      },
    }));
    const { middleware } = await import("../../middleware");
    const respuesta = middleware(new NextRequest("https://lh.test/congreso?lang=en"));
    expect(respuesta.headers.get("x-middleware-next")).toBe("1");
    expect(respuesta.status).toBe(200);
    vi.doUnmock("@/lib/idioma/middleware");
  });

  test("una redirección escribe la cookie y la deja sin caché", async () => {
    vi.resetModules();
    const { middleware } = await import("../../middleware");
    const respuesta = middleware(new NextRequest("https://lh.test/sumarte?lang=en&utm_source=m"));
    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe("https://lh.test/sumarte?utm_source=m");
    expect(respuesta.headers.get("cache-control")).toBe("private, no-store");
    expect(respuesta.cookies.get("lh-idioma")?.value).toBe("en");
  });
});
