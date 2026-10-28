import { RUTAS_TRADUCIDAS } from "@/lib/idioma/rutas";
import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

const html = (page: Page) => page.locator("html");
const barra = (page: Page) => page.getByRole("banner");
const selector = (page: Page) => barra(page).getByRole("group", { name: "Idioma · Language" });
const cookieIdioma = async (page: Page) => (await page.context().cookies()).find((c) => c.name === "lh-idioma")?.value;

// ===== (a) Elegir el idioma sin cuenta =====

test.describe("sin cuenta", () => {
  test.use({ rol: "ninguno" });

  test("(a) EN en la barra pone el marco en inglés sin cambiar la dirección, y sigue al recargar", async ({ page }) => {
    await page.goto("/tribus");
    await expect(html(page)).toHaveAttribute("lang", "es");
    await selector(page).getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/tribus$/);
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Tribes" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText("Prototype under development. Sample data.");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
    expect(await cookieIdioma(page)).toBe("en");
    await page.reload();
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(selector(page).getByRole("link", { name: "EN · English" })).toHaveAttribute("aria-current", "true");
  });

  test("(a) con teclado: Tab hasta EN y Enter", async ({ page }) => {
    await page.goto("/tribus");
    await selector(page).getByRole("link", { name: "EN · English" }).focus();
    await page.keyboard.press("Enter");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(selector(page).getByRole("link", { name: "EN · English" })).toHaveAttribute("aria-current", "true");
    await expect(selector(page).getByRole("link", { name: "ES · Español" })).not.toHaveAttribute("aria-current", "true");
  });

  test("(a) el selector es un enlace con ?lang y funciona en otra pestaña", async ({ page }) => {
    await page.goto("/tribus");
    await expect(selector(page).getByRole("link", { name: "EN · English" })).toHaveAttribute("href", "/tribus?lang=en");
    await expect(selector(page).getByRole("link", { name: "ES · Español" })).toHaveAttribute("href", "/tribus?lang=es");
  });

  test("(b) ?lang=en con UTM y ancla termina sin el parámetro y en inglés", async ({ page }) => {
    await page.goto("/sumarte?lang=en&utm_source=mail#planes");
    await expect(page).toHaveURL(/\/sumarte\?utm_source=mail#planes$/);
    await expect(html(page)).toHaveAttribute("lang", "en");
    expect(await cookieIdioma(page)).toBe("en");
  });

  test("(b) ?lang=fr se quita y el idioma no cambia", async ({ page }) => {
    await page.goto("/tribus?lang=fr");
    await expect(page).toHaveURL(/\/tribus$/);
    await expect(html(page)).toHaveAttribute("lang", "es");
    expect(await cookieIdioma(page)).toBeUndefined();
  });

  test("(b) ?lang no manda a otro sitio", async ({ page }) => {
    await page.goto("/tribus?lang=en&next=https://otro.example.com");
    const final = new URL(page.url());
    expect(final.host).toBe(new URL(test.info().project.use.baseURL ?? page.url()).host);
    expect(final.pathname).toBe("/tribus");
  });

  test("(d) una página sin traducir en inglés: aviso y contenido en español con lang es", async ({ page }) => {
    // /privacidad es pública y todavía no se tradujo (la traduce `idioma-legal`).
    await page.goto("/privacidad?lang=en");
    const aviso = page.getByText("This page is only available in Spanish for now.");
    await expect(aviso).toBeVisible();
    await expect(aviso).toHaveAttribute("lang", "en");
    await expect(page.locator('main [lang="es"]').first()).toBeVisible();
    await expect(page.locator('main [lang="es"] h1')).toHaveCount(1);
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("(d) una dirección que no existe, en inglés, no muestra el aviso de sin traducir", async ({ page }) => {
    await page.goto("/tribus/no-existe?lang=en");
    await expect(html(page)).toHaveAttribute("lang", "en");
    // El aviso queda en el DOM pero oculto por CSS cuando la página es un 404 (ya traducido).
    await expect(page.getByText("This page is only available in Spanish for now.")).not.toBeVisible();
    await expect(page.locator("[data-no-encontrada]")).toBeVisible();
  });

  test("(a) el enlace del selector sigue la query cambiada sin navegar, al acercar el puntero y al enfocar", async ({ page }) => {
    await page.goto("/tribus");
    const en = selector(page).getByRole("link", { name: "EN · English" });
    await page.evaluate(() => window.history.replaceState(null, "", "/tribus?sel=valle"));
    await selector(page).hover();
    await expect(en).toHaveAttribute("href", "/tribus?sel=valle&lang=en");
    await page.evaluate(() => window.history.replaceState(null, "", "/tribus?sel=otro"));
    await selector(page).getByRole("link", { name: "ES · Español" }).focus();
    await expect(en).toHaveAttribute("href", "/tribus?sel=otro&lang=en");
    // Una query con lang propio no lo duplica.
    await page.evaluate(() => window.history.replaceState(null, "", "/tribus?lang=fr&sel=x"));
    // El puntero ya estaba dentro: se saca y se vuelve a meter para que dispare la entrada.
    await page.mouse.move(0, 400);
    await selector(page).hover();
    await expect(en).toHaveAttribute("href", "/tribus?sel=x&lang=en");
  });

  test("(d) una página traducida no lleva el aviso", async ({ page }) => {
    await page.goto("/congreso/en");
    await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
  });

  test("(h) 390 px en inglés: sin desborde y la barra muestra Join, Sign in y el selector", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const ruta of ["/", "/tribus", "/sumarte"]) {
      await page.goto(`${ruta}?lang=en`);
      await expect(selector(page)).toBeVisible();
      await expect(barra(page).getByRole("link", { name: "Join" })).toBeVisible();
      await expect(barra(page).getByRole("button", { name: "Sign in" })).toBeVisible();
      const caja = (await barra(page).boundingBox())!;
      expect(caja.height).toBeLessThanOrEqual(56);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `desborde en ${ruta}`).toBe(false);
    }
  });
});

