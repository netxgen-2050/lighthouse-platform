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

test("encabezado con la marca", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toContainText("NetX");
  await expect(page.getByRole("banner")).toContainText("Tribus · Territorios regenerativos");
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

test("portada con titular y botón a /tribus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Encontrá tu tribu\.\s*Construí en común\./);
  await page.getByRole("link", { name: "Ver las tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
});
