import { expect, test } from "@playwright/test";

test("navegar de la portada a Tribus marca aria-current", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("en una tribu, Tribus sigue marcado", async ({ page }) => {
  await page.goto("/tribus/valle");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("el rail trae la marca y los destinos existentes en orden", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeVisible();
  await expect(nav.locator("xpath=..").locator("p").getByText("NetX", { exact: true })).toBeVisible();
  const textos = (await nav.getByRole("link").allInnerTexts()).map((t) => t.trim());
  const orden = ["Inicio", "Territorio", "Tribus", "Perfil", "Compromisos", "Fogón", "Congreso", "Sumarte", "Mi recorrido", "NetX"];
  expect(textos).toEqual(orden.filter((o) => textos.includes(o)));
  expect(textos).toEqual(expect.arrayContaining(["Inicio", "Tribus", "Perfil", "Congreso"]));
});

test("el rail está a la izquierda en computadora", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const caja = await page.getByRole("navigation", { name: "Principal" }).boundingBox();
  expect(caja!.x).toBe(0);
  expect(caja!.width).toBeLessThanOrEqual(80);
});

test("celular 390 x 844: rail a la izquierda, 72 px o menos, sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/tribus", "/tribus/valle", "/perfil", "/congreso"]) {
    await page.goto(ruta);
    const nav = page.getByRole("navigation", { name: "Principal" });
    const caja = await nav.boundingBox();
    expect(caja!.x).toBe(0);
    expect(caja!.width).toBeLessThanOrEqual(72);
    await expect(nav.getByRole("link", { name: "Inicio" })).toBeVisible();
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(desborde, `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("Tab: primero Saltar al contenido y después Inicio en el rail", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Inicio" })).toBeFocused();
});

for (const ruta of ["/", "/tribus", "/tribus/valle"]) {
  test(`saltar al contenido es el primer foco y mueve el foco al main en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.keyboard.press("Tab");
    const salto = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(salto).toBeFocused();
    await expect(salto).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });
}

test("las fuentes del mock-up se aplican (texto y títulos)", async ({ page }) => {
  await page.goto("/tribus");
  const familia = (selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await familia("body")).toContain("Figtree");
  expect(await familia("h1")).toContain("Anek Latin");
});

for (const ruta of ["/", "/tribus", "/tribus/grano"]) {
  test(`pie visible en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const pie = page.getByRole("contentinfo");
    await expect(pie).toContainText("Prototipo en desarrollo. Datos de ejemplo.");
    // El año lo resuelve el navegador; se compara en el navegador para no depender del reloj del runner.
    const anio = await page.evaluate(() => String(new Date().getFullYear()));
    await expect(pie).toContainText(anio);
  });
}

test("el HTML del servidor ya trae un año en el pie (sin JS)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/©(?:<!-- -->)? ?(?:<!-- -->)?\d{4}/);
});

test("portada con titular y botón a /tribus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Encontrá tu tribu\.\s*Construí en común\./);
  await page.getByRole("link", { name: "Ver las tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
});
