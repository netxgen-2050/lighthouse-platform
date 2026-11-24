import { expect, test } from "./fixtura";

// Explorar (explorar-unificado): Territorio, Barrio Norte y Lotes en una sola página. Los totales por estado y la obra
// ya los prueba e2e/barrio-norte.spec.ts (apuntado a /explorar); acá va lo propio de la unión.

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("héroe con sello, tres secciones en orden y sin montos de la obra", async ({ page }) => {
    const r = await page.goto("/explorar");
    expect(r?.status()).toBe(200);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("venta simulada · aprobación municipal pendiente")).toBeVisible();
    await expect(page.getByText("Imagen ilustrativa", { exact: true })).toBeVisible();
    // Un solo héroe: la foto no se repite en las secciones.
    await expect(page.locator('img[src*="lighthouse-valle"]')).toHaveCount(1);
    const ids = await page.locator("main section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["territorio", "barrio", "lotes"]);
    await expect(page.locator("#territorio").getByRole("heading", { level: 2, name: "Territorio" })).toBeVisible();
    await expect(page.locator("#barrio").getByRole("heading", { level: 2, name: "Barrio Norte" })).toBeVisible();
    await expect(page.locator("#lotes").getByRole("heading", { level: 2, name: "Lotes", exact: true })).toBeVisible();
    await expect(page.getByText("Los números de la obra se ven con una cuenta.")).toBeVisible();
    // La aprobación municipal nunca se muestra como otorgada.
    await expect(page.locator("#territorio")).not.toContainText(/aprobación municipal:\s*(otorgada|aprobada)/i);
  });

  test("el menú marca Explorar y no Inicio", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/explorar");
    const rail = page.getByRole("navigation", { name: "Principal" });
    await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
    await expect(rail.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("navigation", { name: "Comunidades" })).toHaveCount(0);
  });

  test("la barra de secciones salta y marca la sección con aria-current", async ({ page }) => {
    await page.goto("/explorar");
    const barra = page.getByRole("navigation", { name: "Secciones de Explorar" });
    await expect(barra.getByRole("link")).toHaveText(["Territorio", "Barrio Norte", "Lotes"]);
    for (const nombre of ["Territorio", "Barrio Norte", "Lotes"]) {
      const caja = await barra.getByRole("link", { name: nombre }).boundingBox();
      expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    await barra.getByRole("link", { name: "Lotes" }).click();
    await expect(page).toHaveURL(/#lotes$/);
    await expect(barra.getByRole("link", { name: "Lotes" })).toHaveAttribute("aria-current", "location");
    await expect(barra.getByRole("link", { name: "Territorio" })).not.toHaveAttribute("aria-current", "location");
    await expect(page.locator("#lotes")).toBeInViewport();
    // La barra queda pegada al bajar.
    const arriba = await barra.evaluate((el) => el.getBoundingClientRect().top);
    expect(arriba).toBeLessThan(60);
    await barra.getByRole("link", { name: "Barrio Norte" }).click();
    await expect(barra.getByRole("link", { name: "Barrio Norte" })).toHaveAttribute("aria-current", "location");
  });

  test("la lista de lotes enlaza cada ficha", async ({ page }) => {
    await page.goto("/explorar#lotes");
    const primero = page.locator("#lotes").getByRole("link", { name: /^Lote \d+/ }).first();
    await expect(primero).toHaveAttribute("href", /^\/lotes\/lote-/);
    await expect(page.locator("#lotes").getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute(
      "href",
      "/lotes/hibrido",
    );
  });

  test("las URL viejas redirigen con los parámetros del mapa", async ({ page }) => {
    await page.goto("/territorios/lighthouse?vista=ahora&sel=barrio-6");
    await expect(page).toHaveURL(/\/explorar\?vista=ahora&sel=barrio-6/);
    await expect(page.getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "true");
    await page.goto("/barrios/norte");
    await expect(page).toHaveURL(/\/explorar#barrio$/);
    await page.goto("/lotes");
    await expect(page).toHaveURL(/\/explorar#lotes$/);
  });

  test("/lotes/hibrido y las fichas no redirigen y marcan Explorar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lotes/hibrido");
    await expect(page).toHaveURL(/\/lotes\/hibrido$/);
    const rail = page.getByRole("navigation", { name: "Principal" });
    await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
    await expect(rail.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current", "page");
  });

  test("a 390 px no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explorar");
    await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });

  test("en inglés se ve en inglés", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
    await page.goto("/explorar");
    await expect(page.getByRole("heading", { level: 1, name: "Explore Lighthouse" })).toBeVisible();
    const barra = page.getByRole("navigation", { name: "Explore sections" });
    await expect(barra.getByRole("link")).toHaveText(["Territory", "Barrio Norte", "Lots"]);
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
  });

});

test.describe("con sesión", () => {
  test("el panel de la obra aparece en /explorar#barrio", async ({ page }) => {
    await page.goto("/explorar#barrio");
    await expect(page.getByRole("heading", { level: 2, name: "La obra del barrio" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver la obra" })).toHaveCount(0);
  });
});