// ===== (c) Convivencia con /congreso/en =====

test.describe("el Congreso", () => {
  test.use({ rol: "ninguno" });

  test("(c) con inglés elegido, /congreso va a /congreso/en sin pasar por el español", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
    const respuestas: { estado: number; url: string }[] = [];
    page.on("response", (r) => {
      if (r.request().resourceType() === "document") respuestas.push({ estado: r.status(), url: new URL(r.url()).pathname });
    });
    await page.goto("/congreso?utm_source=x#entradas");
    await expect(page).toHaveURL(/\/congreso\/en\?utm_source=x#entradas$/);
    expect(respuestas.filter((r) => r.url === "/congreso").map((r) => r.estado)).not.toContain(200);
    await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "en");
  });

  test("(c) /congreso/en con español elegido sigue en inglés y no cambia lo elegido", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "es", url: baseURL! }]);
    await page.goto("/congreso/en");
    await expect(page).toHaveURL(/\/congreso\/en$/);
    await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "en");
    expect(await cookieIdioma(page)).toBe("es");
  });

  test("(c) /congreso?lang=en y /congreso/en?lang=es cambian de dirección", async ({ page }) => {
    await page.goto("/congreso?lang=en&utm_source=x");
    await expect(page).toHaveURL(/\/congreso\/en\?utm_source=x$/);
    await page.goto("/congreso/en?lang=es");
    await expect(page).toHaveURL(/\/congreso$/);
    await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
  });

  test("(c) el selector del Congreso cambia el marco de la plataforma", async ({ page }) => {
    await page.goto("/congreso");
    await page.locator(".tema-evento").getByRole("group", { name: "Idioma · Language" }).getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/congreso\/en$/);
    await expect(html(page)).toHaveAttribute("lang", "en");
    await page.goto("/tribus");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Tribes" })).toBeVisible();
  });

  test("(c) el selector de la barra en el Congreso lleva a la dirección del idioma", async ({ page }) => {
    await page.goto("/congreso?utm_source=x#tribus");
    // El enlace toma la query de la dirección al hidratar: con ella lista, el clic ya lo maneja el script (sin hidratar,
    // el enlace sigue su href y pierde query y ancla, como sin JavaScript).
    await expect(selector(page).getByRole("link", { name: "EN · English" })).toHaveAttribute("href", /utm_source=x/);
    await selector(page).getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/congreso\/en\?utm_source=x#tribus$/);
    await expect(selector(page).getByRole("link", { name: "ES · Español" })).toHaveAttribute("href", /utm_source=x/);
    await selector(page).getByRole("link", { name: "ES · Español" }).click();
    await expect(page).toHaveURL(/\/congreso\?utm_source=x#tribus$/);
  });
});

// ===== (e) Recorrido: nada en español suelto en el marco =====

const PAGINAS = [
  "/",
  "/tribus",
  "/tribus/valle",
  "/tribus/valle/manifiesto",
  "/tribus/grano/postular",
  "/territorios/lighthouse",
  "/sumarte",
  "/pactos",
  "/semillas",
  "/fogon",
  "/compromisos",
  "/canales",
  "/perfil",
  "/pasaporte",
  "/panel",
  "/configuracion",
  "/bandeja",
  "/mis-datos",
  "/privacidad",
  "/congreso/en",
];

test.describe("en inglés, el marco no deja español suelto", () => {
  test.use({ locale: "en-US" });

  for (const ruta of PAGINAS) {
    test(`(e) ${ruta}`, async ({ page }) => {
      await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
      await page.goto(ruta);
      await expect(html(page)).toHaveAttribute("lang", "en");
      await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      for (const zona of ["nav", "header", "footer"]) {
        expect(await textosEnEspanol(page, zona), `${ruta}: español suelto en <${zona}>`).toEqual([]);
      }
      // Las páginas ya traducidas tampoco pueden dejar español suelto en el contenido.
      if (RUTAS_TRADUCIDAS.some((r) => r.test(ruta))) {
        expect(await textosEnEspanol(page, "main"), `${ruta}: español suelto en <main>`).toEqual([]);
      }
    });
  }
});

// ===== (f) Configuración =====

test("(f) Configuración → English pone el marco en inglés y el selector marca EN", async ({ page }) => {
  await page.goto("/configuracion");
  await page.getByRole("radio", { name: "English" }).check();
  await expect(html(page)).toHaveAttribute("lang", "en");
  await expect(selector(page).getByRole("link", { name: "EN · English" })).toHaveAttribute("aria-current", "true");
});

// ===== (g) Recuperar el idioma de la persona =====

test("(g) una persona con inglés guardado entra desde un navegador sin cookie (en español) y termina en inglés", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-configuracion") === null) {
      window.localStorage.setItem("lh-configuracion", JSON.stringify({ idiomaElegido: "en" }));
    }
  });
  expect(await cookieIdioma(page)).toBeUndefined();
  await page.goto("/tribus");
  await expect(html(page)).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  expect(await cookieIdioma(page)).toBe("en");
});

test("(g) lo elegido en el navegador gana y se guarda en la persona", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "es", url: baseURL! }]);
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-configuracion") === null) {
      window.localStorage.setItem("lh-configuracion", JSON.stringify({ idiomaElegido: "en" }));
    }
  });
  await page.goto("/tribus");
  await expect(html(page)).toHaveAttribute("lang", "es");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("lh-configuracion"))).toContain('"idiomaElegido":"es"');
});

test("(g) elegir el idioma con sesión lo guarda en las preferencias de la persona", async ({ page }) => {
  await page.goto("/tribus");
  await selector(page).getByRole("link", { name: "EN · English" }).click();
  await expect(html(page)).toHaveAttribute("lang", "en");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("lh-configuracion"))).toContain('"idiomaElegido":"en"');
});

// ===== (i) Idioma inicial según el navegador =====

for (const [locale, esperado] of [
  ["en-US", "en"],
  ["pt-BR", "en"],
  ["es-ES", "es"],
  ["es-AR", "es"],
] as const) {
  test.describe(`navegador en ${locale}`, () => {
    test.use({ locale });

    test(`(i) sin idioma elegido la plataforma se ve en ${esperado} y no queda ninguna cookie`, async ({ page }) => {
      await page.goto("/");
      await expect(html(page)).toHaveAttribute("lang", esperado);
      expect(await cookieIdioma(page)).toBeUndefined();
      expect(await page.evaluate(() => window.localStorage.getItem("lh-configuracion"))).toBeNull();
    });
  });
}

test.describe("navegador en inglés con español elegido", () => {
  test.use({ locale: "en-US" });

  test("(i) lo elegido gana sobre lo detectado", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "es", url: baseURL! }]);
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("lang", "es");
  });
});

// ===== (j) Glosario =====

test("(j) con la plataforma en inglés, el rail dice Semillas y no Seeds", async ({ page }) => {
  await page.goto("/?lang=en");
  const rail = page.getByRole("navigation", { name: "Main" });
  await expect(rail.getByRole("link", { name: "Semillas" })).toBeVisible();
  await expect(rail.getByRole("link", { name: "Semillas" }).locator("span[translate='no']")).toHaveCount(1);
  await expect(rail.getByText("Seeds")).toHaveCount(0);
  await expect(rail.getByRole("link", { name: "Fireside" })).toBeVisible();
  await expect(rail.getByRole("link", { name: "Join" })).toBeVisible();
  await expect(rail.getByText("Discover", { exact: true })).toBeVisible();
});
